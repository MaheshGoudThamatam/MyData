'use strict';

angular.module('mean.profile').factory('ProfileService',
    function ($resource) {
        return {
            profile: $resource('/api/profile', {}, {
                update: {method: 'PUT'},
                query: {method: 'GET', isArray: false}
            })
        };
    });

