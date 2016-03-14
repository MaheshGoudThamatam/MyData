'use strict';

angular.module('mean.skill').factory('BadgeService', function ($resource) {
    return {
        badge: $resource('api/badge/:badgeId', {
            badgeId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        }),
        page: $resource('/api/badge/pagination', {

        }, {
            query: {
                method: 'GET',
                isArray: false
            }
        })
    };
});
