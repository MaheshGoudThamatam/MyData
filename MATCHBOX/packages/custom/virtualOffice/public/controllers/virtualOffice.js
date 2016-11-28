(function () {
  'use strict';

  /* jshint -W098 */
  angular
    .module('mean.virtualOffice')
    .controller('VirtualOfficeController', VirtualOfficeController);

  VirtualOfficeController.$inject = ['$scope', 'Global', 'VirtualOffice'];

  function VirtualOfficeController($scope, Global, VirtualOffice) {
    $scope.global = Global;
    $scope.package = {
      name: 'virtualOffice'
    };
  }
})();