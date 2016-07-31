'use strict';

angular.module('mean.role').factory('FeatureService', function ($resource) {
    return {
        feature: $resource('api/feature/:featureId', {
            featureId: '@_id'}, {
            update: {method: 'PUT'}
        }),
        page: $resource('/api/feature/pagination', {}, {
            update: {method: 'PUT'},
            query: {method: 'GET', isArray: false}
        })
    }
});
