
'use strict';

angular.module('mean.space').config(['$stateProvider' , 'SPACE',
    function ($stateProvider, SPACE) {
		$stateProvider.state(SPACE.STATE.SPACE_LIST, {
			url : SPACE.URL_PATH.SPACE_LIST,
			templateUrl : SPACE.FILE_PATH.SPACE_LIST,
			resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
		})
		.state(SPACE.STATE.SPACE_CREATE, {
			url : SPACE.URL_PATH.SPACE_CREATE,
			templateUrl : SPACE.FILE_PATH.SPACE_CREATE,
			resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
		})
		.state(SPACE.STATE.SPACE_UPDATE, {
			url : SPACE.URL_PATH.SPACE_UPDATE,
			templateUrl : SPACE.FILE_PATH.SPACE_UPDATE,
			resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
		})
		.state(SPACE.STATE.SPACE_DELETE, {
			url : SPACE.URL_PATH.SPACE_DELETE,
			templateUrl : SPACE.FILE_PATH.SPACE_DELETE,
			resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
		})
		.state(SPACE.STATE.SPACE_HOLIDAY_LIST, {
			url : SPACE.URL_PATH.SPACE_HOLIDAY_LIST,
			templateUrl : SPACE.FILE_PATH.SPACE_HOLIDAY_LIST,
			resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
		})
		.state(SPACE.STATE.SPACE_HOLIDAY_CREATE, {
			url : SPACE.URL_PATH.SPACE_HOLIDAY_CREATE,
			templateUrl : SPACE.FILE_PATH.SPACE_HOLIDAY_CREATE,
			resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
		})
		.state(SPACE.STATE.SPACE_HOLIDAY_EDIT, {
			url : SPACE.URL_PATH.SPACE_HOLIDAY_EDIT,
			templateUrl : SPACE.FILE_PATH.SPACE_HOLIDAY_EDIT,
			resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
		})
		.state(SPACE.STATE.SPACE_ADDROOM, {
			url : SPACE.URL_PATH.SPACE_ADDROOM,
			templateUrl : SPACE.FILE_PATH.SPACE_ADDROOM,
			resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
		});
	}
]);
