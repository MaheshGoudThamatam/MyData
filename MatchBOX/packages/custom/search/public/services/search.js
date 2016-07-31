'use strict';

angular.module('mean.search').factory('SearchService', [ '$resource',
	function($resource) {
		return {
			name : 'search',
			
			search: $resource('/api/search/rooms', {}, {
		        update: { method: 'PUT' },
		        query: { method: 'GET', isArray: true }
		    })
		};
	}
]);
