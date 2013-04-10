'use strict';

/* Controllers */

function AppCtrl($scope, socket) {

  // Socket listeners
  // ================
  $scope.newest = [];
  $scope.topStories = [];

  socket.on('send:newest', function (story) {
    $scope.newest.unshift(story);
    $scope.newest = _.uniq($scope.newest, function(d) { return d.url; });
  });

  socket.on('send:news', function (story) {
    $scope.topStories.unshift(story);
    $scope.topStories = _.uniq($scope.topStories, function(d) { return d.url; });
  });

  socket.on('send:trending', function (data) {
    console.log(data);
    $scope.topStories = _.map($scope.topStories, function(s) { if(s.url == data.url) { s = data; }});
  });
}
