'use strict';
angular.module('mean.mentor').factory('MentorprojectService', function($resource) {
    return {
        task: $resource('api/mentorproject/:mentorprojectId', {
            mentorprojectId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        }),
        page: $resource('/api/mentor-project/pagination', {}, {
            update: {
                method: 'PUT'
            },
            query: {
                method: 'GET',
                isArray: false
            }
        }),
        projectRequest: $resource('/api/mentor/project/:mentorProjectId', {
            mentorProjectId: '@_id'
        }, {
            update: {
                method: 'PUT'
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
        declineProjectRequest: $resource('/api/mentor-decline/project/:mentorProjectId', {
            mentorProjectId: '@_id'
        }, {
            update: {
                method: 'PUT'
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
        isMentor: $resource('/api/update/user/:userId/isMentor', {
            userId: '@userId'
        }, {
            query: {
                method: 'GET',
                isArray: false
            }
        })
    }
});