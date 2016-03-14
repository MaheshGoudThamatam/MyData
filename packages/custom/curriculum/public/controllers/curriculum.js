'use strict';

/* jshint -W098 */
angular.module('mean.curriculum').controller('CurriculumController', ['$scope', 'Global', 'Curriculum',
  function($scope, Global, Curriculum) {
    $scope.global = Global;
    $scope.package = {
      name: 'curriculum'
    };
  }
]);
