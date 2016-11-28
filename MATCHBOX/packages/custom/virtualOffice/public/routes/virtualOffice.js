(function () {
  'use strict';

  angular
    .module('mean.virtualOffice')
    .config(virtualOffice);

  virtualOffice.$inject = ['$stateProvider'];

  function virtualOffice($stateProvider) {
    $stateProvider.state('virtualOffice example page', {
      url: '/virtualOffice/example',
      templateUrl: 'virtualOffice/views/index.html'
    });
  }

})();
