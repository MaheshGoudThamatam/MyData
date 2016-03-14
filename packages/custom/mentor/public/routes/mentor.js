'use strict';

angular.module('mean.mentor').config(['$stateProvider', 'MENTOR',
    function ($stateProvider, MENTOR) {
        $stateProvider
            .state('mentor example page', {
                url: '/mentor/example',
                templateUrl: '/mentor/views/index.html'
            })
            .state(MENTOR.STATE.MENTOR_REQUEST_LIST, {
                url: MENTOR.URL_PATH.MENTOR_REQUEST_LIST,
                templateUrl: MENTOR.FILE_PATH.MENTOR_REQUEST_LIST,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(MENTOR.STATE.MENTOR_DETAIL_PAGE, {
                url: MENTOR.URL_PATH.MENTOR_DETAIL_PAGE,
                templateUrl: MENTOR.FILE_PATH.MENTOR_DETAIL_PAGE,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(MENTOR.STATE.CREATEPROJECT, {
                url: MENTOR.URL_PATH.CREATEPROJECT,
                templateUrl: MENTOR.FILE_PATH.CREATEPROJECT,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(MENTOR.STATE.UPDATEPROJECT, {
                url: MENTOR.URL_PATH.UPDATEPROJECT,
                templateUrl: MENTOR.FILE_PATH.UPDATEPROJECT,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(MENTOR.STATE.PROJECTLIST, {
                url: MENTOR.URL_PATH.PROJECTLIST,
                templateUrl: MENTOR.FILE_PATH.PROJECTLIST,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(MENTOR.STATE.MENTOR_LIST, {
                url: MENTOR.URL_PATH.MENTOR_LIST,
                templateUrl: MENTOR.FILE_PATH.MENTOR_LIST,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(MENTOR.STATE.MENTOR_FEEDBACK, {
                url: MENTOR.URL_PATH.MENTOR_FEEDBACK,
                templateUrl: MENTOR.FILE_PATH.MENTOR_FEEDBACK,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(MENTOR.STATE.MENTOR_ASSOCIATED_OBJECT, {
                url: MENTOR.URL_PATH.MENTOR_ASSOCIATED_OBJECT,
                templateUrl: MENTOR.FILE_PATH.MENTOR_ASSOCIATED_OBJECT,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(MENTOR.STATE.PROJECTDETAIL, {
                url: MENTOR.URL_PATH.PROJECTDETAIL,
                templateUrl: MENTOR.FILE_PATH.PROJECTDETAIL,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(MENTOR.STATE.ADMIN_MENTOR_ONLINETEST, {
                url: MENTOR.URL_PATH.ADMIN_MENTOR_ONLINETEST,
                templateUrl: MENTOR.FILE_PATH.ADMIN_MENTOR_ONLINETEST,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(MENTOR.STATE.MENTOR_PROJECTLIST, {
                url: MENTOR.URL_PATH.MENTOR_PROJECTLIST,
                templateUrl: MENTOR.FILE_PATH.MENTOR_PROJECTLIST,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(MENTOR.STATE.MENTOR_INFO, {
	            url: MENTOR.URL_PATH.MENTOR_INFO,
	            templateUrl: MENTOR.FILE_PATH.MENTOR_INFO,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(MENTOR.STATE.FULL_CALENDAR, {
                url: MENTOR.URL_PATH.FULL_CALENDAR,
                templateUrl: MENTOR.FILE_PATH.FULL_CALENDAR,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
             .state(MENTOR.STATE.MENTOR_REQUEST_STATUS, {
                url: MENTOR.URL_PATH.MENTOR_REQUEST_STATUS,
                templateUrl: MENTOR.FILE_PATH.MENTOR_REQUEST_STATUS,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            });
        }
]);
