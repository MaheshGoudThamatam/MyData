/*
 * <Author: Abha Singh>
 * <Date:8-07-2016>
 * <Services, Services for add, edit, read, delete >
 */

(function() {
    'use strict';

    angular.module('mean.assets').factory('GuardService', GuardService);
    GuardService.$inject = ['$http', '$q', '$resource'];

    function GuardService($http, $q, $resource) {
        return {
            guarding: $resource('/api/building/:buildingId/guarding/:guardingId', {
            	buildingId: '@_id',
                guardingId: '@_id'
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