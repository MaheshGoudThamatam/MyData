'use strict';
angular.module('mean.course').factory('BATCHService', function($resource) {
    return {
        batch: $resource('/api/batch/:batchId', {
            batchId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        }),
        page: $resource('/api/batchlist/pagination', {}, {
            update: {
                method: 'PUT'
            },
            query: {
                method: 'GET',
                isArray: false
            }
        }),
        /*Fetching branches based on course*/
        branchCourses: $resource('/api/branchCourses', {}, {
            update: {
                method: 'PUT'
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
          /*Fetching users/mentors based on course skills*/
           UsersonCourseSkills: $resource('/api/usersSkills', {}, {
            update: {
                method: 'PUT'
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
        all: $resource('/api/batch', {}, {
            query: {method: 'GET', isArray: true}
        })
    };
})