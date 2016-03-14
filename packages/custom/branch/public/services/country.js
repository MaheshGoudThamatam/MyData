'use strict';

angular.module('mean.branch').factory('CountryService', function ($resource) {
    return {
        country: $resource('/api/country/:countryId', {countryId: '@_id'}, {
            update: {method: 'PUT'},
            query: {method: 'GET', isArray: true}
        }),
        location: $resource('/api/location', {}, {
            update: {method: 'PUT'},
            query: {method: 'GET', isArray: true}
        }),
        page: $resource('/api/country/pagination', {}, {
            update: {method: 'PUT'},
            query: {method: 'GET', isArray: false}
        })
    }
});