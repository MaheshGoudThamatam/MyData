'use strict';

angular.module('mean.amenity').config(function($stateProvider , AMENITY)
     {
		$stateProvider
		.state(AMENITY.STATE.AMENITY_LIST, {
			url : AMENITY.URL_PATH.AMENITY_LIST,
			templateUrl : AMENITY.FILE_PATH.AMENITY_LIST,
			resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
		})
		.state(AMENITY.STATE.AMENITY_CREATE, {
			url : AMENITY.URL_PATH.AMENITY_CREATE,
			templateUrl : AMENITY.FILE_PATH.AMENITY_CREATE,
			resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
		})
		.state(AMENITY.STATE.AMENITY_UPDATE, {
			url : AMENITY.URL_PATH.AMENITY_UPDATE,
			templateUrl : AMENITY.FILE_PATH.AMENITY_UPDATE,
			resolve: {
                loggedin: function (MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
		});
			
     });