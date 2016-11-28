'use strict';

angular.module('mean.promo_code').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('promoCode example page', {
      url: '/promoCode/example',
      templateUrl: 'promo_code/views/index.html'
    });
  }
]);
