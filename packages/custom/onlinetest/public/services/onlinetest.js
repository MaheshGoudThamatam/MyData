'use strict';
/**
 * Online Test Service
 */
angular.module('mean.onlinetest').factory('OnlinetestService', function ($resource) {
    return {
        onlinetest: $resource('/api/onlinetest/:onlinetestId', {
            onlinetestId: '@_id'
        }, {
            update: {
                method: 'PUT'
            },
            query: {method: 'GET', isArray: true}
        }),
        page: $resource('/api/onlinetest/pagination', {}, {
            update: {method: 'PUT'},
            query: {method: 'GET', isArray: false}
        }),

    };
});
 
