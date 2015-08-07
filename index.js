var fs = require('fs');
var path = require('path');
var http = require('http');
var Stream = require('stream').Transform;
var prog = process.argv.indexOf(path.resolve('.', './index.js'));
var subreddit = process.argv[prog + 1] || 'aww';
var category = process.argv[prog + 2] || 'hot';
var num = process.argv[prog + 3] || '25';
var url = 'http://www.reddit.com/r/' 
  + subreddit + '/' 
  + category + '.json'
  + '?limit=' + num;

function getPosts(cb) {
  http.get(url, res => {
    var body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
      var parsed = JSON.parse(body);
      parsed.data.children.forEach(cb);
    });
  }).on('error', err => console.error(err));
}

function getImage(post) {
  var url = post.data.url;
  var imgurImageRegex = /^https?\:\/\/(i\.)?imgur\.com\/([A-Z0-9]{7})(?:(\.jpg)|(\.gifv))?(?:\?1)?$/i;
  //var imgurAlbumRegex = /^http\:\/\/imgur\.com\/a\/[a-zA-Z0-9]{5}/;
  var m = url.match(imgurImageRegex);
  var ext;
 
  if (m) {  // If valid imgur image url
    if (~url.indexOf('https')) url = url.replace('https', 'http'); // If url is https, use http instead
    if (m[4]) ext = '.webm'; // If url is .gifv
    else {
      ext = '.jpg';
      if (!m[3]) url = url.replace(m[2], '$&.jpg'); // If jpg url doesn't contain .jpg  
    }
    if (!m[1]) url = url.replace('http://', 'http://i.'); // If url doesn't contain i.imgur
    var fileName = m[2] + ext;
  }
  else {
    console.log(url, ' could not be downloaded');
    return;
  }

  http.request(url, res => {
    var data = new Stream();
    res.on('data', chunk => data.push(chunk));
    res.on('end'
      , () => fs.writeFile(fileName
        , data.read()
        , () => console.log(url, ' was downloaded successfully')));
  }).end();
}

getPosts(getImage);
