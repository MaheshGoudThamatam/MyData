'use strict';
angular.module('mean.jobsites').factory('JobsiteService', function ($resource) {
    return $resource('/api/admin/jobsites/:jobSitesId', {
        jobSitesId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
})
