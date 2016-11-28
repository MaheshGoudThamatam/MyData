'use strict';

//Setting up route
angular.module('mean.actsec').config(['$meanStateProvider', function($meanStateProvider) {

    // states for users
    $meanStateProvider
        .state('login', {
            url: '/login',
            templateUrl: 'actsec/views/users/login.html',
            resolve: {
                loggedin: function(MeanUser) {
                    return MeanUser.checkLoggedOut();
                }
            }
        })
        .state('logout', {
            url: '/logout',
            templateUrl: 'actsec/views/users/logout.html',
            resolve: {
                loggedin: function(MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
        .state('register', {
            url: '/register',
            templateUrl: 'actsec/views/users/register.html',
            resolve: {
                loggedin: function(MeanUser) {
                    return MeanUser.checkLoggedOut();
                }
            }
        })
        .state('forgot-password', {
            url: '/forgot-password',
            templateUrl: 'actsec/views/users/forgot-password.html',
            resolve: {
                loggedin: function(MeanUser) {
                    return MeanUser.checkLoggedOut();
                }
            }
        })
        .state('reset-password', {
            url: '/reset/:tokenId',
            templateUrl: 'actsec/views/users/reset-password.html',
            resolve: {
                loggedin: function(MeanUser) {
                    return MeanUser.checkLoggedOut();
                }
            }
        })
        .state('Account Setup_set password', {
            url: '/set-password',
            templateUrl: 'actsec/views/users/password-change.html',
            resolve: {
                loggedin:function(MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        });
}]);