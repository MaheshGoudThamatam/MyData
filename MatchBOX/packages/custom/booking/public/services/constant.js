
angular.module('mean.booking').constant('BOOKING', {
    URL_PATH: {
        BOOKINGS:'/room/:roomId/bookings',
        ADMINBOOKINGLIST:'/admin/bookings',
        PARTNERBOOKINGLIST:'/partner/bookings',
        BOOKINGSUCCESS:'/booking/success',
        BOOKINGFAILED:'/booking/failed',
        BOOKING_TRAINING_ROOM: '/training/room/:roomId/bookings',
        USER_MYBOOKINGS: '/bookings/mybookings',
        BOOKING_HOT_DESK: '/hot-desk/room/:roomId/bookings',
        VIEWATTENDEES: '/booking/mybookings/:bookingId'
    },
    
    FILE_PATH: {
    	BOOKINGS:'booking/views/booking.html',
    	 ADMINBOOKINGLIST:'booking/views/admin_booking_list.html',
         PARTNERBOOKINGLIST:'booking/views/partner_booking_list.html',
         BOOKINGSUCCESS:'booking/views/booking_success.html',
         BOOKINGFAILED:'booking/views/booking_fail.html',
         BOOKING_TRAINING_ROOM: 'booking/views/booking_training_room.html',
         USER_MYBOOKINGS: 'booking/views/user_mybookings.html',
         BOOKING_HOT_DESK: 'booking/views/booking_hot_desk.html',
         VIEWATTENDEES: 'booking/views/viewAttendees.html',
    },

    STATE: {
        BOOKINGS:'booking list',
        ADMINBOOKINGLIST:'Admin booking list',
        PARTNERBOOKINGLIST:'Partner booking list',
        BOOKINGSUCCESS:'booking success',
        BOOKINGFAILED:'booking failed',
        BOOKING_TRAINING_ROOM:'Booking Training Room',
        USER_MYBOOKINGS: 'user mybookings',
        BOOKING_HOT_DESK: 'Booking Hot Desk',
        VIEWATTENDEES: 'view attendee',
    }
});