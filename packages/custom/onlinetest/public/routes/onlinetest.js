'use strict';
angular.module('mean.onlinetest').config(function ($stateProvider, ONLINETEST) {
    $stateProvider
        .state(ONLINETEST.STATE.ONLINE_TEST, {
            url: ONLINETEST.URL_PATH.ONLINE_TEST,
            templateUrl: ONLINETEST.FILE_PATH.ONLINE_TEST,
            abstract: true
        })
        .state(ONLINETEST.STATE.LIST_ONLINE_TEST, {
            url: ONLINETEST.URL_PATH.LIST_ONLINE_TEST,
            templateUrl: ONLINETEST.FILE_PATH.LIST_ONLINE_TEST,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
        .state(ONLINETEST.STATE.CREATE_ONLINE_TEST, {
            url: ONLINETEST.URL_PATH.CREATE_ONLINE_TEST,
            templateUrl: ONLINETEST.FILE_PATH.CREATE_ONLINE_TEST,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
        .state(ONLINETEST.STATE.EDIT_ONLINE_TEST, {
            url: ONLINETEST.URL_PATH.EDIT_ONLINE_TEST,
            templateUrl: ONLINETEST.FILE_PATH.EDIT_ONLINE_TEST,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
        .state(ONLINETEST.STATE.VIEW_ONLINE_TEST, {
            url: ONLINETEST.URL_PATH.VIEW_ONLINE_TEST,
            templateUrl: ONLINETEST.FILE_PATH.VIEW_ONLINE_TEST,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
        .state(ONLINETEST.STATE.DELETE_ONLINE_TEST, {
            url: ONLINETEST.URL_PATH.DELETE_ONLINE_TEST,
            templateUrl: ONLINETEST.FILE_PATH.DELETE_ONLINE_TEST,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
});