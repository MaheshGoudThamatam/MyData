'use strict';
angular.module('mean.course').factory('AdminCounsellingService', function($resource) {
    return {
    	course: $resource('/api/branchCourse/:branchId', {branchId: '@_id'}, {
			update : { method : 'PUT' },
			query: {method: 'GET', isArray:true}
		}),
		scheduleCreate: $resource('/api/scheduleCreate', {}, {
			update : { method : 'PUT' },
			query: {method: 'GET', isArray:true}
		}),
		user: $resource('/api/userList/:branchIdUser', {branchIdUser: '@_id'}, {
			update : { method : 'PUT' },
			query: {method: 'GET', isArray:true}
		}),
		page: $resource('/api/adminusercounsellinglist/pagination', {}, {
                update: {
                    method: 'PUT' // this method issues a PUT request
                },
                query: {
                    method: 'GET',
                    isArray: false
                }
            }),
		  acceptcounselling: $resource('/api/adminusercounselling/changestatus', {}, {
                update: {
                    method: 'PUT' // this method issues a PUT request
                },
                query: {
                    method: 'GET',
                    isArray: false
                }
            }),
            fetchmentorcounsellingschedule: $resource('/api/adminusercounselling/getmentor', {}, {
                update: {
                    method: 'PUT' // this method issues a PUT request
                },
                query: {
                    method: 'GET',
                    isArray: true
                }
            }),
            rejectcounselling: $resource('/api/adminusercounselling/changestatusreject', {}, {
                update: {
                    method: 'PUT' // this method issues a PUT request
                },
                query: {
                    method: 'GET',
                    isArray: false
                }
            })
    }
});