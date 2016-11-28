(function () {
  'use strict';

  angular
    .module('mean.partner')
    .factory('Partner', Partner);

  Partner.$inject = [];

  function Partner() {
    return {
      name: 'partner'
    };
  }
})();
