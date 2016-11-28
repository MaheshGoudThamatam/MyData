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
        dashboardBookings:$resource('/api/dashboardBookings', {}, {
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
        submitReview : $resource('/api/space/review/:bookingId', { bookingId : '@bookingId' }, {
             update: {
                method: 'PUT'
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
        loadroomtypes:$resource('/api/loadRoomType', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
        cancelBookings:$resource('/api/booking/admin/cancel-booking', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
        loadParticularrole:$resource('/api/role/user/list', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
        BookedSchedule:$resource('/api/booking/bookedRoom', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
        ValidateCoupon:$resource('/api/validate/promoCode/:promoCodeId', { promoCodeId: '@promoCodeId' }, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
        loadReasonsForCancelBooking:$resource('/api/cancelBooking/loadreasonforcancel', {}, {
        	update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
        loadBookingRetryPayment:$resource('/api/retryPayment', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
        cancelRetry:$resource('/api/cancelRetry', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
        loadReasonsAdminCancelBooking:$resource('/api/cancelBooking/loadReasonAdminCancel', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        }),
        successPayUMoneyURL: $resource('/api/payment/payumoney/success', {}, {
            update: {
                method: 'PUT' // this method issues a PUT request
            },
            query: {
                method: 'GET',
                isArray: true
            }
        })
    };
  });
