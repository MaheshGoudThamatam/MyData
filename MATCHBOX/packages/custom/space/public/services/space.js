
'use strict';

angular.module('mean.space').factory('SpaceService', 
	function($resource) {
		return {
			name : 'space',
			
			page: $resource('/api/space/pagination', {}, {
		        update: { method: 'PUT' },
		        query: { method: 'GET', isArray: true }
		    }),
			
		    crud: $resource('/api/space/:spaceId', { spaceId : '@_id' }, {
		        update: { method: 'PUT' },
		        query: { method: 'GET', isArray: true }
		    }),
		    spacePartner: $resource('/api/partner/:partnerId/space', { partnerId : '@_id' }, {
		        update: { method: 'PUT' },
		        query: { method: 'GET', isArray: true }
		    }),
		    teamRole:$resource('/api/role/filteredRoles/list', {}, {
		        update: { method: 'PUT' },
		        query: { method: 'GET', isArray: true }
		    }),
            amenity : $resource('/api/amenity-space/:appliesToId', {appliesToId : '@appliesToId'}, {
		    	update: { method: 'PUT' },
		        query: { method: 'GET', isArray: true }
		    }),
		    partner : $resource('/api/space/partner', {}, {
		    	update: { method: 'PUT' },
		        query: { method: 'GET', isArray: true }
		    }),
		    virtualOfficeFacilities : $resource('api/virtualOffice/facilities', {}, {
		        query: { method: 'GET', isArray: true }
		    }),
		    virtualOffice : $resource('api/virtualOffices', {}, {
		    	query: { method: 'GET', isArray: true }
		    }),
		    spaceAddress: $resource('/api/partner/team/:userId/space', { userId : '@_id' }, {
		        update: { method: 'PUT' },
		        query: { method: 'GET', isArray: true }
		    }),
		    backOfficeSpace:$resource('/api/getSpaceBackOffice', {}, {
		        update: { method: 'PUT' },
		        query: { method: 'GET', isArray: true }
		    }),

		    fetchRole:$resource('/api/fetchRole', {}, {
		        update: { method: 'PUT' },
		        query: { method: 'GET', isArray: true }
		    }),
		   sendToSpaceApprove: $resource('/api/space/admin/spaceSendToAdminApproval', {}, {
	            update: {
	                method: 'PUT' // this method issues a PUT request
	            },
	            query: {
	                method: 'GET',
	                isArray: true
	            }
           }),
           spaceByRole: $resource('/api/event-scheduler/space/role', {}, {
		        update: { method: 'PUT' },
		        query: { method: 'GET', isArray: true }
		    })

		};
	});
