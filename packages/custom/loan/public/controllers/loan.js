'use strict';

/* jshint -W098 */
angular.module('mean.loan').controller('LoanController', ['$scope', 'Global', 'Loan',
  function($scope, Global, Loan) {
    $scope.global = Global;
    $scope.package = {
      name: 'loan'
    };
  }
]);
