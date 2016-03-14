'use strict';

angular.module('mean.course').factory('CourseCounsellingChecklistService', function($resource) {
    return {
        courseCounsellingChecklistEdit: $resource(
            '/api/course/:courseId/courseCounsellingChecklist/:courseCounsellingChecklistId', {
            	courseCounsellingChecklistId: '@courseCounsellingChecklistId',
            	courseId:'@courseId'
            }, {
                update: {
                    method: 'PUT'
                },
                query: {
                    method: 'GET',
                    isArray: false
                }
            }),
            
            courseCounsellingChecklist:$resource('/api/course/:courseId/courseCounsellingChecklist', {
            	courseCounsellingChecklistId : '@courseCounsellingChecklistId',
            	courseId:'@courseId'
    		}, {
    			update : {
    				method : 'PUT'
    			},
    			query : {
    				method : 'GET',
    				isArray : false
    			}
    		}),
                    page: $resource('/api/courseCounsellingChecklist/pagination', {}, {
                        update: {
                            method: 'PUT'
                        },
                        query: {
                            method: 'GET',
                            isArray: false
                        }
                    }),

    };
});
