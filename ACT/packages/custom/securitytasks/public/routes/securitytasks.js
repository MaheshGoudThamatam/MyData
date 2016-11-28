/*
 * <Author:Akash Gupta>
 * <Date:25-07-2016>
 * <routes for Security tasks>
 */

(function() {
    'use strict';
    angular.module('mean.securitytasks').config(Securitytasks);
    Securitytasks.$inject = ['$stateProvider', 'SECURITYTASKS'];

    function Securitytasks($stateProvider, SECURITYTASKS) {
        $stateProvider
        .state(SECURITYTASKS.STATE.SECURITYTASKS_LIST, {
            url: SECURITYTASKS.URL_PATH.SECURITYTASKS_LIST,
            templateUrl: SECURITYTASKS.FILE_PATH.SECURITYTASKS_LIST,
            resolve: {
                loggedin: function(MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
        .state(SECURITYTASKS.STATE.SECURITYTASKS_ADD, {
            url: SECURITYTASKS.URL_PATH.SECURITYTASKS_ADD,
            templateUrl: SECURITYTASKS.FILE_PATH.SECURITYTASKS_ADD,
            resolve: {
                loggedin: function(MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
        .state(SECURITYTASKS.STATE.EXTERNAL_SECURITY_TASK, {
            url: SECURITYTASKS.URL_PATH.EXTERNAL_SECURITY_TASK,
            templateUrl: SECURITYTASKS.FILE_PATH.EXTERNAL_SECURITY_TASK,
            resolve: {
                loggedin: function(MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(SECURITYTASKS.STATE.ESTIMATE_EXTERNAL_TASK, {
            url: SECURITYTASKS.URL_PATH.ESTIMATE_EXTERNAL_TASK,
            templateUrl: SECURITYTASKS.FILE_PATH.ESTIMATE_EXTERNAL_TASK,
            
        })
        .state(SECURITYTASKS.STATE.EXTERNAL_TASK_VIEW, {
            url: SECURITYTASKS.URL_PATH.EXTERNAL_TASK_VIEW,
            templateUrl: SECURITYTASKS.FILE_PATH.EXTERNAL_TASK_VIEW,
            resolve: {
                loggedin: function(MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(SECURITYTASKS.STATE.SECURITYTASK_BUDGET, {
            url: SECURITYTASKS.URL_PATH.SECURITYTASK_BUDGET,
            templateUrl: SECURITYTASKS.FILE_PATH.SECURITYTASK_BUDGET,
            resolve: {
                loggedin: function(MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(SECURITYTASKS.STATE.MYTASK_LIST, {
            url: SECURITYTASKS.URL_PATH.MYTASK_LIST,
            templateUrl: SECURITYTASKS.FILE_PATH.MYTASK_LIST,
            resolve: {
                loggedin: function(MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(SECURITYTASKS.STATE.ALLTASK_LIST, {
            url: SECURITYTASKS.URL_PATH.ALLTASK_LIST,
            templateUrl: SECURITYTASKS.FILE_PATH.ALLTASK_LIST,
            resolve: {
                loggedin: function(MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(SECURITYTASKS.STATE.EXTERNALTASK_LIST, {
            url: SECURITYTASKS.URL_PATH.EXTERNALTASK_LIST,
            templateUrl: SECURITYTASKS.FILE_PATH.EXTERNALTASK_LIST,
            resolve: {
                loggedin: function(MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        });
    }


})();
