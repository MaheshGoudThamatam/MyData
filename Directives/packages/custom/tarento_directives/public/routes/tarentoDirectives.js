(function () {
  'use strict';

  angular
    .module('mean.tarento_directives')
    .config(tarento_directives);

  tarento_directives.$inject = ['$stateProvider'];

  function tarento_directives($stateProvider) {
    $stateProvider.state('tarentoDirectives example page', {
      url: '/tarentoDirectives/example',
      templateUrl: 'tarento_directives/views/index.html'
    })
    .state('nested list page', {
      url: '/tarentoDirectives/nestedlist',
      templateUrl: 'tarento_directives/views/nestedlist.html'
    });
  }

})();
