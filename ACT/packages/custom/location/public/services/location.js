/*
 *  <Author: Abha Singh>
 * <Date:28-06-2016>
 * <Services, Services for add, edit, read, delete location>
 */

(function() {
    'use strict';

    angular.module('mean.location').factory('LocationService', LocationService);
    LocationService.$inject = ['$http', '$q', '$resource'];

    function LocationService($http, $q, $resource) {
        return {
            location: $resource('/api/location/:locationId', {
                locationId: '@_id'
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