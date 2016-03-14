'use strict';

/* jshint -W098 */
//var mentorApp = angular.module('mean.mentor', ['ui.calendar']);
var mentorApp = angular.module('mean.mentor');
mentorApp.controller('CalendarController', ['$scope', '$rootScope', 'Global', 'BRANCH', 
  function ($scope, $rootScope, Global, BRANCH) {
    $scope.global = Global;
    $scope.package = {
      name: 'mentor'
    };
    
  }
]);
