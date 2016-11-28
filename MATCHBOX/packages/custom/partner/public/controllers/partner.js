(function () {
  'use strict';

  /* jshint -W098 */
  angular
    .module('mean.partner')
    .controller('PartnerController', PartnerController);

  PartnerController.$inject = ['$scope','$rootScope', 'Global', 'Partner'];

  function PartnerController($scope,$rootScope, Global, Partner,flash) {
    $scope.global = Global;
    $scope.package = {
      name: 'partner'
    };
    hideBgImageAndFooter($rootScope);
    flashmessageOn($rootScope, $scope,flash);
  }
})();