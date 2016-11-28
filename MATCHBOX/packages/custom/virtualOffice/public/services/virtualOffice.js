(function () {
  'use strict';

  angular
    .module('mean.virtualOffice')
    .factory('VirtualOffice', VirtualOffice);

  VirtualOffice.$inject = [];

  function VirtualOffice() {
    return {
      name: 'virtualOffice'
    };
  }
})();
