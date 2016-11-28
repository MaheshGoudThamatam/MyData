'use strict';

angular.module('mean.rooms').config([ '$stateProvider', 'ROOMS',
    function($stateProvider, ROOMS) {
		$stateProvider.state('rooms example page', {
			url : '/rooms/example',
			templateUrl : 'rooms/views/index.html',
			resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
		}).state(ROOMS.STATE.ROOM_LIST, {
			url : ROOMS.URL_PATH.ROOM_LIST,
			templateUrl : ROOMS.FILE_PATH.ROOM_LIST,
			resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
		})
		.state(ROOMS.STATE.ROOM_EDIT, {
			url : ROOMS.URL_PATH.ROOM_EDIT,
			templateUrl : ROOMS.FILE_PATH.ROOM_EDIT,
			resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
		})
		.state(ROOMS.STATE.PACKAGE_EDIT, {
			url : ROOMS.URL_PATH.PACKAGE_EDIT,
			templateUrl : ROOMS.FILE_PATH.PACKAGE_EDIT,
			resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
		})
		.state(ROOMS.STATE.ADMIN_ROOM_LIST, {
			url : ROOMS.URL_PATH.ADMIN_ROOM_LIST,
			templateUrl : ROOMS.FILE_PATH.ADMIN_ROOM_LIST,
			resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
		})
		.state(ROOMS.STATE.ADMIN_ROOM_LIST_VIEW, {
			url : ROOMS.URL_PATH.ADMIN_ROOM_LIST_VIEW,
			templateUrl : ROOMS.FILE_PATH.ADMIN_ROOM_LIST_VIEW,
			resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
		})
		.state(ROOMS.STATE.ADMIN_SPACE_LIST_VIEW, {
			url : ROOMS.URL_PATH.ADMIN_SPACE_LIST_VIEW,
			templateUrl : ROOMS.FILE_PATH.ADMIN_SPACE_LIST_VIEW,
			resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
		});
	} 
]);
