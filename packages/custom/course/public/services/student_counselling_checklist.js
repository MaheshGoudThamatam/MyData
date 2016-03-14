'use strict';

angular.module('mean.course').factory('StudentCounsellingChecklistService', function($resource) {
    return {
    	studentCounsellingChecklist: $resource(
            '/api/studentCounsellingChecklist/:studentCounsellingChecklistId', {
            	studentCounsellingChecklistId: '@studentCounsellingChecklistId',
            }, {
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
