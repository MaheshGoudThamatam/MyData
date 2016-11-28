(function() {
    'use strict';
    angular.module('mean.incidents').config(Incidents);
    Incidents.$inject = ['$stateProvider', 'INCIDENT'];

    function Incidents($stateProvider, INCIDENT) {
        $stateProvider.state(INCIDENT.STATE.INCIDENT_CREATE, {
            url: INCIDENT.PATH.INCIDENT_CREATE,
            templateUrl: INCIDENT.FILE_PATH.INCIDENT_CREATE
         
        }).state(INCIDENT.STATE.INCIDENT_LIST, {
            url: INCIDENT.PATH.INCIDENT_LIST,
            templateUrl: INCIDENT.FILE_PATH.INCIDENT_LIST,
            resolve: {
                loggedin: function(MeanUser) {
                    return MeanUser.checkLoggedin();
                }
            }
        });
    }
})();