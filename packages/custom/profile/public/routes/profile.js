'use strict';

angular.module('mean.profile').config(function ($stateProvider, PROFILE) {

    $stateProvider
        .state(PROFILE.STATE.PROFILE, {
            url: PROFILE.URL_PATH.PROFILE,
            templateUrl: PROFILE.FILE_PATH.PROFILE,
            abstract: true
        })
        .state(PROFILE.STATE.PROFILELIST, {
            url: PROFILE.URL_PATH.PROFILELIST,
            templateUrl: PROFILE.FILE_PATH.PROFILELIST,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(PROFILE.STATE.PROJECTCREATE, {
            url: PROFILE.URL_PATH.PROJECTCREATE,
            templateUrl: PROFILE.FILE_PATH.PROJECTCREATE,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(PROFILE.STATE.PROJECTEDIT, {
            url: PROFILE.URL_PATH.PROJECTEDIT,
            templateUrl: PROFILE.FILE_PATH.PROJECTEDIT,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(PROFILE.STATE.UPLOADPROFILEPICTURE, {
            url: PROFILE.URL_PATH.UPLOADPROFILEPICTURE,
            templateUrl: PROFILE.FILE_PATH.UPLOADPROFILEPICTURE,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(PROFILE.STATE.UPLOADRESUME, {
            url: PROFILE.URL_PATH.UPLOADRESUME,
            templateUrl: PROFILE.FILE_PATH.UPLOADRESUME,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(PROFILE.STATE.DASHBOARD, {
            url: PROFILE.URL_PATH.DASHBOARD,
            templateUrl: PROFILE.FILE_PATH.DASHBOARD,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(PROFILE.STATE.PROFILEPORTFOLIO, {
            url: PROFILE.URL_PATH.PROFILEPORTFOLIO,
            templateUrl: PROFILE.FILE_PATH.PROFILEPORTFOLIO,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(PROFILE.STATE.PROFILEPORTFOLIODETAILS, {
            url: PROFILE.URL_PATH.PROFILEPORTFOLIODETAILS,
            templateUrl: PROFILE.FILE_PATH.PROFILEPORTFOLIODETAILS,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(PROFILE.STATE.EDITPROFILE, {
            url: PROFILE.URL_PATH.EDITPROFILE,
            templateUrl: PROFILE.FILE_PATH.EDITPROFILE,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }

        }).state(PROFILE.STATE.PROFILEBADGES, {
            url: PROFILE.URL_PATH.PROFILEBADGES,
            templateUrl: PROFILE.FILE_PATH.PROFILEBADGES,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(PROFILE.STATE.PROFILEREVIEWS, {
            url: PROFILE.URL_PATH.PROFILEREVIEWS,
            templateUrl: PROFILE.FILE_PATH.PROFILEREVIEWS,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(PROFILE.STATE.PROFILERESUME, {
            url: PROFILE.URL_PATH.PROFILERESUME,
            templateUrl: PROFILE.FILE_PATH.PROFILERESUME,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(PROFILE.STATE.PROFILE_PERFORMANCE, {
            url: PROFILE.URL_PATH.PROFILE_PERFORMANCE,
            templateUrl: PROFILE.FILE_PATH.PROFILE_PERFORMANCE,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(PROFILE.STATE.EDUCATIONAL_DETAILS_CREATE, {
            url: PROFILE.URL_PATH.EDUCATIONAL_DETAILS_CREATE,
            templateUrl: PROFILE.FILE_PATH.EDUCATIONAL_DETAILS_CREATE,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }

        }).state(PROFILE.STATE.EDUCATIONAL_DETAILS_EDIT, {
            url: PROFILE.URL_PATH.EDUCATIONAL_DETAILS_EDIT,
            templateUrl: PROFILE.FILE_PATH.EDUCATIONAL_DETAILS_EDIT,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }

        }).state(PROFILE.STATE.PROFILE_TABS, {
            url: PROFILE.URL_PATH.PROFILE_TABS,
            templateUrl: PROFILE.FILE_PATH.PROFILE_TABS,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(PROFILE.STATE.PROFILE_PORTFOLIO_CONTENT, {
            url: PROFILE.URL_PATH.PROFILE_PORTFOLIO_CONTENT,
            templateUrl: PROFILE.FILE_PATH.PROFILE_PORTFOLIO_CONTENT,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(PROFILE.STATE.PROFILE_ABOUT_ME, {
            url: PROFILE.URL_PATH.PROFILE_ABOUT_ME,
            templateUrl: PROFILE.FILE_PATH.PROFILE_ABOUT_ME,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(PROFILE.STATE.PROFILE_PORTFOLIO_EDIT, {
            url: PROFILE.URL_PATH.PROFILE_PORTFOLIO_EDIT,
            templateUrl: PROFILE.FILE_PATH.PROFILE_PORTFOLIO_EDIT,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(PROFILE.STATE.PROFILE_MY_CALENDER, {
            url: PROFILE.URL_PATH.PROFILE_MY_CALENDER,
            templateUrl: PROFILE.FILE_PATH.PROFILE_MY_CALENDER,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(PROFILE.STATE.PROFILE_LOCK_SCREEN, {
            url: PROFILE.URL_PATH.PROFILE_LOCK_SCREEN,
            templateUrl: PROFILE.FILE_PATH.PROFILE_LOCK_SCREEN,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(PROFILE.STATE.PROFILE_MY_PROFILE, {
            url: PROFILE.URL_PATH.PROFILE_MY_PROFILE,
            templateUrl: PROFILE.FILE_PATH.PROFILE_MY_PROFILE,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(PROFILE.STATE.PROFILE_MY_MESSAGE, {
            url: PROFILE.URL_PATH.PROFILE_MY_MESSAGE,
            templateUrl: PROFILE.FILE_PATH.PROFILE_MY_MESSAGE,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(PROFILE.STATE.PROFILE_MY_TIMELINE, {
            url: PROFILE.URL_PATH.PROFILE_MY_TIMELINE,
            templateUrl: PROFILE.FILE_PATH.PROFILE_MY_TIMELINE,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(PROFILE.STATE.PROFILE_EDIT_ACCOUNT, {
            url: PROFILE.URL_PATH.PROFILE_EDIT_ACCOUNT,
            templateUrl: PROFILE.FILE_PATH.PROFILE_EDIT_ACCOUNT,
            resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        });
});