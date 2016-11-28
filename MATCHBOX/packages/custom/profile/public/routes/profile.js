'use strict';

angular.module('mean.profile').config(['$stateProvider', 'USERPROFILE',
  function($stateProvider, USERPROFILE) {

    	// states for my app
    	$stateProvider
        .state(USERPROFILE.STATE.USER_PROFILE, {
			url : USERPROFILE.URL_PATH.USER_PROFILE,
			templateUrl : USERPROFILE.FILE_PATH.USER_PROFILE,
			resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
			
		})
        .state(USERPROFILE.STATE.PRIVACY_POLICY, {
            url : USERPROFILE.URL_PATH.PRIVACY_POLICY,
            templateUrl : USERPROFILE.FILE_PATH.PRIVACY_POLICY,
        })
        .state(USERPROFILE.STATE.CONTACT_US, {
            url : USERPROFILE.URL_PATH.CONTACT_US,
            templateUrl : USERPROFILE.FILE_PATH.CONTACT_US,
        })
        .state(USERPROFILE.STATE.TERMS_OF_USE, {
            url : USERPROFILE.URL_PATH.TERMS_OF_USE,
            templateUrl : USERPROFILE.FILE_PATH.TERMS_OF_USE,
        })
        .state(USERPROFILE.STATE.ABOUT_US, {
            url : USERPROFILE.URL_PATH.ABOUT_US,
            templateUrl : USERPROFILE.FILE_PATH.ABOUT_US,
        });
	}
]);
