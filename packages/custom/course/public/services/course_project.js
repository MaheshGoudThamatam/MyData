'use strict';

angular.module('mean.course').factory('CourseprojectService', function($resource) {
    return {
        courseproject: $resource(
            '/api/courseproject/:courseprojectId', {
                courseprojectId: '@_id'
            }, {
                update: {
                    method: 'PUT'
                },
                query: {
                    method: 'GET',
                    isArray: true
                }
            }),
        page: $resource('/api/courseproject/pagination', {}, {
            update: {
                method: 'PUT'
            },
            query: {
                method: 'GET',
                isArray: false
            }
        }),
        courseProjectCurrriculum: $resource('/api/courseproject', {}, {
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
