'use strict';

/* jshint -W098 */
angular.module('mean.superAdmin').controller('SuperAdminController', ['$scope','$rootScope', 'Global', 'SuperAdmin',
  function($scope,$rootScope, Global, SuperAdmin) {
    $scope.global = Global;
    $scope.package = {
      name: 'superAdmin'
    };
    hideBgImageAndFooter($rootScope);
  }

]);