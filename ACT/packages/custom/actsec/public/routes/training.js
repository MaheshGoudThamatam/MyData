'use strict';

//Setting up route
angular.module('mean.actsec').config(['$meanStateProvider', '$urlRouterProvider', function($meanStateProvider, $urlRouterProvider) {

    // states for my app
    $meanStateProvider
        .state('training-list', {
            url: '/training-list',
            templateUrl: 'actsec/views/training-list.html',
            resolve: {
                loggedin: function(MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        });
}]);