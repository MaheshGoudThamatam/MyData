/*
 * <Author:Christopher B Fernandes>
 * <Date:07-06-2016>
 * <service for burglarAlarm add page, burglarAlarm list page, burglarAlarm edit page>
 */
(function() {
    'use strict';
    angular.module('mean.assets').factory('BurglarAlarmService', BurglarAlarmService);
    BurglarAlarmService.$inject = ['$http', '$q', '$resource'];

    function BurglarAlarmService($http, $q, $resource) {
        return {
            burglarAlarm: $resource('/api/building/:buildingId/burglarAlarm/:burglarAlarmId', {
                buildingId: '@_id',
                burglarAlarmId: '@_id'
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
