
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
  , FETCH_INTERVAL = 5000
  , sentHeadlines = []
  , lastFive = [];

function sendMessage(io, data) {
  io.sockets.emit('send:message', data);
  lastFive.push(data);
  lastFive = lastFive.slice(0,5);
}

// Socket.io Communication
io.sockets.on('connection', function (socket) {
  for (var i = 0; i < lastFive.length; i++) {
    socket.emit('send:message', lastFive[i]);
  };
});

function getHeadline(io) {
  request({
    uri: "http://news.ycombinator.com/newest",
  }, function(error, response, body) {
    var window = jsdom(body).createWindow()
      , $ = require('jquery').create(window);
    
    var titles = $('.title a')
      , points = $('.subtext span');
      
    $.map(points, function(el, i) {
          var data = {
            position: i,
            points: $(el).text(),
            text: $(titles[i]).text(),
            url: $(titles[i]).attr('href'),
            domain: $(titles[i]).next().text()
          }
          if (!_und.contains(sentHeadlines, data.url)) {
            sendMessage(io, data);
            sentHeadlines.push(data.url);
          }
      });
  });
}

var timer = setInterval(function() {
  getHeadline(io);
}, FETCH_INTERVAL);

// Start server

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
