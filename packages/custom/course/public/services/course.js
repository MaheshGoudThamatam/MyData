'use strict';

angular.module('mean.course').factory('CourseService', ['$resource', function($resource) {
	return{
		course: $resource('/api/course/:courseId', {
			courseId : '@_id'
		}, {
			update : {
				method : 'PUT'
			}
		}),
		page: $resource('/api/courseList/pagination', {}, {
	        update: {
	            method: 'PUT'
	        },
	        query: {
	            method: 'GET',
	            isArray: false
	        }
	    })
	}
}])
.factory('UserCourseService', function($resource) {
	return $resource('/api/usercourse/:usercourseId', {
		usercourseId : '@_id'
	}, {
		update : {
			method : 'PUT'
		}
	});
})
.factory('CourseModeService', function($resource) {
	return $resource('/api/courseMode/:courseModeId', {
		usercourseId : '@_id'
	}, {
		update : {
			method : 'PUT'
		}
	});
})
.factory('CourseInstallmentService', function($resource) {
		return $resource('/api/courseInstallment/:courseIntallmentId', {
			courseinstallmentId : '@_id'
		}, {
			update : {
				method : 'PUT'
			}
		});
})

.factory('UserCounsellingService', function($resource) {
		return $resource('/api/userCounselling/:userCounsellingId', {
			userCounsellingId : '@_id'
		}, {
			update : {
				method : 'PUT'
			}
		});
})
.factory('InstallmentService', function($resource) {
		return $resource('/api/course/:courseId/installment/:courseIntallmentId', {
			courseinstallmentId : '@_id'
		}, {
			update : {
				method : 'PUT'
			}
		});
});




