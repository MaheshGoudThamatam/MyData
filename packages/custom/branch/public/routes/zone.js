'use strict';

angular.module('mean.branch').config(function ($stateProvider, BRANCH) {
    $stateProvider
        .state(BRANCH.STATE.LIST_ZONE, {
            url: BRANCH.URL_PATH.LIST_ZONE,
            templateUrl: BRANCH.FILE_PATH.LIST_ZONE,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
        .state(BRANCH.STATE.CREATE_ZONE, {
            url: BRANCH.URL_PATH.CREATE_ZONE,
            templateUrl: BRANCH.FILE_PATH.CREATE_ZONE,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
        .state(BRANCH.STATE.EDIT_ZONE, {
            url: BRANCH.URL_PATH.EDIT_ZONE,
            templateUrl: BRANCH.FILE_PATH.EDIT_ZONE,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
});