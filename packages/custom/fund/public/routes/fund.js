'use strict';

angular.module('mean.fund').config(['$stateProvider','FUND',
  function($stateProvider, FUND) {
    $stateProvider
            .state(FUND.STATE.FUND, {
            url: FUND.URL_PATH.FUND,
            templateUrl: FUND.FILE_PATH.FUND,
            abstract: true
        }).state(FUND.STATE.FUNDDISTRIBUTION_LIST, {
            url: FUND.URL_PATH.FUNDDISTRIBUTION_LIST,
            templateUrl: FUND.FILE_PATH.FUNDDISTRIBUTION_LIST,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        });
  }
]);
