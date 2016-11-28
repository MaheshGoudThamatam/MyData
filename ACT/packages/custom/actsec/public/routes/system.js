'use strict';

//Setting up route
angular.module('mean.actsec').config(['$meanStateProvider', '$urlRouterProvider', function($meanStateProvider, $urlRouterProvider) {
    // For unmatched routes:
    $urlRouterProvider.otherwise('/404');

    // states for my app
    $meanStateProvider
        .state('Dashboard_dashboard & statistics', {
            url: '/',
            templateUrl: 'actsec/views/system/index.html',
            resolve: {
                loggedin: function(MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
        .state('404', {
            url: '/404',
            templateUrl: 'actsec/views/system/404.html'
        });
}]).config(['$locationProvider',
    function($locationProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    }
]);