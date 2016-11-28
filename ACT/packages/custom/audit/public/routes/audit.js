/**
 * @ <author> Abha Singh
 * @ <date> 12-07-2016
 * @ routes: 
 */
(function() {
    'use strict';
    angular.module('mean.audit').config(Audit);
    Audit.$inject = ['$stateProvider', 'AUDIT'];

    function Audit($stateProvider, AUDIT) {
        $stateProvider
            .state(AUDIT.STATE.LIST_AUDITCATEGORY, {
                url: AUDIT.PATH.LIST_AUDITCATEGORY,
                templateUrl: AUDIT.FILE_PATH.LIST_AUDITCATEGORY,
                resolve: {
                    loggedin: function(MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(AUDIT.STATE.CREATE_AUDITCATEGORY, {
                url: AUDIT.PATH.CREATE_AUDITCATEGORY,
                templateUrl: AUDIT.FILE_PATH.CREATE_AUDITCATEGORY,
                resolve: {
                    loggedin: function(MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(AUDIT.STATE.EDIT_AUDITCATEGORY, {
                url: AUDIT.PATH.EDIT_AUDITCATEGORY,
                templateUrl: AUDIT.FILE_PATH.EDIT_AUDITCATEGORY,
                resolve: {
                    loggedin: function(MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            }).state(AUDIT.STATE.AUDITCATEGORY_BULKUPLOAD, {
                url: AUDIT.PATH.AUDITCATEGORY_BULKUPLOAD,
                templateUrl: AUDIT.FILE_PATH.AUDITCATEGORY_BULKUPLOAD,
                resolve: {
                    loggedin: function(MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            }).state(AUDIT.STATE.AUDITCREATE, {
                url: AUDIT.PATH.AUDITCREATE,
                templateUrl: AUDIT.FILE_PATH.AUDITCREATE,
                resolve: {
                    loggedin: function(MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(AUDIT.STATE.AUDITLIST, {
                url: AUDIT.PATH.AUDITLIST,
                templateUrl: AUDIT.FILE_PATH.AUDITLIST,
                resolve: {
                    loggedin: function(MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(AUDIT.STATE.AUDITLISTBACK, {
                url: AUDIT.PATH.AUDITLISTBACK,
                templateUrl: AUDIT.FILE_PATH.AUDITLISTBACK,
                resolve: {
                    loggedin: function(MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(AUDIT.STATE.AUDITEDIT, {
                url: AUDIT.PATH.AUDITEDIT,
                templateUrl: AUDIT.FILE_PATH.AUDITEDIT,
                resolve: {
                    loggedin: function(MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(AUDIT.STATE.PERFORMAUDIT, {
                url: AUDIT.PATH.PERFORMAUDIT,
                templateUrl: AUDIT.FILE_PATH.PERFORMAUDIT,
                resolve: {
                    loggedin: function(MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            }).state(AUDIT.STATE.PERFORMAUDITVIEW, {
                url: AUDIT.PATH.PERFORMAUDITVIEW,
                templateUrl: AUDIT.FILE_PATH.PERFORMAUDITVIEW,
                resolve: {
                    loggedin: function(MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            }).state(AUDIT.STATE.PERFORMEDLIST, {
                url: AUDIT.PATH.PERFORMEDLIST,
                templateUrl: AUDIT.FILE_PATH.PERFORMEDLIST,
                resolve: {
                    loggedin: function(MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            });
    }

})();
