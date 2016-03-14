'use strict';

angular.module('mean.branch').factory('ZoneService', function ($resource) {
    return {
        countryZone: $resource('/api/country/:countryId/zone', {countryId: '@countryId'}, {
        }),
        zone: $resource('/api/zone/:zoneId', {zoneId: '@_id'}, {
            update: {method: 'PUT'},
            query: {method: 'GET', isArray: false}
        }),
        page: $resource('/api/zone/pagination', {}, {
            update: {method: 'PUT'},
            query: {method: 'GET', isArray: false}
        })
    }
});