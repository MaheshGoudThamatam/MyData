'use strict';
angular.module('mean.course').factory('MentorCounsellingScheduleListService', function($resource) {
    return {
		page: $resource('/api/MentorCounsellingScheduleList/pagination', {}, {
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