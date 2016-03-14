'use strict';
angular.module('mean.branch').config(function ($stateProvider, BRANCH) {
    $stateProvider
        .state(BRANCH.STATE.LIST_CITY, {
            url: BRANCH.URL_PATH.LIST_CITY,
            templateUrl: BRANCH.FILE_PATH.LIST_CITY,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
        .state(BRANCH.STATE.CREATE_CITY, {
            url: BRANCH.URL_PATH.CREATE_CITY,
            templateUrl: BRANCH.FILE_PATH.CREATE_CITY,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
        .state(BRANCH.STATE.EDIT_CITY, {
            url: BRANCH.URL_PATH.EDIT_CITY,
            templateUrl: BRANCH.FILE_PATH.EDIT_CITY,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
});