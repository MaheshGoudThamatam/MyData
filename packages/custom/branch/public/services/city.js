'use strict';

angular.module('mean.branch').factory('CityService', function ($resource) {
    return {
        zoneCity: $resource('/api/zone/:zoneId/city', {zoneId: '@zoneId'}, {

        }),
        city: $resource('/api/city/:cityId', {cityId: '@_id'}, {
            update: {method: 'PUT'},
            query: {method: 'GET', isArray: false}
        }),
        all: $resource('/api/all/city', {}, {
            update: {method: 'PUT'},
            query: {method: 'GET', isArray: true}
        }),
        page: $resource('/api/city/pagination', {}, {
            update: {method: 'PUT'},
            query: {method: 'GET', isArray: false}
        }),
        cityBasedCountry: $resource('/api/:countryId/city', {countryId: '@_id'}, {
            update: {method: 'PUT'},
            query: {method: 'GET', isArray: true}
        }),
    }
});