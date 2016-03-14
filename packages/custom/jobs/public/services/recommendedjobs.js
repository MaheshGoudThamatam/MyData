'use strict';
angular.module('mean.jobs').factory('RecommendedJobs', ['$resource',
    function($resource) {
        return {
            page: $resource('/api/recommendedjobs/pagination', {}, {
                update: {
                    method: 'PUT' // this method issues a PUT request
                },
                query: {
                    method: 'GET',
                    isArray: false
                }
            }),
            skilldetails: $resource('/api/recommendedjobs/checked', {}, {
                update: {
                    method: 'PUT' // this method issues a PUT request
                },
                query: {
                    method: 'GET',
                    isArray: true
                }
            })
        };
    }
]);