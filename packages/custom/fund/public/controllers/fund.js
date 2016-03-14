'use strict';

/* jshint -W098 */
angular.module('mean.fund').controller('FundController', ['$scope', 'Global', 'Fund', 'FUND',
  function($scope, Global, Fund,FUND ) {
    $scope.global = Global;
    $scope.package = {
      name: 'fund',
      modelName: 'FUND'
    };
    initializeBreadCrum($scope, $scope.package.modelName, FUND.PATH.FUNDDISTRIBUTION_LIST, 'Policies', 'Investor Management');
  }
]);
