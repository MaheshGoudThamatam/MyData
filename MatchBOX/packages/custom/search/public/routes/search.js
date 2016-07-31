'use strict';

angular.module('mean.search').config(['$stateProvider' , 'SEARCH',

    function ($stateProvider, SEARCH) {
		$stateProvider.state(SEARCH.STATE.SEARCH_LIST, {
			url : SEARCH.URL_PATH.SEARCH_LIST,
			templateUrl : SEARCH.FILE_PATH.SEARCH_LIST
		})
		.state(SEARCH.STATE.SEARCH_DETAILS, {
			url : SEARCH.URL_PATH.SEARCH_DETAILS,
			templateUrl : SEARCH.FILE_PATH.SEARCH_DETAILS
		})
		.state(SEARCH.STATE.MAP_VIEW, {
			url : SEARCH.URL_PATH.MAP_VIEW,
			templateUrl : SEARCH.FILE_PATH.MAP_VIEW
		});
		
	}
]);

