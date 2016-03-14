'use strict';
angular.module('mean.course').factory('AdminCounsellingScheduleListService', function($resource) {
    return {
		page: $resource('/api/AdminCounsellingScheduleList/pagination', {}, {
                update: {
                    method: 'PUT' // this method issues a PUT request
                },
                query: {
                    method: 'GET',
                    isArray: false
                }
            }),
            scheduledelete: $resource('/api/AdminCounsellingDeletingSchedule', {}, {
                update: {
                    method: 'PUT' // this method issues a PUT request
                },
                query: {
                    method: 'GET',
                    isArray: true
                }
            }),
            fetchAvailableMentor: $resource('/api/AdminCounsellingEditSchedule/fetchAvailableMentor', {}, {
                update: {
                    method: 'PUT' // this method issues a PUT request
                },
                query: {
                    method: 'GET',
                    isArray: true
                }
            }),
            updatescheduledetail: $resource('/api/AdminCounsellingUpdateSchedule/updatecounselling', {}, {
                update: {
                    method: 'PUT' // this method issues a PUT request
                },
                query: {
                    method: 'GET',
                    isArray: true
                }
            })
    }
});