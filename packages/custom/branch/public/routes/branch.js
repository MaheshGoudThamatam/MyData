'use strict';

angular.module('mean.branch').config(function ($stateProvider, BRANCH) {
    $stateProvider
        .state(BRANCH.STATE.BRANCH, {
            url: BRANCH.URL_PATH.BRANCH,
            templateUrl: BRANCH.FILE_PATH.BRANCH,
            abstract: true
        })
        .state(BRANCH.STATE.LIST_BRANCH, {
            url: BRANCH.URL_PATH.LIST_BRANCH,
            templateUrl: BRANCH.FILE_PATH.LIST_BRANCH,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
        .state(BRANCH.STATE.CREATE_BRANCH, {
            url: BRANCH.URL_PATH.CREATE_BRANCH,
            templateUrl: BRANCH.FILE_PATH.CREATE_BRANCH,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
        .state(BRANCH.STATE.EDIT_BRANCH, {
            url: BRANCH.URL_PATH.EDIT_BRANCH,
            templateUrl: BRANCH.FILE_PATH.EDIT_BRANCH,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
});