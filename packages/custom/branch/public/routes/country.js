'use strict';


angular.module('mean.branch').config(function ($stateProvider, BRANCH) {
    $stateProvider
        .state(BRANCH.STATE.LIST_COUNTRY, {
            url: BRANCH.URL_PATH.LIST_COUNTRY,
            templateUrl: BRANCH.FILE_PATH.LIST_COUNTRY,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
        .state(BRANCH.STATE.CREATE_COUNTRY, {
            url: BRANCH.URL_PATH.CREATE_COUNTRY,
            templateUrl: BRANCH.FILE_PATH.CREATE_COUNTRY,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
        .state(BRANCH.STATE.EDIT_COUNTRY, {
            url: BRANCH.URL_PATH.EDIT_COUNTRY,
            templateUrl: BRANCH.FILE_PATH.EDIT_COUNTRY,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
        .state(BRANCH.STATE.SHOW_COUNTRY, {
            url: BRANCH.URL_PATH.SHOW_COUNTRY,
            templateUrl: BRANCH.FILE_PATH.SHOW_COUNTRY,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
});
