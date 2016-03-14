'use strict';

angular.module('mean.investor').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('investor example page', {
      url: '/investor/example',
      templateUrl: 'investor/views/index.html'
    });
  }
]);
