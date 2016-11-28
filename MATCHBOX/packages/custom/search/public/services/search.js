'use strict';

angular.module('mean.search').factory('SearchService', [ '$resource',
	function($resource) {
		return {
			name : 'search',
			
			search: $resource('/api/search/rooms', {}, {
		        update: { method: 'PUT' },
		        query: { method: 'GET', isArray: true }
		    }),
		    
		    searchEventCalendarHotDesk: $resource('/api/search/event-calendar/hotDesks', {}, {
		        update: { method: 'PUT' },
		        query: { method: 'GET', isArray: true }
		    }),
		    
		    areas : $resource('/api/city/search-area/:areaId', {areaId : '@areaId'}, {
		        update: { method: 'PUT' },
		        query: { method: 'GET', isArray: true }
		    }),
		    
		    city : $resource('/api/location/city/:cityId', {cityId : '@cityId'}, {
		        update: { method: 'PUT' },
		        query: { method: 'GET', isArray: true }
		    }),
		    
		};
	}
]);
