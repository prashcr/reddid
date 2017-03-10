#!/usr/bin/env node --harmony
'use strict';
var meow = require('meow');
var reddid = require('./');

var cli = meow({
  help: [
    'Usage',
    '  reddid <subreddit> <category> <num> [time]',
    '  reddid pics top 3 week',
    '  reddid pics hot 5',
    ' ',
    ' [time] is an optional parameter that can be passed when category is "top"',
    ' Valid values: "year", "month", "week", "day", "hour"'
  ]
});

const times = ['year', 'month', 'week', 'day', 'hour']
let [sub, cat, num, time] = cli.input

time = times.includes(time) ? time : null

reddid({sub, cat, num, time});
