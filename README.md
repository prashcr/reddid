![Reddid Alien](reddid.png)

reddid
====

> Reddit Image Downloader  

**reddid** is a simple command-line app written in Node.js that lets you download images from image-based subreddits on [Reddit](http://reddit.com), using their [API](https://www.reddit.com/dev/api).

At the moment, it supports all image formats on Imgur, but not albums or galleries.  
Looking to add support for more providers.

Install
----
```
$ npm install -g reddid
```

Usage
----
```
$ reddid <subreddit> <category> <num>
```  

Default arguments:
```
$ reddid pics hot 3
```

License
----

The MIT License (MIT)

Copyright (c) 2015 Prashanth Chandra

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
