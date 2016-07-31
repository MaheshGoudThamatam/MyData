angular.module('mean.calendar-scheduler').constant('EVENT_SCHEDULER', {
    URL_PATH: {
    	EVENT_SCHEDULER: '/admin/event/scheduler',
    	 BOOKEDROOMDETAILS:'/bookedRoom/:bookingId/details',
    },
    
    FILE_PATH: {
    	EVENT_SCHEDULER: 'calendar-scheduler/views/event_scheduler.html',
    	 BOOKEDROOMDETAILS:'calendar-scheduler/views/bookedRoomDetails.html',
    },

    STATE: {
    	EVENT_SCHEDULER: 'calendar scheduler list',
    	BOOKEDROOMDETAILS:'booked room details',
    }
});