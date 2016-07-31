'use strict';

angular.module('mean.rooms').config([ '$stateProvider', 'ROOMS',
    function($stateProvider, ROOMS) {
		$stateProvider.state('rooms example page', {
			url : '/rooms/example',
			templateUrl : 'rooms/views/index.html'
		}).state(ROOMS.STATE.ROOM_LIST, {
			url : ROOMS.URL_PATH.ROOM_LIST,
			templateUrl : ROOMS.FILE_PATH.ROOM_LIST
		}).state(ROOMS.STATE.ROOM_EDIT, {
			url : ROOMS.URL_PATH.ROOM_EDIT,
			templateUrl : ROOMS.FILE_PATH.ROOM_EDIT
		}).state(ROOMS.STATE.ADMIN_ROOM_LIST, {
			url : ROOMS.URL_PATH.ADMIN_ROOM_LIST,
			templateUrl : ROOMS.FILE_PATH.ADMIN_ROOM_LIST
		}).state(ROOMS.STATE.ADMIN_ROOM_LIST_VIEW, {
			url : ROOMS.URL_PATH.ADMIN_ROOM_LIST_VIEW,
			templateUrl : ROOMS.FILE_PATH.ADMIN_ROOM_LIST_VIEW
		});
	} 
]);
