
'use strict';

angular.module('mean.space_type').factory('SpaceTypeService', 
	function($resource) {
		return {
			name : 'space_type',
			
			page: $resource('/api/space-type/pagination', {}, {
		        update: { method: 'PUT' },
		        query: { method: 'GET', isArray: true }
		    }),
			
		    crud: $resource('/api/spaceType/:spaceTypeId', { spaceTypeId : '@_id' }, {
		        update: { method: 'PUT' },
		        query: { method: 'GET', isArray: true }
		    }),
		};
	});
