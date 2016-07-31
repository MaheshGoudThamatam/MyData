'use strict';

angular.module('mean.theme')
	.controller('ThemeController', ['$scope','$rootScope', 'Global',
	  function($scope,$rootScope, Global) {
// Original scaffolded code.
      $scope.global = Global;
      $scope.package = {
        name: 'theme'
      };
    }
  ]);
