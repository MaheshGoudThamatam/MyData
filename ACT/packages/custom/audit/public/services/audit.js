/* <Author: Abha Singh>
 * <Date:12-07-2016>
 * <Services, Services for add>
 */
(function() {
    'use strict';

    angular.module('mean.audit').factory('AuditService', AuditService);
    AuditService.$inject = ['$http', '$q','$resource'];

    function AuditService($http, $q, $resource) {
        return {
            audit: $resource('/api/audit/:auditId', {
                auditId: '@_id'
            }, {
                update: {
                    method: 'PUT'
                },
                query: {
                    method: 'GET',
                    isArray: false
                }
            }),
            
            fetchUsers: $resource('/api/fetchUsers', {}, {
                query: {
                    method: 'GET',
                    isArray: true
                }
            }),
            performAuditQuestions:$resource('/api/audit/:auditId/perform', {}, {
            	auditId: '@_id'
            }, {
                update: {
                    method: 'PUT'
                },
                query: {
                    method: 'GET',
                    isArray: true
                }
            }),
            userlocation: $resource('/api/userlocations', {}, {
                query: {
                    method: 'GET',
                    isArray: true
                }
            }),
            totalAuditQuestions:$resource('/api/audit/:auditId/perform', {}, {
            	auditId: '@_id'
            }, {
                update: {
                    method: 'PUT'
                },
            }),
            
            userbuilding: $resource('/api/userbuildings', {}, {
                query: {
                    method: 'GET',
                    isArray: true
                }
            }),
            task: $resource('/api/createtask', {}, {
                query: {
                    method: 'GET',
                    isArray: true
                }
            }),
            fetchSecurityManager: $resource('/api/fetchsecuritymanager', {}, {
                query: {
                    method: 'GET',
                    isArray: true
                }
            }),
            performedAudits:$resource('/api/auditsperformed/:performId', {}, {
            	performId: '@_id'
            }, {
                update: {
                    method: 'PUT'
                },
                query: {
                    method: 'GET',
                    isArray: false
                }
            }),
            performedaudits: $resource('/api/performedAudits', {}, {
                query: {
                    method: 'GET',
                    isArray: true
                }
            }),
       
        };
    }

})();
