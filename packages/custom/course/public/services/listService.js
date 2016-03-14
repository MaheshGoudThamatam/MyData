'use strict';

angular.module('mean.course').factory('ListService', function($resource) {
	return {
		page : $resource('/api/listPaginationStudentCourses/pagination', {}, {
            update: {
                method: 'PUT'
            },
            query: {
                method: 'GET',
                isArray: false
            }
        }) 
	};
});