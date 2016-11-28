/*
 * <Author:Abha Singh>
 * <Date: 28-06-2016>
 * <routes for location add page, list page, edit page>
 */

(function() {
    'use strict';
    angular.module('mean.location').config(Location);
    Location.$inject = ['$stateProvider', 'LOCATION'];

    function Location($stateProvider, LOCATION) {
        $stateProvider
            .state(LOCATION.STATE.LOCATIONCREATE, {
                url: LOCATION.URL_PATH.LOCATIONCREATE,
                templateUrl: LOCATION.FILE_PATH.LOCATIONCREATE,
            })
            .state(LOCATION.STATE.LOCATIONEDIT, {
                url: LOCATION.URL_PATH.LOCATIONEDIT,
                templateUrl: LOCATION.FILE_PATH.LOCATIONEDIT,
            })
            .state(LOCATION.STATE.LOCATIONLIST, {
                url: LOCATION.URL_PATH.LOCATIONLIST,
                templateUrl: LOCATION.FILE_PATH.LOCATIONLIST,
            });
    }

})();