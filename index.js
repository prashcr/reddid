var http = require('http');
var subreddit = process.argv[2] || 'aww';
var category = process.argv[3] || 'hot';
var num = process.argv[4] || '25';
var url = 'http://www.reddit.com/r/' 
  + subreddit + '/' 
  + category + '.json'
  + '?limit=' + num;

function getPosts(cb) {
  http.get(url, res => {
    var str = '';
    res.on('data', d => str += d);
    res.on('end', () => {
      var parsed = JSON.parse(str);
      parsed.data.children.map(cb);
    });
  }).on('error', err => console.error(err));
}

function getImage(post) {
  var url = post.data.url;
  console.log(url);
}

getPosts(getImage);
