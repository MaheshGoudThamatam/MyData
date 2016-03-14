'use strict';

/* jshint -W098 */
angular.module('mean.investor').controller('InvestorController', ['$scope', 'Global', 'Investor',
  function($scope, Global, Investor) {
    $scope.global = Global;
    $scope.package = {
      name: 'investor'
    };
  }
]);
