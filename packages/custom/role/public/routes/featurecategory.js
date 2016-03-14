'use strict';

angular.module('mean.role').config(function ($stateProvider, ROLE) {
    $stateProvider
        .state(ROLE.STATE.FEATURE_CATEGORY_LIST, {
            url: ROLE.URL_PATH.FEATURE_CATEGORY_LIST,
            templateUrl: ROLE.FILE_PATH.FEATURE_CATEGORY_LIST,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(ROLE.STATE.FEATURE_CATEGORY_CREATE, {
            url: ROLE.URL_PATH.FEATURE_CATEGORY_CREATE,
            templateUrl: ROLE.FILE_PATH.FEATURE_CATEGORY_CREATE,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(ROLE.STATE.FEATURE_CATEGORY_EDIT, {
            url: ROLE.URL_PATH.FEATURE_CATEGORY_EDIT,
            templateUrl: ROLE.FILE_PATH.FEATURE_CATEGORY_EDIT,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(ROLE.STATE.FEATURE_CATEGORY_DETAILS, {
            url: ROLE.URL_PATH.FEATURE_CATEGORY_DETAILS,
            templateUrl: ROLE.FILE_PATH.FEATURE_CATEGORY_DETAILS,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
});
