'use strict';

angular.module('mean.role').factory('FeatureRoleService', function ($resource) {
    return {
        role: $resource('/api/featureRole/role/:roleId', {
            roleId: '@_id'}, {
            update: {method: 'PUT'}
        })
    };
});
