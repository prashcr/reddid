'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');
const async = require('async');
const Stream = require('stream').Transform;
const chalk = require('chalk');

/* 
 * This is the main file, but CLI argument handling 
 * and creating an executable are delegated to cli.js
 */
module.exports = (sub, cat, num) => {
  const url = 'http://www.reddit.com/r/' + 
  sub + '/' + 
  cat + '.json' + 
  '?limit=' + num;

  getPosts(url, getImage);
}

/* 
 * GETs JSON data, then calls getImage on each post
 * Use try/catch since Reddit sends an HTML error page instead of JSON if server is under load
 */
function getPosts(url, cb) {
  http.get(url, res => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        async.each(parsed.data.children, cb);
      } catch (e) {
        console.log(e.message);
        return;
      }
    });
  }).on('error', e => console.log(e.message));
}

/*
 * Download image if post url is a recognized image url, or do nothing
 * Rigorous tests are needed since an invalid url may slow down or crash the program
 * If url isn't an Imgur image, and doesn't end with .jpg/.png/.gif, or is 'https',
 * then it does nothing
 */
function getImage(post) {
  const url = post.data.url;
  const imgurImageRegex = /^https?\:\/\/(i\.)?imgur\.com\/([A-Z0-9]{5,8})((?:\.jpg)|(?:\.gifv)|(?:\.png)|(?:\.gif))?(?:\?1)?$/i;
  const imgurAlbumRegex = /^http\:\/\/imgur\.com\/a\/[a-zA-Z0-9]{5}/;
  const genericJpgOrPngOrGifRegex = /http:\/\/.*\/([^\/]+\.(jpg|png|gif))$/;
  let imgurImageMatch;
  let imgurAlbumMatch;
  let genericJpgOrPngOrGifMatch;
  let downloadUrl;
  let filename;
  let ext;
 
  if (imgurImageMatch = url.match(imgurImageRegex)) {
    // Imgur has a special download page, which is quite useful since their image urls
    // vary heavily, e.g. url doesn't end with .jpg or has ?1 at the end
    downloadUrl = 'http://imgur.com/download/' + imgurImageMatch[2];
    ext = imgurImageMatch[3] || '.jpg';
    filename = imgurImageMatch[2] + ext;
  }
  else if (genericJpgOrPngOrGifMatch = url.match(genericJpgOrPngOrGifRegex)) {
    downloadUrl = url;
    filename = genericJpgOrPngOrGifMatch[1];
  }
  else if (imgurAlbumMatch = url.match(imgurAlbumRegex)) {
    console.log(url, chalk.cyan(' Imgur albums'), chalk.red(' not supported'));
    return;
  }
  else if (~url.indexOf('imgur.com/gallery')) {
    console.log(url, chalk.cyan(' Imgur galleries'), chalk.red(' not supported'));
    return;
  }
  else if (~url.indexOf('https')) {
    console.log(url, chalk.cyan(' https'), chalk.red(' not supported'));
    return;
  }
  else {
    console.log(url, chalk.red(' Unrecognized image url'));
    return;
  }

  const req = http.request(downloadUrl, res => {
    const data = new Stream();
    res.on('data', chunk => data.push(chunk));
    res.on('end',
      () => fs.writeFile(filename, 
        data.read(), 
        () => console.log(url, chalk.green(' downloaded successfully'))
      )
    );
  });
  req.on('error', e => console.log(e.message))
  req.end();
}
