'use strict';

angular.module('mean.booking').factory('BookingService', 
  function($resource) {
    return {
         createBooking: $resource('/api/:scheduleId/booking', {scheduleId: '@scheduleId'}, {
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
         loadRoomSchedule:$resource('/api/loadSchedule', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
        loadBookings:$resource('/api/booking/:bookingId', {  bookingId : '@_id' }, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
        loadPartnerBooking:$resource('/api/booking/loadPartnerBooking', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
        loadUserBookings:$resource('/api/booking/loadUserBooking', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
        loadBookingSchedule:$resource('/api/booking/loadBookedSchedule', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
        loadRequredRoomType:$resource('/api/booking/loadRequiredRoomType', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
        loadUserBasedOnEmail:$resource('/api/booking/loadRequiredUser', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
        createBackofficeBooking:$resource('/api/:scheduleId/booking/backoffice', {scheduleId: '@scheduleId'}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
        bookedRoom : $resource('/api/booking/:bookingId', {  bookingId : '@_id' }, {
			update : { method : 'PUT' },
			query : { method : 'GET', isArray : true }
		}),
		loadAttendees:$resource('/api/attendee/getByBooking', {}, {
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
