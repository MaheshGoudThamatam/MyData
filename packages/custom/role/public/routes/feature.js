'use strict';

angular.module('mean.role').config(function ($stateProvider, ROLE) {
    $stateProvider
        .state(ROLE.STATE.LIST_FEATURE, {
            url: ROLE.URL_PATH.LIST_FEATURE,
            templateUrl: ROLE.FILE_PATH.LIST_FEATURE,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
        .state(ROLE.STATE.CREATE_FEATURE, {
            url: ROLE.URL_PATH.CREATE_FEATURE,
            templateUrl: ROLE.FILE_PATH.CREATE_FEATURE,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
        .state(ROLE.STATE.EDIT_FEATURE, {
            url: ROLE.URL_PATH.EDIT_FEATURE,
            templateUrl: ROLE.FILE_PATH.EDIT_FEATURE,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
        .state(ROLE.STATE.SHOW_FEATURE, {
            url: ROLE.URL_PATH.SHOW_FEATURE,
            templateUrl: ROLE.FILE_PATH.SHOW_FEATURE,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
});