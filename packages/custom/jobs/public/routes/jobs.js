'use strict';
angular.module('mean.jobs').config(function ($stateProvider, JOBS) {
    $stateProvider
        .state(JOBS.STATE.JOB, {
            url: JOBS.URL_PATH.JOB,
            templateUrl: JOBS.FILE_PATH.JOB,
            abstract: true
        })
        .state(JOBS.STATE.JOBS_LIST, {
            url: JOBS.URL_PATH.JOBS_LIST,
            templateUrl: JOBS.FILE_PATH.JOBS_LIST,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(JOBS.STATE.JOBS_DETAIL, {
            url: JOBS.URL_PATH.JOBS_DETAIL,
            templateUrl: JOBS.FILE_PATH.JOBS_DETAIL,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(JOBS.STATE.SITE_LIST, {
            url: JOBS.URL_PATH.SITE_LIST,
            templateUrl: JOBS.FILE_PATH.SITE_LIST,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(JOBS.STATE.SITE_CREATE, {
            url: JOBS.URL_PATH.SITE_CREATE,
            templateUrl: JOBS.FILE_PATH.SITE_CREATE,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(JOBS.STATE.SITE_EDIT, {
            url: JOBS.URL_PATH.SITE_EDIT,
            templateUrl: JOBS.FILE_PATH.SITE_EDIT,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(JOBS.STATE.SITE_DETAILS, {
            url: JOBS.URL_PATH.SITE_DETAILS,
            templateUrl: JOBS.FILE_PATH.SITE_DETAILS,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        });
});