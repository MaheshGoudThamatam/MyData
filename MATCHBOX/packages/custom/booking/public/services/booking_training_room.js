'use strict';

angular.module('mean.booking').factory('BookingTrainingService', 
  function($resource) {
    return {
         createBooking: $resource('/api/booking/training', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
        createBookingBackOffice: $resource('/api/back-office/booking/training', {}, {
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
         loadRoomSchedule:$resource('/api/loadSchedule/training', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
        loadBookings:$resource('/api/training/booking', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
        loadPartnerBooking:$resource('/api/training/loadPartnerBooking/booking', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
        loadTrainingRoomBookingByBackOffice: $resource('/api/training/booking/:trainingRoomId/back-office/:backOfficeId', {trainingRoomId: '@trainingRoomId', backOfficeId: '@backOfficeId'}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
        dateRange:$resource('/api/date-range/from-to', {}, {
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
