'use strict';

angular.module('mean.profile').factory('EducationalDetailService', function ($resource) {
    return $resource('/api/educationaldetails/:educationaldetailId', {
        educationaldetailId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
});