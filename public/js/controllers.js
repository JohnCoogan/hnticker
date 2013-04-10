'use strict';

/* Controllers */

function AppCtrl($scope, socket) {

  // Socket listeners
  // ================

  socket.on('send:message', function (message) {
    $scope.messages.unshift(message);
    $scope.messages = _.map(_.uniq($scope.messages, function(d) { return d.url; }), function(m, i) { m.index = i; return m; });
  });

  $scope.messages = [];
}
