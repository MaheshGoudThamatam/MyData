/*
 * <Author:Akash Gupta>
 * <Date:30-06-2016>
 * <constants: for company list,edit, add page>
 */

angular.module('mean.incidents').constant('INCIDENT', {
    PATH: {
        INCIDENT_CREATE: '/report-incident/:tokenId',
    	INCIDENT_LIST: '/incidents',
    	
    },
    FILE_PATH: {
        INCIDENT_CREATE: 'incidents/views/incident-create.html',
    	INCIDENT_LIST: 'incidents/views/incident_list.html',
    	
    },
    STATE: {
        INCIDENT_CREATE: 'Incidents_create incident',
    	INCIDENT_LIST: 'Incidents_list incident',
    	
    }
});