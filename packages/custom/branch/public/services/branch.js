'use strict';

angular.module('mean.branch').factory('BranchService', function ($resource) {
    return {
        cityBranch: $resource('/api/city/:cityId/branch', {cityId: '@cityId'}, {

        }),
        branch: $resource('/api/branch/:branchId', {branchId: '@_id'}, {
            update: {method: 'PUT'},
            query: {method: 'GET', isArray: false}
        }),
        all: $resource('/api/all/branch', {}, {
            update: {method: 'PUT'},
            query: {method: 'GET', isArray: true}
        }),
        page: $resource('/api/branch/pagination', {}, {
            update: {method: 'PUT'},
            query: {method: 'GET', isArray: false}
        })
    }
});
