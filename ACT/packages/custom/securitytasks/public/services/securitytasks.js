/*
 * <Author:Akash Gupta>
 * <Date:25-07-2016>
 * <Services, Services for add, edit, read>
 */

(function() {
    'use strict';
    angular.module('mean.securitytasks').factory('SecurityTasksService', SecurityTasksService);
    SecurityTasksService.$inject = ['$http', '$q', '$resource'];

    function SecurityTasksService($http, $q, $resource) {
        return {
            //crud on security task
            securityTask: $resource('/api/securityTask/:securityTaskId', {
                securityTaskId: '@_id'
            }, {
                update: {
                    method: 'PUT'
                },
                query: {
                    method: 'GET',
                    isArray: true
                }
            }),
            //list of subtask
            subTask: $resource('/api/securitysubtasks/:securitytaskId', {
                securitytaskId: '@_id'
            }, {
                query: {
                    method: 'GET',
                    isArray: true
                }
            }),
            //create, delete & get all hours(value of all hours)
            logHours: $resource('/api/loghour/:loghourId', {
                loghourId: '@_id'
            }),
            //list all log hours & costs based on security task
            listLogHours: $resource('/api/securitytask/:securitytaskId/loghour', {
                securitytaskId: '@_id'
            }, {
                query: {
                    method:'GET' , isArray: false
                }
            }),
            //create, delete & get all costs(value of all costs)
            logCosts: $resource('/api/cost/:costId', {
                costId: '@_id'
            }),
            // CRUD on subTask
            subTaskCreate: $resource('/api/subtasks/:subtaskId', {
                subtaskId: '@_id'
            }, {
                update: {
                    method: 'PUT'
                }
            }),
            //crud on external security task
            externalSecurityTask: $resource('/api/externalSecurityTask/:companyId/:externalsecuritytaskId', {
                externalsecuritytaskId: '@_id'
            }, {
            	update: {
                    method: 'PUT'
                },
                query: {
                    method:'GET' , isArray: true
                }
            }),
            externalSecurityTaskCreate: $resource('/api/externalSecurityTask/:companyId', {
            	companyId: '@company_id'
            }, {
            	update: {
                    method: 'PUT'
                },
                query: {
                    method:'GET' , isArray: true
                }
            }),
            approvalExternalTask: $resource('/api/externalSecurityTaskApproval/:companyId/approval', {
            	companyId: '@companyId'
            }, {
            	update: {
                    method: 'PUT'
                },
                query: {
                    method:'GET' , isArray: true
                }
            }),
            externalTaskApprove: $resource('/api/externalSecurityTaskApproved/:companyId', {
            	companyId: '@companyId'
            }, {
            	update: {
                    method: 'PUT'
                },
                query: {
                    method:'GET' , isArray: true
                }
            }),
            allUser: $resource('/api/companyUser/building/:buildingId', {
                buildingId:'@_id'
            }, {
                query: {
                    method:'GET' , isArray: true
                }
            }),
            riskBasedonBuilding: $resource('/api/buildings/:buildingId/risk', {
                buildingId: '@_id'
            },{
                query: {
                    method:'GET' , isArray: true
                }
            }),
            allExternalTask: $resource('/api/allExternalSecurityTask', {}, {
                query: {
                    method:'GET' , isArray: true
                }
            }),
            budget: $resource('/api/securityTasks/budget', {}, {
                query: {
                    method:'GET' , isArray: false
                }
            }),
            allexternaltasks:$resource('/api/allexternaltasks', {}, {
                query: {
                    method:'GET' , isArray: true
                }
            }),allexternaltasks:$resource('/api/allexternaltasks', {}, {
                query: {
                    method:'GET' , isArray: true
                }
            }),
            allSecuritytasks:$resource('/api/allSecurityTask', {}, {
                query: {
                    method:'GET' , isArray: true
                }
            })
            
        };
    }
})();
