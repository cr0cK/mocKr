(function () {
  'use strict';

  angular.module('mockify.process', [
    'mockify.service.webSocket',
    'mockify.service.localStorage',
    'mockify.entity.target',

    'toggle-switch'
  ])

  .controller('TargetCtrl', [
    '$scope',
    '$interval',
    'webSocketService',
    'localStorageFactory',
    'targetFactory',

    function (
      $scope,
      $interval,
      webSocket,
      localStorage,
      Target
    ) {

      var initDefaultUrl = function () {
        $scope.targetsStored = localStorage.get('targets', 10);
        return localStorage.last('targets') ||
          'http://jsonplaceholder.typicode.com';
      };

      $scope.targetList = [];

      $scope.defaultValues = {
        url: initDefaultUrl(),
        port: 4000
      };

      /**
       * Register a target in the DB.
       */
      $scope.addAndStartTarget = function (port, url) {
        port = port || $scope.defaultValues.port;
        url = url || $scope.defaultValues.url;

        // save the url
        localStorage.push('urls', url);

        // create an entity
        var target = new Target({
          port: port,
          url: url,
          proxying: 0,
          mocking: 0,
          enabled: 0
        });

        target.add();

        $scope.targetsList.push(target);

        delete $scope.target;
        delete $scope.port;

        $scope.defaultValues.target = initDefaultUrl();
      };

      /**
       * Stop and remove a target from the DB
       * @param  {Target}  target  Target entity
       */
      $scope.removeTarget = function (target) {
        target.hidden = true;
        target.remove();
      };

      /**
       * Enable/Disable the record for a target.
       */
      $scope.toggleRecordTarget = function (target) {
        target.toggleRecording();
      };

      /**
       * Enable the target / Disable the mock
       * Disable the target / Enable the mock
       */
      $scope.toggleMockTarget = function (target) {
        target.toggleMock();
      };

      /**
       * Enable/disable the target.
       */
      $scope.toggleEnableTarget = function (target) {
        target.toggleEnable();
      };

      /**
       * Websockets events
       */

      /**
       * Refresh the list of targets when receiving the websocket event.
       * In order to prevent memory leaks, we refresh the DOM only if the
       * list of targets (and their properties) has been modified.
       */
      webSocket.on('listTargets', function (data) {
        var targets = _.map(data.targets, function (targetProps) {
          return new Target(targetProps);
        });

        var refresh = !_.isAlmostEqual($scope.targetsList, targets);

        if ($scope.targetsList === undefined || refresh) {
          $scope.$apply(function () {
            $scope.targetsList = targets;
          });
        }
      });
    }
  ]);
})();
