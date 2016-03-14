'use strict';

angular.module('mean.course').factory(
		'CourseRequestService',
		function($resource) {
			return {

				courserequest : $resource('/api/course/:courseId/courseRequest', {
							courseId : '@courseId'
						}, {
							update : {
								method : 'PUT'
							  },
							  query: {
						            method: 'GET',
						            isArray: false
						        }
							}),
							page: $resource('/api/courseRequestList/pagination', {}, {
						        update: {
						            method: 'PUT'
						        },
						        query: {
						            method: 'GET',
						            isArray: false
						        }
						    }),
						
				user : $resource('/api/user/:userId', {
						userId : '@_id'
					}, {
						update : {
							method : 'PUT'
						},
						query : {
							method : 'GET',
							isArray : true
						}
					}),	
				student : $resource('/api/updateProfile/:userId', {
						userId : '@_id'
					}, {
						update : {
							method : 'PUT'
						},
						query : {
							method : 'GET',
							isArray : true
						}
					}),
			    coursePayment: $resource('/api/course/:courseId/branch/:branchId/paymentRequest',{
			    	courseId : '@_id',
			    	branchId : '@_id'
			    },{
					update : {
						method : 'PUT'
					},
					query : {
						method : 'GET',
						isArray : true
					}
			    
			    }),	
			    /*Fetching course requests based on users*/
        courseRequests: $resource('/api/loadCourseRequestsBasedonUser', {}, {
            update: {
                method: 'PUT'
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
        courseTest:$resource(' /api/:courseId/coursecurriculumtest', {}, {
            update: {
                method: 'PUT'
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
        batch: $resource('/api/batch/branch/:branchId/course/:courseId', {courseId : '@courseId', branchId : '@branchId'}, {
            update: {
                method: 'PUT'
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),

			};
		});