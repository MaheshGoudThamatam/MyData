'use strict';

angular.module('mean.investor').config(function ($stateProvider, INVESTOR) {
    $stateProvider
        .state(INVESTOR.STATE.RISKFACTORCREATE, {
            url: INVESTOR.URL_PATH.RISKFACTORCREATE,
            templateUrl: INVESTOR.FILE_PATH.RISKFACTORCREATE

        }).state(INVESTOR.STATE.RISKFACTORLIST, {
            url: INVESTOR.URL_PATH.RISKFACTORLIST,
            templateUrl: INVESTOR.FILE_PATH.RISKFACTORLIST,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(INVESTOR.STATE.RISKFACTOREDIT, {
            url: INVESTOR.URL_PATH.RISKFACTOREDIT,
            templateUrl: INVESTOR.FILE_PATH.RISKFACTOREDIT,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(INVESTOR.STATE.RISKFACTORVIEW, {
            url: INVESTOR.URL_PATH.RISKFACTORVIEW,
            templateUrl: INVESTOR.FILE_PATH.RISKFACTORVIEW,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(INVESTOR.STATE.POLICYVIEW, {
            url: INVESTOR.URL_PATH.POLICYVIEW,
            templateUrl: INVESTOR.FILE_PATH.POLICYVIEW,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(INVESTOR.STATE.POLICYEDIT, {
            url: INVESTOR.URL_PATH.POLICYEDIT,
            templateUrl: INVESTOR.FILE_PATH.POLICYEDIT,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(INVESTOR.STATE.POLICYCREATE, {
            url: INVESTOR.URL_PATH.POLICYCREATE,
            templateUrl: INVESTOR.FILE_PATH.POLICYCREATE,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(INVESTOR.STATE.POLICYLIST, {
            url: INVESTOR.URL_PATH.POLICYLIST,
            templateUrl: INVESTOR.FILE_PATH.POLICYLIST,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(INVESTOR.STATE.INVESTORDETAILS, {
            url: INVESTOR.URL_PATH.INVESTORDETAILS,
            templateUrl: INVESTOR.FILE_PATH.INVESTORDETAILS,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(INVESTOR.STATE.POLICYASSIGNMENT, {
            url: INVESTOR.URL_PATH.POLICYASSIGNMENT,
            templateUrl: INVESTOR.FILE_PATH.POLICYASSIGNMENT,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        });
});