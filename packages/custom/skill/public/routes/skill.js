'use strict';

angular.module('mean.skill').config(function ($stateProvider, SKILL) {
    $stateProvider
        .state(SKILL.STATE.SKILL, {
            url: SKILL.URL_PATH.SKILL,
            templateUrl: SKILL.FILE_PATH.SKILL,
            abstract: true
        })
        .state(SKILL.STATE.SKILL_LIST, {
            url: SKILL.URL_PATH.SKILL_LIST,
            templateUrl: SKILL.FILE_PATH.SKILL_LIST,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(SKILL.STATE.SKILL_CREATE, {
            url: SKILL.URL_PATH.SKILL_CREATE,
            templateUrl: SKILL.FILE_PATH.SKILL_CREATE,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(SKILL.STATE.SKILL_EDIT, {
            url: SKILL.URL_PATH.SKILL_EDIT,
            templateUrl: SKILL.FILE_PATH.SKILL_EDIT,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        })
});
