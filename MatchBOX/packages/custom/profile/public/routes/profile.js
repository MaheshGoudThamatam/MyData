'use strict';

angular.module('mean.profile').config(['$stateProvider', 'USERPROFILE',
  function($stateProvider, USERPROFILE) {

    	// states for my app
    	$stateProvider.state(USERPROFILE.STATE.USER_PROFILE, {
			url : USERPROFILE.URL_PATH.USER_PROFILE,
			templateUrl : USERPROFILE.FILE_PATH.USER_PROFILE,
			
		});
	}
]);
