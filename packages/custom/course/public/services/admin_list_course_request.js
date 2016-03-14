'use strict';
angular.module('mean.course').factory('AdminListCourseRequestService', function($resource) {
    return {
    	 page: $resource('/api/adminListCourseRequest/pagination', { }, {
             update: { method: 'PUT' },
             query: { method: 'GET', isArray: false }
         }),
    
   };
})