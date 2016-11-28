(function() {
    'use strict';
    angular.module('mean.documents').factory('Documents', Documents);
    Documents.$inject = ['$http', '$q', '$resource'];

    function Documents($http, $q, $resource) {
        return {
            docCategory: $resource('/api/documentCategory/:documentCategoryId', {
                documentCategoryId: '@_id'
            }, {
                update: {
                    method: 'PUT'
                },
                query: {
                    method: 'GET',
                    isArray: true
                }
            }),
            document: $resource('/api/document/:documentId', {
                documentId: '@_id'
            }, {
                update: {
                    method: 'PUT'
                },
                query: {
                    method: 'GET',
                    isArray: true
                }
            }),
            documentBasedOnCategory: $resource('/api/documents/:documentCategoryId', {
            	documentCategoryId: '@_id'
            }, {
                query: {
                    method: 'GET',
                    isArray: true
                }
            })
            
        };
    }


})();
