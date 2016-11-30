(function () {
  'use strict';

  angular
    .module('mean.tarento_directives')
    .factory('TarentoDirectives', TarentoDirectives);

  TarentoDirectives.$inject = [];

  function TarentoDirectives() {
    return {
      name: 'tarento_directives'
    };
  }
})();
