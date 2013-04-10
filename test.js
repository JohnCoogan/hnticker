var request = require('request')
  , jsdom = require('jsdom').jsdom
  , _und = require('underscore')
  , FETCH_INTERVAL = 4000
  // , recentPosts = {'news':[], 'newest':[]}
  , io = {'sockets': {'emit': console.log}};

function sendMessage(io, section, data) {
  // io.sockets.emit('send:' + section, data);
  if (section != 'trending') {
    // recentPosts[section].push(data);  
  }
  return;
}

function getStyling(delta) {
  if (delta > 0) {
    return 'arrow-up';
  } else if (delta < 0) {
    return 'arrow-down';
  } else {
    return 'resize-horizontal';
  }
}

function getHeadline(io, section) {
  request({
    uri: "http://news.ycombinator.com/" + section,
  }, function(error, response, body) {
    var window = jsdom(body).createWindow()
      , $ = require('jquery').create(window);
    
    var titles = $('.title a')
      , points = $('.subtext span');
    
    for (var i = 0; i < points.length; i++) {
      var data = {
                    position: Number($(titles[i]).parent().parent().children().first().text().replace('.','')),
                    points: $(points[i]).text(),
                    text: $(titles[i]).text(),
                    url: $(titles[i]).attr('href'),
                    domain: $(titles[i]).next().text(),
                    delta: 0,
                    styling: 'resize-horizontal'
                  };
      if (section == 'newest') {
        // var matchedPost = _und.findWhere(recentPosts[section], {'url':data.url});
        // if (!matchedPost) {
          sendMessage(io, section, data);
        // }
      } else {
        // if (!_und.isEmpty(recentPosts['news']) && !_und.isUndefined(data)) {
        //   var matchedPost = _und.findWhere(recentPosts['news'], {'url':data.url});
        // }
        // if (matchedPost) {
        //   var delta = data.position - matchedPost.position;
        //   if (delta != 0) {
        //     data.delta = delta;
        //     data.styling = getStyling(delta);
        //     recentPosts['news'] = _und.map(recentPosts['news'], 
        //       function(s) { 
        //         if (s.url == data.url) {
        //           s = data;
        //         }
        //         return s;
        //       });
        //     sendMessage(io, 'trending', data);
        //   }
        // } else {
          sendMessage(io, 'news', data);
        // }
      }
    }
  });
  return;
}

function interFunc() {
  console.log('ran func');
  getHeadline(io, 'newest');
  getHeadline(io, 'news');
}

// var timer = setInterval(interFunc, FETCH_INTERVAL);
var timer = setTimeout(interFunc, FETCH_INTERVAL);
var timer = setTimeout(interFunc, FETCH_INTERVAL * 2);
var timer = setTimeout(interFunc, FETCH_INTERVAL * 3);
var timer = setTimeout(interFunc, FETCH_INTERVAL * 4);
var timer = setTimeout(interFunc, FETCH_INTERVAL * 5);
var timer = setTimeout(interFunc, FETCH_INTERVAL * 6);
var timer = setTimeout(interFunc, FETCH_INTERVAL * 7);

