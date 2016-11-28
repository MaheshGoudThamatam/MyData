'use strict';

/* jshint -W098 */
angular.module('mean.promo_code').controller('PromoCodeController', ['$scope', 'Global', 'PromoCode',
  function($scope, Global, PromoCode) {
    $scope.global = Global;
    $scope.package = {
      name: 'promo_code'
    };
  }
]);
