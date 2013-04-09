'use strict';

/* Controllers */

function AppCtrl($scope, socket) {

  // Socket listeners
  // ================

  socket.on('send:message', function (message) {
    $scope.messages.unshift(message);
    $scope.messages = _.uniq($scope.messages, function(d) { return d.url; });
  });

  $scope.messages = [];
}
