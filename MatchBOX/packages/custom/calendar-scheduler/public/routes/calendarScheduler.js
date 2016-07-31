'use strict';

angular.module('mean.calendar-scheduler').config(['$stateProvider', 'EVENT_SCHEDULER',
    function($stateProvider, EVENT_SCHEDULER) {
	
	    $stateProvider.state(EVENT_SCHEDULER.STATE.EVENT_SCHEDULER, {
			url : EVENT_SCHEDULER.URL_PATH.EVENT_SCHEDULER,
			templateUrl : EVENT_SCHEDULER.FILE_PATH.EVENT_SCHEDULER
		}).state(EVENT_SCHEDULER.STATE.BOOKEDROOMDETAILS, {
            url: EVENT_SCHEDULER.URL_PATH.BOOKEDROOMDETAILS,
            templateUrl: EVENT_SCHEDULER.FILE_PATH.BOOKEDROOMDETAILS,
   });
 
	    
    }
]);
