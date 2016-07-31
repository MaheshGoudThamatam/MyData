'use strict';

angular.module('mean.amenity').factory('AmenityService', function($resource) {
	return {
	amenity : $resource('/api/amenity/:amenityId', {  amenityId : '@_id' }, {
			update : { method : 'PUT'},
			query : { method : 'GET', isArray : true}
		}),
		/*uploadIcon : $resource('/api/v2/config/:userId/cupload',{userId : '@userId'},{
			
		})*/
		partOf :$resource('/api/partOf', {  partOfId : '@_id' }, {
			update : { method : 'PUT'},
			query : { method : 'GET', isArray : true}
		})
	};
});
