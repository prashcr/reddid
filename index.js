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
  http.request(url, res => {
    var data = new Stream();
    res.on('data', chunk => data.push(chunk));
    res.on('end'
      , () => fs.writeFile(encodeURIComponent(url)
        , data.read()
        , () => console.log(url)));
  }).end();
}

getPosts(getImage);
