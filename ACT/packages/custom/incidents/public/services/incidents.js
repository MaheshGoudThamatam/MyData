(function() {
    'use strict';
    angular.module('mean.incidents').factory('IncidentsService', IncidentsService);
    IncidentsService.$inject = ['$http', '$q', '$resource'];

    function IncidentsService($http, $q, $resource) {
        return {
            incidents: $resource('/api/incident/:companyId', {
                companyId: '@companyId'
            }, {
                update: {
                    method: 'PUT'
                },
                query: {
                    method: 'GET',
                    isArray: true
                }
            })
        };
    }
})();