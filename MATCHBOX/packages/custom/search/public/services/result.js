'use strict';

angular.module('mean.search').factory('RoomResultService',
  function($resource) {
    return {
    	amenity : $resource('/api/amenity/:amenityId', {  amenityId : '@_id' }, {
			update : { method : 'PUT'},
			query : { method : 'GET', isArray : true}
		}),
		page : $resource('/api/roomList/pagination', {}, {
			update : { method : 'PUT'},
			query : { method : 'GET', isArray : true}
		}),
		loadRating : $resource('/api/space/:spaceId/reviews', {  spaceId : '@spaceId' }, {
			query : { method : 'GET', isArray : true}
		}),
		getSpaceDetail : $resource('/api/getSpaceRoomDetail/:roomId', {  roomId : '@roomId' }, {
			query : { method : 'GET', isArray : false}
		})
		
  };
  });
