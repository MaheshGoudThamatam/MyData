'use strict';

angular.module('mean.mentor').factory('MentorService', function($resource) {
	return {
		user: $resource('/api/user/:userId', { userId : '@_id' }, {
			update : { method : 'PUT' },
			query: {method: 'GET', isArray:true}
		}),
		mentor: $resource('/api/updateProfile/:userId', { userId : '@_id' }, {
			update : { method : 'PUT' },
			query: {method: 'GET', isArray:true}
		}),
		mentorRequest: $resource('/api/mentorRequest/:mentorRequestId', { mentorRequestId : '@_id' }, {
			update : { method : 'PUT' },
			query: {method: 'GET', isArray:true}
		}),
		mentorRequestStatus: $resource('/api/mentorRequestStatus', {}, {
            query: {method: 'GET', isArray: false}
        })
	}
});

angular.module('mean.mentor').factory('AdminsMentorService', function($resource) {
	return {
		mentor: $resource('/api/assign/mentor/test/:mentorRequestId', { mentorRequestId : '@_id' }, {
			update : {method : 'PUT'},
			query: {method: 'GET', isArray:true}
		}),
		page: $resource('/api/mentor-request/pagination', {}, {
		    update: {method: 'PUT'},
		    query: {method: 'GET', isArray:false}
		}),
		confirmMentor : $resource('/api/confirm/mentor-request/:mentorRequestId', { mentorRequestId : '@_id' }, {
			update : {
				method : 'PUT'
			},
			query : {method : 'GET', isArray : true}
		})
	}
});