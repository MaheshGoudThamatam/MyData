'use strict';
angular.module('mean.users').factory('UserService', function ($resource) {
    return {
        users: $resource('/api/user/:userId', {userId: '@_id'}, {
            update: { method: 'PUT'},
            query: {method: 'GET', isArray: true}
        }),
        page: $resource('/api/user/pagination', {}, {
            update: {method: 'PUT'},
            query: {method: 'GET', isArray: false}
        })
    };
});