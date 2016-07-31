'use strict';

angular.module('mean.booking').config(['$stateProvider','BOOKING',
  function($stateProvider,BOOKING) {
    $stateProvider
      .state(BOOKING.STATE.BOOKINGS, {
                url: BOOKING.URL_PATH.BOOKINGS,
                templateUrl: BOOKING.FILE_PATH.BOOKINGS,
                
            }).state(BOOKING.STATE.ADMINBOOKINGLIST, {
                url: BOOKING.URL_PATH.ADMINBOOKINGLIST,
                templateUrl: BOOKING.FILE_PATH.ADMINBOOKINGLIST,
            }).state(BOOKING.STATE.PARTNERBOOKINGLIST, {
                url: BOOKING.URL_PATH.PARTNERBOOKINGLIST,
                templateUrl: BOOKING.FILE_PATH.PARTNERBOOKINGLIST,
            }).state(BOOKING.STATE.BOOKING_TRAINING_ROOM, {
                url: BOOKING.URL_PATH.BOOKING_TRAINING_ROOM,
                templateUrl: BOOKING.FILE_PATH.BOOKING_TRAINING_ROOM,
            }).state(BOOKING.STATE.BOOKINGSUCCESS, {
                url: BOOKING.URL_PATH.BOOKINGSUCCESS,
                templateUrl: BOOKING.FILE_PATH.BOOKINGSUCCESS,
            }).state(BOOKING.STATE.BOOKINGFAILED, {
                url: BOOKING.URL_PATH.BOOKINGFAILED,
                templateUrl: BOOKING.FILE_PATH.BOOKINGFAILED,
            }).state(BOOKING.STATE.USER_MYBOOKINGS, {
               url: BOOKING.URL_PATH.USER_MYBOOKINGS,
               templateUrl: BOOKING.FILE_PATH.USER_MYBOOKINGS,
             })
             .state(BOOKING.STATE.BOOKING_HOT_DESK, {
               url: BOOKING.URL_PATH.BOOKING_HOT_DESK,
               templateUrl: BOOKING.FILE_PATH.BOOKING_HOT_DESK,
             })
             .state(BOOKING.STATE.VIEWATTENDEES, {
               url: BOOKING.URL_PATH.VIEWATTENDEES,
               templateUrl: BOOKING.FILE_PATH.VIEWATTENDEES,
             });
    
  }
]);
