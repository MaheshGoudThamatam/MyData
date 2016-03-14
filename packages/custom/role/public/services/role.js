'use strict';

angular.module('mean.role').factory('RoleService', function ($resource) {
    return {
        role: $resource('/api/role/:roleId', {
            roleId: '@_id'}, {
            update: {method: 'PUT'}
        }),
        page: $resource('/api/role/pagination', {}, {
            update: {method: 'PUT'},
            query: {method: 'GET', isArray: false}
        })
    }
})