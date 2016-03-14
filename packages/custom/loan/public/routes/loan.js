'use strict';

angular.module('mean.loan').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('loan example page', {
      url: '/loan/example',
      templateUrl: 'loan/views/index.html'
    });
  }
]);
