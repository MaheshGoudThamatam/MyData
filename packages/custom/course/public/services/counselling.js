'use strict';
angular.module('mean.course').factory('CounsellingService', function($resource) {
    return {
    	counsellingDateRequest: $resource('/api/dateRequestList', {}, {
			update : { method : 'PUT' },
			query: {method: 'GET', isArray:true}
		}),
		counsellingRequestDelete: $resource('/api/deleteRequest/:counsellingId', {counsellingId: '@_id'}, {
			update : { method : 'PUT' },
			query: {method: 'GET', isArray:true}
		}),
		counsellingSlotRequest: $resource('/api/slotList', {data: 'data', courseId: 'courseId', branchId: 'branchId'}, {
			update : { method : 'PUT' },
			query: {method: 'GET', isArray:true}
		}),
		counsellingRequestUser: $resource('/api/dateRequestUser', {}, {
			update : { method : 'PUT' },
			query: {method: 'GET', isArray:true}
		})
    }
})