(function() {
    'use strict';

    angular.module('mean.audit').factory('AuditCategoryService', AuditCategoryService);
    AuditCategoryService.$inject = ['$http', '$resource'];

    function AuditCategoryService($http, $resource) {
        return {
            auditCategory: $resource('/api/auditCategory/:auditCategoryId', {
                auditCategoryId: '@_id'
            }, {
                update: {
                    method: 'PUT'
                },
                query: {
                    method: 'GET',
                    isArray: false
                }
            }),

            fetchAuditQuestions: $resource('/api/fetchAuditQuestions/:auditCategoryId', {
                auditCategoryId: '@_id'
            }, {
                query: {
                    method: 'GET',
                    isArray: true
                }
            })

        };
    }
})();