'use strict';
var fs = require('fs');
var path = require('path');
var http = require('http');
var Stream = require('stream').Transform;
var chalk = require('chalk');

module.exports = (sub, cat, num) => {
  var url = 'http://www.reddit.com/r/' 
  + sub + '/' 
  + cat + '.json'
  + '?limit=' + num;

  getPosts(url, getImage);
}

function getPosts(url, cb) {
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
  var imgurImageRegex = /^https?\:\/\/(i\.)?imgur\.com\/([A-Z0-9]{5,8})((?:\.jpg)|(?:\.gifv)|(?:\.png)|(?:\.gif))?(?:\?1)?$/i;
  var imgurAlbumRegex = /^http\:\/\/imgur\.com\/a\/[a-zA-Z0-9]{5}/;
  var imgurImageMatch;
  var imgurAlbumMatch;
  var downloadUrl;
  var filename;
  var ext;
 
  if (imgurImageMatch = url.match(imgurImageRegex)) {
    downloadUrl = 'http://imgur.com/download/' + imgurImageMatch[2];
    ext = imgurImageMatch[3] || '.jpg';
    filename = imgurImageMatch[2] + ext;
  }
  else if (imgurAlbumMatch = url.match(imgurAlbumRegex)) {
    console.log(url, chalk.cyan(' Imgur albums'), chalk.red(' not yet supported'));
    return;
  }
  else if (~url.indexOf('imgur.com/gallery')) {
    console.log(url, chalk.cyan(' Imgur galleries'), chalk.red(' not yet supported'));
    return;
  }
  else if (~url.indexOf('pbs.twimg.com')) {
    console.log(url, chalk.cyan(' Twitter'), chalk.red(' not yet supported'));
    return;
  }
  else if (~url.indexOf('media.tumblr.com')) {
    console.log(url, chalk.cyan(' Tumblr'), chalk.red(' not yet supported'));
    return;
  }
  else if (~url.indexOf('gfycat.com')) {
    console.log(url, chalk.cyan(' Gfycat'), chalk.red(' not yet supported'));
    return;
  }
  else {
    console.log(url, chalk.red(' Unrecognized image url'));
    return;
  }

  http.request(downloadUrl, res => {
    var data = new Stream();
    res.on('data', chunk => data.push(chunk));
    res.on('end'
      , () => fs.writeFile(filename
        , data.read()
        , () => console.log(url, chalk.green(' downloaded successfully'))));
  }).end();
}
