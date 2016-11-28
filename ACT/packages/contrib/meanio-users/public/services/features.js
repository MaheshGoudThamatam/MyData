(function() {
    'use strict';
    angular.module('mean.users').factory('FeatureService', FeatureService);
    FeatureService.$inject = ['$http', '$q','$resource'];

    function FeatureService($http, $q, $resource) {
        return {
            features: $resource('/api/feature/:featureId', {
                featureId: '@_id'
            }, {
                update : {
                    method : 'PUT'
                },
                query: { method: 'GET', isArray: true }
            })
        }
    }
})();
