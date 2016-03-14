'use strict';
angular.module('mean.course').factory('CourseStudentService', function($resource) {
    return {
        page: $resource('/api/course/student-batch/pagination', { }, {
            update: { method: 'PUT' },
            query: { method: 'GET', isArray: false }
        }),
        
        studentCourse : $resource('/api/course/:courseId/batch/:batchId/student/:studentId', {courseId : '@courseId',
        	batchId: '@batchId', studentId: '@studentId'}, {
            update: { method: 'PUT' },
            query: { method: 'GET', isArray: false }
        }),
        
        studentCourseBatch : $resource('/api/course/:courseId/branch/:branchId', {courseId : '@courseId', branchId: '@branchId'}, {
            update: { method: 'PUT' },
            query: { method: 'GET', isArray: true }
        }),
        
        studentCourseUpdate : $resource('/api/studentCourse/:studentCourseId', { studentId: '@studentId'}, {
            update: { method: 'PUT' },
            query: { method: 'GET', isArray: false}
        }),
    };
})