(function () {
  'use strict';

  angular
    .module('mean.team')
    .config(team);

  team.$inject = ['$stateProvider'];

  function team($stateProvider) {
    $stateProvider.state('team example page', {
      url: '/team/example',
      templateUrl: 'team/views/index.html'
    }).state('team create page', {
        url: '/team/create',
        templateUrl: 'team/views/team_create.html'
      }).state('team edit page', {
          url: '/admin/:partnerId/team/:teamId/edit',
          templateUrl: 'team/views/team_edit.html'
        }).state('team list', {
            url: '/team/list',
            templateUrl: 'team/views/team_list.html'
          });
      
  }

})();
