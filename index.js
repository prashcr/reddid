'use strict'

const fs = require('fs')
const mime = require('mime')
const request = require('request')
const async = require('async')
const chalk = require('chalk')
const trunc = require('unicode-byte-truncate')
const sanitize = require('sanitize-filename')

/*
 * Exports module to be called by cli.js, which is our executable
 */
module.exports = (sub, cat, num) => {
  const url = [
    'http://www.reddit.com/r/',
    sub, '/', cat, '.json', '?limit=', num
  ].join('')

  getPosts(url, getImage)
}

/*
 * GETs JSON data, then calls getImage on each post
 * Use try/catch since Reddit sends an HTML error page instead of JSON if server is under load
 */
function getPosts (url) {
  request(url, (err, res, body) => {
    if (err) return console.log(err)
    try {
      const parsed = JSON.parse(body)
      async.parallel(
        parsed.data.children.map(link => callback => getImage(link, callback)),
        (err, results) => {
          if (err) return console.log(err)
          console.log('All downloads complete')
          console.log(`Downloaded ${results.filter(res => res).length} out of ${results.length} links`)
        })
    } catch (err) {
      console.log(err.message)
    }
  })
}

/*
 * Check if there is a reddit preview of the image then download from that url
 */
function getImage (post, callback) {
  if (!post.data.preview) {
    console.log(post.data.url, chalk.red('No image found'))
    return callback(null, null)
  }
  const url = post.data.preview.images[0].source.url
  // truncate to 251 so we have 4 bytes for the file extension
  const filename = trunc(sanitize(post.data.title, {replacement: '_'}), 251)
  const redditImageRegex = /https?:\/\/i\.redditmedia\.com\/.*\.(jpg|png|gif)/

  if (url.match(redditImageRegex)) {
    const match = url.match(redditImageRegex)
    const ext = '.' + match[1]
    downloadImage(url, filename + ext, callback)
  } else {
    console.log(url, chalk.red(' Unrecognized image url'))
    callback(null, null)
  }
}

function downloadImage (url, filename, callback) {
  request(url)
  .pipe(fs.createWriteStream(filename))
  .on('close', () => {
    console.log(url, chalk.green(' downloaded successfully'))
    callback(null, filename)
  })
}
