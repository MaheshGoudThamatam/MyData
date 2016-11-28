(function() {
    'use strict';
    angular.module('mean.documents').config(Documents);
    Documents.$inject = ['$stateProvider', 'DOCUMENT'];

    function Documents($stateProvider, DOCUMENT) {
        $stateProvider.state(DOCUMENT.STATE.DOCUMENT_CATEGORY_ADD, {
            url: DOCUMENT.PATH.DOCUMENT_CATEGORY_ADD,
            templateUrl: DOCUMENT.FILE_PATH.DOCUMENT_CATEGORY_ADD,
            resolve: {
                loggedin: function(MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
        .state(DOCUMENT.STATE.DOCUMENT_LIST, {
            url: DOCUMENT.PATH.DOCUMENT_LIST,
            templateUrl: DOCUMENT.FILE_PATH.DOCUMENT_LIST,
            resolve: {
                loggedin: function(MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
        .state(DOCUMENT.STATE.DOCUMENT_CATEGORY_LIST, {
            url: DOCUMENT.PATH.DOCUMENT_CATEGORY_LIST,
            templateUrl: DOCUMENT.FILE_PATH.DOCUMENT_CATEGORY_LIST,
            resolve: {
                loggedin: function(MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
        .state(DOCUMENT.STATE.DOCUMENT_ADD, {
            url: DOCUMENT.PATH.DOCUMENT_ADD,
            templateUrl: DOCUMENT.FILE_PATH.DOCUMENT_ADD,
            resolve: {
                loggedin: function(MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
        .state(DOCUMENT.STATE.DOCUMENT_CATEGORY_EDIT, {
            url: DOCUMENT.PATH.DOCUMENT_CATEGORY_EDIT,
            templateUrl: DOCUMENT.FILE_PATH.DOCUMENT_CATEGORY_EDIT,
            resolve: {
                loggedin: function(MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(DOCUMENT.STATE.DOCUMENT_EDIT, {
            url: DOCUMENT.PATH.DOCUMENT_EDIT,
            templateUrl: DOCUMENT.FILE_PATH.DOCUMENT_EDIT,
            resolve: {
                loggedin: function(MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        });
    }


})();
