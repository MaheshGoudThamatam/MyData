'use strict';
angular.module('mean.users').config(function ($meanStateProvider, $httpProvider, jwtInterceptorProvider, USERS) {

    jwtInterceptorProvider.tokenGetter = function () {
        return localStorage.getItem('JWT');
    };

    $httpProvider.interceptors.push('jwtInterceptor');

    // states for my app
    $meanStateProvider.state(USERS.STATE.AUTH, {
			url : USERS.URL_PATH.AUTH,
			abstract : true,
			templateUrl : USERS.FILE_PATH.AUTH
		}).state(USERS.STATE.LOGIN, {
			url : USERS.URL_PATH.LOGIN,
			templateUrl : USERS.FILE_PATH.LOGIN,
			resolve : {
				loggedin : function(MeanUser) {
					return MeanUser.checkLoggedOut();
				}
			}
		}).state(USERS.STATE.REGISTER, {
			url : USERS.URL_PATH.REGISTER,
			templateUrl : USERS.FILE_PATH.REGISTER,
			resolve : {
				loggedin : function(MeanUser) {
					return MeanUser.checkLoggedOut();
				}
			}
		}).state(USERS.STATE.FORGOT_PASSWORD, {
			url : USERS.URL_PATH.FORGOT_PASSWORD,
			templateUrl : USERS.FILE_PATH.FORGOT_PASSWORD,
			resolve : {
				loggedin : function(MeanUser) {
					return MeanUser.checkLoggedOut();
				}
			}
		}).state(USERS.STATE.RESET_PASSWORD, {
			url : USERS.URL_PATH.RESET_PASSWORD,
			templateUrl : USERS.FILE_PATH.RESET_PASSWORD,
			resolve : {
				loggedin : function(MeanUser) {
					return MeanUser.checkLoggedOut();
				}
			}
		}).state(USERS.STATE.CHANGE_PASSWORD, {
			url : USERS.URL_PATH.CHANGE_PASSWORD,
			templateUrl : USERS.FILE_PATH.CHANGE_PASSWORD,
			
		}).state(USERS.STATE.USERCONFIRMATION, {
			url : USERS.URL_PATH.USERCONFIRMATION,
			templateUrl : USERS.FILE_PATH.USERCONFIRMATION,
			
		});
	});
