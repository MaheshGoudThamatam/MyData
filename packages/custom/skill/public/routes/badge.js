'use strict';

angular.module('mean.skill').config(function ($stateProvider, SKILL) {
    $stateProvider
        .state(SKILL.STATE.BADGE, {
            url: SKILL.URL_PATH.BADGE,
            templateUrl: SKILL.FILE_PATH.BADGE,
            abstract: true
        })
        .state(SKILL.STATE.BADGE_LIST, {
            url: SKILL.URL_PATH.BADGE_LIST,
            templateUrl: SKILL.FILE_PATH.BADGE_LIST

        }).state(SKILL.STATE.BADGE_CREATE, {
            url: SKILL.URL_PATH.BADGE_CREATE,
            templateUrl: SKILL.FILE_PATH.BADGE_CREATE,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(SKILL.STATE.BADGE_EDIT, {
            url: SKILL.URL_PATH.BADGE_EDIT,
            templateUrl: SKILL.FILE_PATH.BADGE_EDIT,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        });
});