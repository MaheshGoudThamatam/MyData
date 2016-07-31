(function () {
  'use strict';

  angular
    .module('mean.partner')
    .config(partner);

  partner.$inject = ['$stateProvider'];

  function partner($stateProvider) {
    $stateProvider.state('partner example page', {
      url: '/partner/example',
      templateUrl: 'partner/views/index.html'
    });
  }

})();
