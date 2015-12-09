#!/usr/bin/env node --harmony
'use strict';
var meow = require('meow');
var reddid = require('./');

var cli = meow({
  help: [
    'Usage',
    '  reddid <subreddit> <category> <num>',
    '  reddid pics hot 3'
  ]
});

reddid(cli.input[0] || 'pics', cli.input[1] || 'hot', cli.input[2] || '3');
