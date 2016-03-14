'use strict';

angular.module('mean.role').factory('FeatureCategoryService', function ($resource) {
    return{
        featureCategory: $resource('/api/featureCategory/:featureCategoryId', {
            featureCategoryId: '@_id'
        }, {update: {method: 'PUT'}
        }),
        page: $resource('/api/featureCategory/pagination', {}, {
            update: {method: 'PUT'},
            query: {method: 'GET', isArray: false}
        })
    };
});
