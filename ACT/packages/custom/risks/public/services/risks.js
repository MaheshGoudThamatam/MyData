(function() {
    'use strict';

    angular.module('mean.risks').factory('RiskService', RiskService);
    RiskService.$inject = ['$http', '$q', '$resource'];

    function RiskService($http, $q, $resource) {
        return {
            risk: $resource('/api/risk/:riskId', {
                riskId: '@_id'
            }, {
                update: {
                    method: 'PUT'
                },
                query: { method: 'GET', isArray: true }
            }),

            fetchLocations: $resource('/api/risks/loadLocations', {}, {
                update: { method: 'PUT' },
                query: { method: 'GET', isArray: true }
            }),

            fetchBuildings: $resource('/api/risks/:locationId/loadBuildings', {
                locationId: '@locationId'
            }, {
                query: { method: 'GET', isArray: true }
            }),

            fetchUser: $resource('/api/risks/users', {}, {
                query: { method: 'GET', isArray: true }
            }),

            fetchLocationsBasedOnUserSelected: $resource('/api/risks/fetchLocationsBasedOnUserSelected', {}, 
             {
                update: {
                    method: 'PUT'
                },
                query: { method: 'GET', isArray: true }
            }),

            fetchUserBasedOnBuildingSelected: $resource('/api/risks/fetchUserBasedOnBuildingSelected', {}, {
                update: {
                    method: 'PUT'
                },
                query: { method: 'GET', isArray: true }
            }),
        };
    }
})();
