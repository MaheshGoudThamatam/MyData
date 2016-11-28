(function() {
    'use strict';
    angular.module('mean.users').factory('RoleService', RoleService);
    RoleService.$inject = ['$http', '$q', '$resource'];

    function RoleService($http, $q, $resource) {
        return {
            roles: $resource('/api/role/:roleId', {
                roleId: '@_id'
            }, {
                update: {
                    method: 'PUT'
                },
                query: {
                    method: 'GET',
                    isArray: false
                }
            }),
            roleSelect: $resource('/api/roleSelect', {}, {
                query: {
                    method: 'GET',
                    isArray: true
                }
            })
        }
    }
})();