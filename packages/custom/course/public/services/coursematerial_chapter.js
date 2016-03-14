'use strict';

angular.module('mean.course').factory('ChapterService', function($resource) {
    return {
        materialEdit: $resource('/api/materials/:materialId', {
            materialId: '@_id'
        }, {
            update: {method: 'PUT'},
            query: {method: 'GET', isArray: false}
        }),
        material: $resource('/api/materials', {
        }, {
            update: {method: 'PUT'},
            query: {method: 'GET', isArray: true}
        }),
        subTopic: $resource('/api/material/Subtopic', {
        }, {
            query: {method: 'GET', isArray: true}
        }),
        subTopicDetails: $resource('/api/material/Subtopic/:subTopicId', {
            subTopicId: '@_id'
        }, {
            update: {method: 'PUT'},
            query: {method: 'GET', isArray: false}
        }),
        materialList: $resource('/api/material/list', {
        }, {
            query: {method: 'GET', isArray: true}
        }),
        materialTitle: $resource('/api/material/:materialTitleId', {
            materialTitleId: '@_id'
        }, {
            query: {method: 'GET', isArray: false},
            update: {method: 'PUT'}
        })
    }
});
