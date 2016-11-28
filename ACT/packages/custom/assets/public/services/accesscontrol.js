/*
 * <Author:Akash Gupta>
 * <Date:07-06-2016>
 * <service for camera add page, camera list page, camera edit page>
 */
(function() {
    'use strict';
    angular.module('mean.assets').factory('AccessControlService', AccessControlService);
    AccessControlService.$inject = ['$http', '$q', '$resource'];

    function AccessControlService($http, $q, $resource) {
        return {
            accessControl: $resource('/api/building/:buildingId/access/:accessId', {
                buildingId:'@_id',
                accessId: '@_id'
            }, {
                update : {
                    method : 'PUT'
                },
                query:{
                    method:'GET' , isArray: true
                }

            })
        };
    }


})();