/*
 * <Author:Akash Gupta>
 * <Date:07-06-2016>
 * <service for camera add page, camera list page, camera edit page>
 */
(function() {
    'use strict';
    angular.module('mean.assets').factory('CameraService', CameraService);
    CameraService.$inject = ['$http', '$q', '$resource'];

    function CameraService($http, $q, $resource) {
        return {
            camera: $resource('/api/building/:buildingId/camera/:cameraId', {
                buildingId: '@_id',
                cameraId: '@_id'
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
