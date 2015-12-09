'use strict';

const fs = require('fs');
const mime = require('mime');
const request = require('request');
const async = require('async');
const chalk = require('chalk');

/*
 * Exports module to be called by cli.js, which is our executable
 */
module.exports = (sub, cat, num) => {
  const url = [
    'http://www.reddit.com/r/',
    sub, '/', cat, '.json', '?limit=', num
  ].join();

  getPosts(url, getImage);
};

/*
 * GETs JSON data, then calls getImage on each post
 * Use try/catch since Reddit sends an HTML error page instead of JSON if server is under load
 */
function getPosts (url) {
  request(url, (err, res, body) => {
    if (err) return console.log(err);
    try {
      const parsed = JSON.parse(body);
      async.parallel(parsed.data.children.map((link) => {
        return function (callback) {
          getImage(link, callback);
        };
      }),
      function (err, results) {
        if (err) return console.log(err);
        console.log('All downloads complete');
        console.log(`Downloaded ${results.filter((res) => res).length} out of ${results.length} links`);
      });
    } catch (e) {
      console.log(e.message);
    }
  });
}

/*
 * Download image if post url is a recognized image url, or do nothing
 * Rigorous tests are needed since an invalid url may slow down or crash the program
 * If url isn't an Imgur image, and doesn't end with .jpg/.png/.gif, then it does nothing
 */
function getImage (post, callback) {
  const url = post.data.url;
  const imgurImageRegex = /^https?\:\/\/(i\.)?imgur\.com\/(?:gallery\/)?([A-Z0-9]{5,8})((?:\.jpg)|(?:\.gifv)|(?:\.png)|(?:\.gif))?(?:\?1)?$/i;
  const genericJpgOrPngOrGifRegex = /http:\/\/.*\/([^\/]+\.(jpg|png|gif))$/;

  if (url.match(imgurImageRegex)) {
    let imgurImageMatch = url.match(imgurImageRegex);
    let downloadUrl = 'http://imgur.com/download/' + imgurImageMatch[2];
    let filename = imgurImageMatch[2];
    let ext = imgurImageMatch[3];

    // Download just the header to determine file extension when it isn't available in the url
    if (!ext) {
      request({url: downloadUrl, method: 'HEAD'}, (err, res, body) => {
        if (err) return console.log(err);
        ext = '.' + mime.extension(res.headers['content-type']);
        downloadImage(downloadUrl, filename + ext);
      });
    } else {
      downloadImage(downloadUrl, filename + ext, callback);
    }
  } else if (url.match(genericJpgOrPngOrGifRegex)) {
    let genericJpgOrPngOrGifMatch = url.match(genericJpgOrPngOrGifRegex);
    let downloadUrl = url;
    let filename = genericJpgOrPngOrGifMatch[1];
    downloadImage(downloadUrl, filename, callback);
  } else {
    console.log(url, chalk.red(' Unrecognized image url'));
    callback(null, null);
  }
}

function downloadImage (url, filename, callback) {
  request(url)
  .pipe(fs.createWriteStream(filename))
  .on('close', () => {
    console.log(url, chalk.green(' downloaded successfully'));
    callback(null, filename);
  });
}
