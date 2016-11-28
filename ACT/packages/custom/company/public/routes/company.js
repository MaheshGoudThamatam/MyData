/*
 * <Author:Akash Gupta>
 * <Date:30-06-2016>
 * <routes for company add page, company list page, company edit page>
 */

(function() {
    'use strict';
    angular.module('mean.company').config(Company);
    Company.$inject = ['$stateProvider', 'COMPANY'];

    function Company($stateProvider, COMPANY) {
        $stateProvider.state(COMPANY.STATE.COMPANY_ADD, {
            url: COMPANY.PATH.COMPANY_ADD,
            templateUrl: COMPANY.FILE_PATH.COMPANY_ADD,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
        .state(COMPANY.STATE.COMPANY_EDIT, {
            url: COMPANY.PATH.COMPANY_EDIT,
            templateUrl: COMPANY.FILE_PATH.COMPANY_EDIT,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
        .state(COMPANY.STATE.COMPANY_LIST, {
            url: COMPANY.PATH.COMPANY_LIST,
            templateUrl: COMPANY.FILE_PATH.COMPANY_LIST,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        });
    }
})();
