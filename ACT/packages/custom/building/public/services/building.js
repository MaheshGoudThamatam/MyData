(function() {
    'use strict';
    angular.module('mean.building').factory('BuildingService', BuildingService);
    BuildingService.$inject = ['$resource'];

    function BuildingService($resource) {
        return {
            building: $resource('/api/building/:buildingId', {
                buildingId: '@_id'
            }, {
                update: {
                    method: 'PUT'
                },
                query: {
                    method: 'GET',
                    isArray: true
                }
            }),
            locationFilter: $resource('/api/locations/filter', {
               query: {
                    method: 'GET',
                    isArray: true
                } 
            })
        }
    }

})();