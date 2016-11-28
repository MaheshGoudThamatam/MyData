(function() {
    'use strict';
    angular.module('mean.building').config(Building);
    Building.$inject = ['$stateProvider', 'SITE'];

    function Building($stateProvider, SITE) {
        $stateProvider.state(SITE.STATE.BUILDING_ADD, {
            url: SITE.PATH.BUILDING_ADD,
            templateUrl: SITE.FILE_PATH.BUILDING_ADD,
            resolve: {
                loggedin: function(MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(SITE.STATE.BUILDING_LIST, {
            url: SITE.PATH.BUILDING_LIST,
            templateUrl: SITE.FILE_PATH.BUILDING_LIST,
            resolve: {
                loggedin: function(MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        }).state(SITE.STATE.BUILDING_EDIT, {
            url: SITE.PATH.BUILDING_EDIT,
            templateUrl: SITE.FILE_PATH.BUILDING_EDIT,
            resolve: {
                loggedin: function(MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        });

    }
})();