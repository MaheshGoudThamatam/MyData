(function () {
  'use strict';

  /* jshint -W098 */
  angular
    .module('mean.tarento_directives')
    .controller('TarentoDirectivesController', TarentoDirectivesController);

  TarentoDirectivesController.$inject = ['$scope', 'Global', 'TarentoDirectives'];

  function TarentoDirectivesController($scope, Global, TarentoDirectives) {
    $scope.global = Global;
    $scope.package = {
      name: 'tarento_directives'
    };
  }
})();