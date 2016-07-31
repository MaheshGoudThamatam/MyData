'use strict';

angular.module('mean.amenity').config(['$stateProvider' , 'AMENITY',
    function ($stateProvider, AMENITY) {
		$stateProvider.state(AMENITY.STATE.AMENITY_LIST, {
			url : AMENITY.URL_PATH.AMENITY_LIST,
			templateUrl : AMENITY.FILE_PATH.AMENITY_LIST
		})
		.state(AMENITY.STATE.AMENITY_CREATE, {
			url : AMENITY.URL_PATH.AMENITY_CREATE,
			templateUrl : AMENITY.FILE_PATH.AMENITY_CREATE
		})
		.state(AMENITY.STATE.AMENITY_UPDATE, {
			url : AMENITY.URL_PATH.AMENITY_UPDATE,
			templateUrl : AMENITY.FILE_PATH.AMENITY_UPDATE
		});
			}
]);