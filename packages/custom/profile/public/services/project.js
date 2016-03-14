'use strict';

angular.module('mean.profile').factory('ProjectService', function ($resource) {
    return $resource('/api/project/:projectId', {
        projectId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
});
