'use strict';

angular.module('mean.role').factory('AdminRoleService', function ($resource) {
    return {
        page: $resource('/api/admin/user/role/pagination', {}, {
            update: {method: 'PUT'},
            query: {method: 'GET', isArray: false}
        }),
    }
});
