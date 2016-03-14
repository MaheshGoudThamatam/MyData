'use strict';

angular.module('mean.role').config(function ($stateProvider, ROLE) {
    $stateProvider
        .state(ROLE.STATE.ROLE, {
            url: ROLE.URL_PATH.ROLE,
            templateUrl: ROLE.FILE_PATH.ROLE,
            abstract: true
        })
        .state(ROLE.STATE.LIST_ROLE, {
            url: ROLE.URL_PATH.LIST_ROLE,
            templateUrl: ROLE.FILE_PATH.LIST_ROLE,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
        .state(ROLE.STATE.CREATE_ROLE, {
            url: ROLE.URL_PATH.CREATE_ROLE,
            templateUrl: ROLE.FILE_PATH.CREATE_ROLE,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
        .state(ROLE.STATE.EDIT_ROLE, {
            url: ROLE.URL_PATH.EDIT_ROLE,
            templateUrl: ROLE.FILE_PATH.EDIT_ROLE,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
        .state(ROLE.STATE.SHOW_ROLE, {
            url: ROLE.URL_PATH.SHOW_ROLE,
            templateUrl: ROLE.FILE_PATH.SHOW_ROLE,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
        .state(ROLE.STATE.ROLE_PERMISSION, {
            url: ROLE.URL_PATH.ROLE_PERMISSION,
            templateUrl: ROLE.FILE_PATH.ROLE_PERMISSION,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
        .state(ROLE.STATE.ADMIN_LIST, {
            url: ROLE.URL_PATH.ADMIN_LIST,
            templateUrl: ROLE.FILE_PATH.ADMIN_LIST,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        });
});