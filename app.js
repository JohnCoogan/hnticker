
/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes');

var app = module.exports = express.createServer();

// Hook Socket.io into Express
var io = require('socket.io').listen(app);

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {
    layout: false
  });
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.get('/partials/:name', routes.partials);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

var request = require('request')
  , jsdom = require('jsdom').jsdom
  , _und = require('underscore')
  , FETCH_INTERVAL = 4000
  , recentPosts = {'news':[], 'newest':[]};

function sendMessage(io, section, data) {
  io.sockets.emit('send:' + section, data);
  if (section != 'trending') {
    recentPosts[section].push(data);  
  }
}

// Socket.io Communication
io.sockets.on('connection', function (socket) {
  var options = ['news','newest'];
  for (var i = 0; i < options.length; i++) {
    for (var t = 0; t < recentPosts[options[i]].length; t++) {
      socket.emit('send:' + options[i], recentPosts[options[i]][t]);
    };
  };
});

function getHeadline(io, section) {
  request({
    uri: "http://news.ycombinator.com/" + section,
  }, function(error, response, body) {
    var window = jsdom(body).createWindow()
      , $ = require('jquery').create(window);
    
    var titles = $('.title a')
      , points = $('.subtext span');
      
    $.map(points, function(el, i) {
      var data = {
                    position: Number($(titles[i]).parent().parent().children().first().text().replace('.','')),
                    points: $(el).text(),
                    text: $(titles[i]).text(),
                    url: $(titles[i]).attr('href'),
                    domain: $(titles[i]).next().text()
                  };
      if (section == 'newest') {
        var matchedPost = _und.findWhere(recentPosts[section], {'url':data.url});
        if (!matchedPost) {
          sendMessage(io, section, data);
        }
      } else {
        if (!_und.isEmpty(recentPosts['news']) && !_und.isUndefined(data)) {
          console.log(data);
          var matchedPost = _und.findWhere(recentPosts['news'], {'url':data.url});
        }
        if (matchedPost) {
          var delta = data.position - matchedPost.position;
          if (delta != 0) {
            console.log(data.text, delta);
            data.delta = delta;
            recentPosts['news'] = _und.map(recentPosts['news'], function(s) { if(s.url == data.url) { s = data; }});
            sendMessage(io, 'trending', data);
          }
        } else {
          sendMessage(io, 'news', data);
        }
      }
    });
  });
}

var timer = setInterval(function() {
  getHeadline(io, 'newest');
  getHeadline(io, 'news');
}, FETCH_INTERVAL);

// Start server

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
