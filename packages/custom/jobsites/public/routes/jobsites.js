'use strict';

angular.module('mean.jobsites').config(function ($stateProvider, JOBSSITES) {
    $stateProvider
        .state(JOBSSITES.STATE.JOBSITES, {
            url: JOBSSITES.URL_PATH.JOBSITES,
            templateUrl: JOBSSITES.FILE_PATH.JOBSITES,
            abstract: true
        })
        .state(JOBSSITES.STATE.JOBSITES_LIST, {
            url: JOBSSITES.URL_PATH.JOBSITES_LIST,
            templateUrl: JOBSSITES.FILE_PATH.JOBSITES_LIST,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(JOBSSITES.STATE.JOBSITES_CREATE, {
            url: JOBSSITES.URL_PATH.JOBSITES_CREATE,
            templateUrl: JOBSSITES.FILE_PATH.JOBSITES_CREATE,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(JOBSSITES.STATE.JOBSITES_EDIT, {
            url: JOBSSITES.URL_PATH.JOBSITES_EDIT,
            templateUrl: JOBSSITES.FILE_PATH.JOBSITES_EDIT,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        });
});
