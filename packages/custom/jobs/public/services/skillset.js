'use strict';
angular.module('mean.jobs').factory('SkillSetService', ['$resource',
    function($resource) {
        return {
            page: $resource('/api/skillsetdetails/pagination', {}, {
                update: {
                    method: 'PUT' // this method issues a PUT request
                },
                query: {
                    method: 'GET',
                    isArray: false
                }
            }),
            skillsetdetails: $resource('/api/skillset/:skillsetId', {skillsetId: '@_id'}, {
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