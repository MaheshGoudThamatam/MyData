'use strict';
angular.module('mean.course').factory('AttendanceService', function($resource) {
    return {
        attendance: $resource('/api/batch/:batchId', {
            batchId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        }),
        batchattendance: $resource('/api/batchattendance/attendance', {}, {
            update: {
                method: 'PUT'
            },
	        query: {
	            method: 'GET',
	            isArray: true
	        }
	    })
       
    }
});