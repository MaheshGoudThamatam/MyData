'use strict';

angular.module('mean.booking').factory('BookingHotDeskService', 
  function($resource) {
    return {
         createBooking: $resource('/api/booking/hot-desk', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
         createAttendee:$resource('/api/attendee/:attendeeId', {attendeeId: '@_id'}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
         loadRoomSchedule:$resource('/api/loadSchedule/hot-desk', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
        loadBookings:$resource('/api/hot-desk/booking', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
        loadPartnerBooking:$resource('/api/hot-desk/loadPartnerBooking/booking', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
        cancelBookings: $resource('/api/booking/admin/hot-desk/cancel-booking', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
        createBookingBackOffice: $resource('/api/back-office/booking/hot-desk', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
    };
  });
