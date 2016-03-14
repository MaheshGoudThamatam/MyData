'use strict';

angular.module('mean.course').factory('AdminCourseRequestService', function($resource) {
	return {
		courseStudent : $resource('api/studentCourse/:studentCourseId', {
							studentCourseId : '@studentCourseId'
						}, {
							update : {
								method : 'PUT'
							}
		}),
		/*Fetching courses based on users*/
        courseUsers: $resource('/api/loadCoursesonUsers', {}, {
            update: {
                method: 'PUT'
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
		courseRequest: $resource('/api/course/:courseId/courseRequest', {courseId : '@_id' }, {
			update : { method : 'PUT' },
			query: {method: 'GET', isArray:true}
		}),
		
		courseRequestDetail: $resource('/api/loadCourseRequest/courseRequest/:courseRequestId', {courseRequestId : '@_id' }, {
			update : { method : 'PUT' },
			query: {method: 'GET', isArray:true}
		}),
		

		
		confirmCourseRequest : $resource('/api/confirm/adminCourseRequest/:courseRequestId', { courseRequestId : '@_id' }, {
			update : {
				method : 'PUT'
			},
			query : {method : 'GET', isArray : true}
		}),
		courseStudentPayment : $resource('/api/studentPaymentSchedule', {
		}, {
			update : {
				method : 'PUT'
			},
			query: {method: 'GET', isArray:true}
        }),
        page: $resource('/api/listPaginationStudentCourses/pagination', {}, {
                update: {
                    method: 'PUT' // this method issues a PUT request
                },
                query: {
                    method: 'GET',
                    isArray: false
                }
            })
	};
});