'use strict';

/* jshint -W098 */
angular.module('mean.mail-templates').controller('MailTemplatesController', ['$scope','$rootScope', 'Global', 'MailTemplates',
  function($scope, $rootScope, Global, MailTemplates) {
    $scope.global = Global;
    $scope.package = {
      name: 'mail-templates'
    };
    hideBgImageAndFooter($rootScope);
  }
]);
