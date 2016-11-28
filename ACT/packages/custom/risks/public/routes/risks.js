(function() {
    'use strict';
    angular.module('mean.risks').config(Risks);
    Risks.$inject = ['$stateProvider', 'RISK'];

    function Risks($stateProvider, RISK) {
        $stateProvider.state(RISK.STATE.LIST_RISK, {
            url: RISK.PATH.LIST_RISK,
            templateUrl: RISK.FILE_PATH.LIST_RISK,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
        .state(RISK.STATE.CREATE_RISK, {
            url: RISK.PATH.CREATE_RISK,
            templateUrl: RISK.FILE_PATH.CREATE_RISK,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
        .state(RISK.STATE.EDIT_RISK, {
            url: RISK.PATH.EDIT_RISK,
            templateUrl: RISK.FILE_PATH.EDIT_RISK,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
    }

})();

