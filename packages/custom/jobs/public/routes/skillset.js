'use strict';
angular.module('mean.jobs').config(function ($stateProvider, SKILLSET) {
    $stateProvider
        .state(SKILLSET.STATE.SKILLSET, {
            url: SKILLSET.URL_PATH.SKILLSET,
            templateUrl: SKILLSET.FILE_PATH.SKILLSET,
            abstract: true
        })
        .state(SKILLSET.STATE.SKILLSET_CREATE, {
            url: SKILLSET.URL_PATH.SKILLSET_CREATE,
            templateUrl: SKILLSET.FILE_PATH.SKILLSET_CREATE,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(SKILLSET.STATE.SKILLSET_LIST, {
            url: SKILLSET.URL_PATH.SKILLSET_LIST,
            templateUrl: SKILLSET.FILE_PATH.SKILLSET_LIST,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(SKILLSET.STATE.SKILLSET_EDIT, {
            url: SKILLSET.URL_PATH.SKILLSET_EDIT,
            templateUrl: SKILLSET.FILE_PATH.SKILLSET_EDIT,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(SKILLSET.STATE.SKILLSET_DETAILS, {
            url: SKILLSET.URL_PATH.SKILLSET_DETAILS,
            templateUrl: SKILLSET.FILE_PATH.SKILLSET_DETAILS,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        });
});