'use strict';

angular.module('mean.skill').factory('SkillService', function ($resource) {
    return {
        skill: $resource('api/skill/:skillId', { skillId: '@_id' }, {
            update: {method: 'PUT'},
            query: {method: 'GET', isArray: true}
        }),
        page: $resource('/api/skill/pagination', {}, {
            update: {method: 'PUT'},
            query: {method: 'GET', isArray: false}
        }),
        onlineTest: $resource('/api/skill/:skillId/onlinetest', { skillId: '@_id' }, {
            update: {
                method: 'PUT'
            },
            query: {method: 'GET', isArray: true}
        })
    };
});
