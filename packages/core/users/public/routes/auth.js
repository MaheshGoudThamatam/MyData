'use strict';

//Setting up route
angular.module('mean.users').config(['$meanStateProvider', '$httpProvider', 'jwtInterceptorProvider', 'USERS',
    function ($meanStateProvider, $httpProvider, jwtInterceptorProvider, USERS) {

        jwtInterceptorProvider.tokenGetter = function () {
            return localStorage.getItem('JWT');
        };

        $httpProvider.interceptors.push('jwtInterceptor');

        // states for my app
        $meanStateProvider
            .state(USERS.STATE.AUTH, {
                url: USERS.URL_PATH.AUTH,
                templateUrl: USERS.FILE_PATH.AUTH
            })
            .state(USERS.STATE.LOGIN, {
                url: USERS.URL_PATH.LOGIN,
                templateUrl: USERS.FILE_PATH.LOGIN,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedOut();
                    }
                }
            })
            .state(USERS.STATE.REGISTER, {
                url: USERS.URL_PATH.REGISTER,
                templateUrl: USERS.FILE_PATH.REGISTER,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedOut();
                    }
                }
            })
            .state(USERS.STATE.FORGOTPASSWORD, {
                url: USERS.URL_PATH.FORGOTPASSWORD,
                templateUrl: USERS.FILE_PATH.FORGOTPASSWORD,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedOut();
                    }
                }
            })
            .state(USERS.STATE.RESETPASSOWRD, {
                url: USERS.URL_PATH.RESETPASSOWRD,
                templateUrl: USERS.FILE_PATH.RESETPASSOWRD,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedOut();
                    }
                }
            })

            .state(USERS.STATE.EDITUSER, {
                url: USERS.URL_PATH.EDITUSER,
                templateUrl: USERS.FILE_PATH.EDITUSER,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(USERS.STATE.USERLIST, {
                url: USERS.URL_PATH.USERLIST,
                templateUrl: USERS.FILE_PATH.USERLIST,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(USERS.STATE.USERCREATE, {
                url: USERS.URL_PATH.USERCREATE,
                templateUrl: USERS.FILE_PATH.USERCREATE,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(USERS.STATE.USEREDIT, {
                url: USERS.URL_PATH.USEREDIT,
                templateUrl: USERS.FILE_PATH.USEREDIT,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(USERS.STATE.USERVIEW, {
                url: USERS.URL_PATH.USERVIEW,
                templateUrl: USERS.FILE_PATH.USERVIEW,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }

            })
            .state(USERS.STATE.USERVIEW1, {
                url: USERS.URL_PATH.USERVIEW1,
                templateUrl: USERS.FILE_PATH.USERVIEW1,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(USERS.STATE.SUCCESS, {
                url: USERS.URL_PATH.SUCCESS,
                templateUrl: USERS.FILE_PATH.SUCCESS,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(USERS.STATE.CONFIRM, {
                url: USERS.URL_PATH.CONFIRM,
                templateUrl: USERS.FILE_PATH.CONFIRM,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedOut();
                    }
                }
            })
            .state(USERS.STATE.CHANGEPASSWORD, {
                url: USERS.URL_PATH.CHANGEPASSWORD,
                templateUrl: USERS.FILE_PATH.CHANGEPASSWORD,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(USERS.STATE.TEST, {
                url: USERS.URL_PATH.TEST,
                templateUrl: USERS.FILE_PATH.TEST,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(USERS.STATE.MENTORREG, {
                url: USERS.URL_PATH.MENTORREG,
                templateUrl: USERS.FILE_PATH.MENTORREG,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            })
            .state(USERS.STATE.LOCK_SCREEN, {
                url: USERS.URL_PATH.LOCK_SCREEN,
                templateUrl: USERS.FILE_PATH.LOCK_SCREEN,
                resolve: {
                    loggedin: function (MeanUser) {
                        return MeanUser.checkLoggedin();
                    }
                }
            });
    }
]);