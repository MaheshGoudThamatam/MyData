(function() {
    'use strict';
    angular.module('mean.assets').config(Assets);
    Assets.$inject = ['$stateProvider','ASSETS'];

    function Assets($stateProvider, ASSETS) {
        $stateProvider
        .state(ASSETS.STATE.GUARDLIST, {
            url: ASSETS.PATH.GUARDLIST,
            templateUrl: ASSETS.FILE_PATH.GUARDLIST
        })
        .state(ASSETS.STATE.GUARDCREATE, {
            url: ASSETS.PATH.GUARDCREATE,
            templateUrl: ASSETS.FILE_PATH.GUARDCREATE
        })
        .state(ASSETS.STATE.GUARDEDIT, {
            url: ASSETS.PATH.GUARDEDIT,
            templateUrl: ASSETS.FILE_PATH.GUARDEDIT
        })
        .state(ASSETS.STATE.CAMERA_LIST, {
            url: ASSETS.PATH.CAMERA_LIST,
            templateUrl: ASSETS.FILE_PATH.CAMERA_LIST
        })
        .state(ASSETS.STATE.CAMERA_ADD, {
            url: ASSETS.PATH.CAMERA_ADD,
            templateUrl: ASSETS.FILE_PATH.CAMERA_ADD
        })
        .state(ASSETS.STATE.CAMERA_EDIT, {
            url: ASSETS.PATH.CAMERA_EDIT,
            templateUrl: ASSETS.FILE_PATH.CAMERA_EDIT
        })
        .state(ASSETS.STATE.BURGLARALARM_LIST, {
            url: ASSETS.PATH.BURGLARALARM_LIST,
            templateUrl: ASSETS.FILE_PATH.BURGLARALARM_LIST
        })
        .state(ASSETS.STATE.BURGLARALARM_ADD, {
            url: ASSETS.PATH.BURGLARALARM_ADD,
            templateUrl: ASSETS.FILE_PATH.BURGLARALARM_ADD
        })
        .state(ASSETS.STATE.BURGLARALARM_EDIT, {
            url: ASSETS.PATH.BURGLARALARM_EDIT,
            templateUrl: ASSETS.FILE_PATH.BURGLARALARM_EDIT
        })
        .state(ASSETS.STATE.ASSETS_ACCESSCONTROL_LIST, {
            url: ASSETS.PATH.ASSETS_ACCESSCONTROL_LIST,
            templateUrl: ASSETS.FILE_PATH.ASSETS_ACCESSCONTROL_LIST
        })
        .state(ASSETS.STATE.ASSETS_ACCESSCONTROL_CREATE, {
            url: ASSETS.PATH.ASSETS_ACCESSCONTROL_CREATE,
            templateUrl: ASSETS.FILE_PATH.ASSETS_ACCESSCONTROL_CREATE
        })
        .state(ASSETS.STATE.ASSETS_ACCESSCONTROL_EDIT, {
            url: ASSETS.PATH.ASSETS_ACCESSCONTROL_EDIT,
            templateUrl: ASSETS.FILE_PATH.ASSETS_ACCESSCONTROL_EDIT
        }).state(ASSETS.STATE.CAMERA_CLONE, {
            url: ASSETS.PATH.CAMERA_CLONE,
            templateUrl: ASSETS.FILE_PATH.CAMERA_CLONE
        }).state(ASSETS.STATE.ASSETS_ACCESSCONTROL_CLONE, {
            url: ASSETS.PATH.ASSETS_ACCESSCONTROL_CLONE,
            templateUrl: ASSETS.FILE_PATH.ASSETS_ACCESSCONTROL_CLONE
        }).state(ASSETS.STATE.BURGLARALARM_CLONE, {
            url: ASSETS.PATH.BURGLARALARM_CLONE,
            templateUrl: ASSETS.FILE_PATH.BURGLARALARM_CLONE
        }).state(ASSETS.STATE.GUARDCLONE, {
            url: ASSETS.PATH.GUARDCLONE,
            templateUrl: ASSETS.FILE_PATH.GUARDCLONE
        });
    }
})();
