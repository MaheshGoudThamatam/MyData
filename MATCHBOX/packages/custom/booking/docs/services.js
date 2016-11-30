'use strict';

exports.load = function(swagger, parms) {

  var searchParms = parms.searchableOptions;

  var loadRequiredUserMobile = {
    'spec': {
      description: 'Booking operations',
      path: '/booking/loadUserBookingMobile',
      method: 'GET',
      summary: 'Get all User Bookings for Mobile',
      notes: '',
      type: 'Booking',
      nickname: 'getAll',
      produces: ['application/json'],
      params: searchParms
    }
  };
  
  var bookedSchedule = {
    'spec': {
      description: 'Booking operations',
      path: '/booking/bookedRoom',
      method: 'GET',
      summary: 'Load bookings based on id',
      notes: '',
      type: 'Booking',
      nickname: 'bookedSchedule',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
          name: 'id',
          in: 'query',
          description: 'Search object that contains parameter in order to query and fetch the booking.',
          required: true,
          type: 'integer',
          paramType: 'query',
          allowMultiple: false
        }]
    }
  };
  
  var loadRequiredRoomType = {
    'spec': {
      description: 'Booking operations',
      path: '/booking/loadRequiredRoomType',
      method: 'GET',
      summary: 'Load Room type',
      notes: '',
      type: 'integer',
      nickname: 'loadRequiredRoomType',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
          name: 'RoomType',
          in: 'query',
          description: 'Search object that contains parameter in order to query and fetch.',
          paramType: 'query',
          /*allowMultiple: true*/
          required: true,
          type: 'integer',
          format: 'int32'
        }, {
          name: 'logUserPartner',
          in: 'query',
          description: 'Search object that contains parameter in order to query and fetch.',
          paramType: 'query',
          required: true,
          type: 'integer',
          format: 'int32'
      }]
    }
  };
  
  var loadRequiredUser = {
    'spec': {
      description: 'Booking operations',
      path: '/booking/loadRequiredUser',
      method: 'GET',
      summary: 'Load user based on email',
      notes: '',
      type: 'Booking',
      nickname: 'loadRequiredUser',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
          name: 'userId',
          in: 'query',
          description: 'Email to be passed as query parameter so as to fetch user.',
          required: true,
          type: 'integer',
          paramType: 'query',
          allowMultiple: false
        }]
    }
  };
  
  var loadClosedSchedule = {
    'spec': {
      description: 'Booking operations',
      path: '/schedule/isclosed',
      method: 'GET',
      summary: 'Load closed schedules',
      notes: '',
      type: 'Schedule',
      nickname: 'loadClosedSchedule',
      produces: ['application/json'],
      params: searchParms
    }
  };
  
  var loadBookedSchedules = {
    'spec': {
      description: 'Booking operations',
      path: '/booking/loadBookedSchedule',
      method: 'GET',
      summary: 'Load booked room which are confirmed based on room id',
      notes: '',
      type: 'Booking',
      nickname: 'loadBookedSchedules',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
          name: 'bookedRoom',
          in: 'query',
          description: 'Room id to be passed as query parameter so as to fetch Booking.',
          required: true,
          type: 'integer',
          paramType: 'query',
          allowMultiple: false
      }]
    }
  };
  
  var loadPartnerBookings = {
    'spec': {
      description: 'Booking operations',
      path: '/booking/loadPartnerBooking',
      method: 'GET',
      summary: 'Load booked room which are confirmed based on room id',
      notes: '',
      type: 'Booking',
      nickname: 'loadBookedSchedules',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
          name: 'roleRequired',
          in: 'query',
          description: 'Role as string (BackOffice or FrontOffice or Admin etc) to be passed as query parameter so as to fetch Booking.',
          required: true,
          type: 'string',
          paramType: 'query'
      } , {
          name: 'partner',
          in: 'query',
          description: 'Partner id to be passed as query parameter so as to fetch Booking.',
          paramType: 'query',
          required: true,
          type: 'integer',
          format: 'int32'
      }]
    }
  };
  
  var loadUserBookings = {
    'spec': {
      description: 'Booking operations',
      path: '/booking/loadUserBooking',
      method: 'GET',
      summary: 'Load user bookings',
      notes: '',
      type: 'Booking',
      nickname: 'loadUserBookings',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
          name: 'user',
          in: 'query',
          description: 'User id to be passed as query parameter so as to fetch Booking.',
          required: true,
          type: 'string',
          paramType: 'query'
      }]
    }
  };
  
  var all = {
    'spec': {
      description: 'Booking operations',
      path: '/booking',
      method: 'GET',
      summary: 'Load all bookings',
      notes: '',
      type: 'Booking',
      nickname: 'all',
      produces: ['application/json'],
      params: searchParms
    }
  };
  
  var dashboardBookings = {
    'spec': {
      description: 'Booking operations',
      path: '/dashboardBookings',
      method: 'GET',
      summary: 'Load Booking for Dashboard',
      notes: '',
      type: 'Booking',
      nickname: 'dashboardBookings',
      produces: ['application/json'],
      params: searchParms
    }
  };
  
  var loadSchedule = {
	'spec': {
      description: 'Booking operations',
      path: '/loadSchedule',
      method: 'GET',
      summary: 'Load all bookings',
      notes: '',
      type: 'Booking',
      nickname: 'loadSchedule',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
          name: 'roomId',
          in: 'query',
          description: 'Room id to be passed as query parameter so as to fetch Booking.',
          required: true,
          type: 'integer',
          format: 'int32',
          paramType: 'query'
      } , {
          name: 'selectdate',
          in: 'query',
          description: 'Selected date to be passed as query parameter so as to fetch Booking.',
          paramType: 'query',
          required: true,
          type: 'string'
      }]
    }
  };
  
  var create = {
    'spec': {
      description: 'Booking operations',
      path: '/api/{scheduleId}/booking',
      method: 'POST',
      summary: 'Create Booking',
      notes: '',
      type: 'Booking',
      nickname: 'create',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
          name: 'scheduleId',
          in: 'path',
          description: 'User id to be passed as query parameter so as to fetch Booking.',
          required: true,
          type: 'integer',
          format: 'int32',
          paramType: 'path'
      }, {
          name: 'body',
          in: 'body',
          description: 'Booking json.',
          required: true,
          type: 'Booking',
          paramType: 'body',
          allowMultiple: false
      }]
    }
  };
  
  var createAndroid = {
	'spec': {
      description: 'Booking operations',
      path: '/android/{scheduleId}/booking',
      method: 'POST',
      summary: 'Create Booking from Android',
      notes: '',
      type: 'Booking',
      nickname: 'createAndroid',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
          name: 'scheduleId',
          in: 'path',
          description: 'User id to be passed as query parameter so as to fetch Booking.',
          required: true,
          type: 'integer',
          format: 'int32',
          paramType: 'path'
      }, {
          name: 'body',
          in: 'body',
          description: 'Booking json.',
          required: true,
          type: 'Booking',
          paramType: 'body',
          allowMultiple: false
      }]
    }
  };
  
  var backOfficeBookingCreate = {
	'spec': {
      description: 'Booking operations',
      path: '/api/{scheduleId}/booking/backoffice',
      method: 'POST',
      summary: 'Create Booking from event scheduler by Back officer',
      notes: '',
      type: 'Booking',
      nickname: 'backOfficeBookingCreate',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
          name: 'scheduleId',
          in: 'path',
          description: 'User id to be passed as query parameter so as to fetch Booking.',
          required: true,
          type: 'integer',
          format: 'int32',
          paramType: 'path'
      }, {
          name: 'body',
          in: 'body',
          description: 'Booking json.',
          required: true,
          type: 'Booking',
          paramType: 'body',
          allowMultiple: false
      }]
    }
  };
  
  var notifyUserReviews = {
	'spec': {
      description: 'Booking operations',
      path: '/booking/notifyReviews/{userId}',
      method: 'GET',
      summary: 'Notify user for review procedure',
      notes: '',
      type: 'Booking',
      nickname: 'notifyUserReviews',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
          name: 'userId',
          in: 'path',
          description: 'User id to be passed as query parameter so as to fetch Booking.',
          required: true,
          type: 'integer',
          format: 'int32',
          paramType: 'path'
      }]
    }
  };
  
  var cancelBooking = {
	'spec': {
      description: 'Booking operations',
      path: '/booking/admin/cancel-booking',
      method: 'POST',
      summary: 'Cancel Booking',
      notes: '',
      type: 'Booking',
      nickname: 'cancelBooking',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
    	  name: 'body',
          in: 'body',
          description: 'Booking json.',
          required: true,
          type: 'Booking',
          paramType: 'body',
          allowMultiple: false
      }]
    }
  };
  
  var cancelBookingRetry = {
	'spec': {
      description: 'Booking operations',
      path: '/cancelRetry',
      method: 'POST',
      summary: 'Retry Cancel Booking',
      notes: '',
      type: 'Booking',
      nickname: 'cancelBookingRetry',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
    	  name: 'body',
          in: 'body',
          description: 'Booking json.',
          required: true,
          type: 'Booking',
          paramType: 'body',
          allowMultiple: false
      }]
    }
  };
  
  var bookingFailure = {
	'spec': {
      description: 'Booking operations',
      path: '/bookingFailure',
      method: 'GET',
      summary: 'Failure Booking CRON for updating status',
      notes: '',
      type: 'Booking',
      nickname: 'bookingFailure',
      produces: ['application/json'],
      params: searchParms
    }
  };
  
  var retryPayment = {
	'spec': {
      description: 'Booking operations',
      path: '/retryPayment',
      method: 'GET',
      summary: 'Retry Payment for a Booking',
      notes: '',
      type: 'Booking',
      nickname: 'retryPayment',
      produces: ['application/json'],
      params: searchParms
    }
  };
  
  var loadReasonForCancelBooking = {
	'spec': {
      description: 'Booking operations',
      path: '/cancelBooking/loadreasonforcancel',
      method: 'GET',
      summary: 'Load reason for cancelling a booking',
      notes: '',
      type: 'Booking',
      nickname: 'loadReasonForCancelBooking',
      produces: ['application/json'],
      params: searchParms
    }
  };
  
  var addCancelBookingReasons = {
	'spec': {
      description: 'Booking operations',
      path: '/cancelBooking/loadreasonforcancel',
      method: 'POST',
      summary: 'Add reason for cancelling a booking',
      notes: '',
      type: 'Booking',
      nickname: 'addCancelBookingReasons',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
    	  name: 'body',
          in: 'body',
          description: 'Booking json.',
          required: true,
          type: 'Booking',
          paramType: 'body',
          allowMultiple: false
      }]
    }
  };
  
  var loadAdminReasonForCancelBooking = {
	'spec': {
      description: 'Booking operations',
      path: '/cancelBooking/loadReasonAdminCancel',
      method: 'GET',
      summary: 'Load admin reason for cancelling a booking',
      notes: '',
      type: 'Booking',
      nickname: 'loadAdminReasonForCancelBooking',
      produces: ['application/json'],
      params: searchParms
    }
  };
  
  var addAdminCancelBookingReason = {
	'spec': {
      description: 'Booking operations',
      path: '/cancelBooking/loadReasonAdminCancel',
      method: 'POST',
      summary: 'Add admin reason for cancelling a booking',
      notes: '',
      type: 'Booking',
      nickname: 'addAdminCancelBookingReason',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
    	  name: 'body',
          in: 'body',
          description: 'Booking json.',
          required: true,
          type: 'Booking',
          paramType: 'body',
          allowMultiple: false
      }]
    }
  };
  
  // Hot - Desk
  var loadPartnerBookingsHotDesk = {
	'spec': {
      description: 'Booking operations',
      path: '/hot-desk/loadPartnerBooking/booking',
      method: 'GET',
      summary: 'Load partner bookings',
      notes: '',
      type: 'Booking',
      nickname: 'loadPartnerBookingsHotDesk',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
          name: 'partner',
          in: 'query',
          description: 'Partner id to be passed as query parameter so as to fetch Booking.',
          paramType: 'query',
          required: true,
          type: 'integer',
          format: 'int32'
      }]
    }
  };
  
  var allHotDesk = {
	'spec': {
      description: 'Booking operations',
      path: '/booking/hot-desk',
      method: 'GET',
      summary: 'Load partner bookings',
      notes: '',
      type: 'Booking',
      nickname: 'allHotDesk',
      produces: ['application/json'],
      params: searchParms
    }
  };
  
  var createHotDesk = {
    'spec': {
      description: 'Booking operations',
      path: '/booking/hot-desk',
      method: 'POST',
      summary: 'Create Booking',
      notes: '',
      type: 'Booking',
      nickname: 'createHotDesk',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
          name: 'body',
          in: 'body',
          description: 'Booking json.',
          required: true,
          type: 'Booking',
          paramType: 'body',
          allowMultiple: false
      }]
    }
  };
  
  var allHotDeskAndroid = {
	'spec': {
      description: 'Booking operations',
      path: '/android/booking/hot-desk',
      method: 'GET',
      summary: 'Load partner bookings for Hot Desk',
      notes: '',
      type: 'Booking',
      nickname: 'allHotDeskAndroid',
      produces: ['application/json'],
      params: searchParms
    }
  };
  
  var createHotDeskAndroid = {
    'spec': {
      description: 'Booking operations',
      path: '/android/booking/hot-desk',
      method: 'POST',
      summary: 'Create Booking',
      notes: '',
      type: 'Booking',
      nickname: 'createHotDeskAndroid',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
          name: 'body',
          in: 'body',
          description: 'Booking json.',
          required: true,
          type: 'Booking',
          paramType: 'body',
          allowMultiple: false
      }]
    }
  };
  
  var loadScheduleHotDesk = {
	'spec': {
      description: 'Booking operations',
      path: '/loadSchedule/hot-desk',
      method: 'GET',
      summary: 'Load schedules for Hot Desk',
      notes: '',
      type: 'Schedule',
      nickname: 'loadScheduleHotDesk',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
          name: 'roomId',
          in: 'query',
          description: 'Room id to be passed as query parameter so as to fetch Schedule.',
          required: true,
          type: 'integer',
          paramType: 'query',
          allowMultiple: false
      }, {
          name: 'selectFromDate',
          in: 'query',
          description: 'From Date to be passed as query parameter so as to fetch Booking.',
          required: true,
          type: 'integer',
          paramType: 'query',
          allowMultiple: false
      }, {
          name: 'selectEndDate',
          in: 'query',
          description: 'End Date to be passed as query parameter so as to fetch Booking.',
          required: true,
          type: 'integer',
          paramType: 'query',
          allowMultiple: false
      }]
    }
  };
  
  var cancelBookingHotDesk = {
	'spec': {
      description: 'Booking operations',
      path: '/booking/admin/hot-desk/cancel-booking',
      method: 'POST',
      summary: 'Add admin reason for cancelling a booking',
      notes: '',
      type: 'Booking',
      nickname: 'cancelBookingHotDesk',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
    	  name: 'body',
          in: 'body',
          description: 'Booking json.',
          required: true,
          type: 'Booking',
          paramType: 'body',
          allowMultiple: false
      }]
    }
  };
  
  var createBookingByBackOfficeHotDesk = {
	'spec': {
      description: 'Booking operations',
      path: '/back-office/booking/hot-desk',
      method: 'POST',
      summary: 'Create Booking from event scheduler by Back officer',
      notes: '',
      type: 'Booking',
      nickname: 'createBookingByBackOfficeHotDesk',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
          name: 'body',
          in: 'body',
          description: 'Booking json.',
          required: true,
          type: 'Booking',
          paramType: 'body',
          allowMultiple: false
      }]
    }
  };
  
  // Training Room
  var loadPartnerBookingsTrainingRoom = {
	'spec': {
      description: 'Booking operations',
      path: '/training/loadPartnerBooking/booking',
      method: 'GET',
      summary: 'Load partner bookings for Training Room',
      notes: '',
      type: 'Booking',
      nickname: 'loadPartnerBookingsTrainingRoom',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
          name: 'partner',
          in: 'query',
          description: 'Partner id to be passed as query parameter so as to fetch Booking.',
          paramType: 'query',
          required: true,
          type: 'integer',
          format: 'int32'
      }]
    }
  };
  
  /*var allTrainingRoom = {
	'spec': {
      description: 'Booking operations',
      path: '/booking/training',
      method: 'GET',
      summary: 'Load partner bookings for Training Room',
      notes: '',
      type: 'Booking',
      nickname: 'allTrainingRoom',
      produces: ['application/json'],
      params: searchParms
    }
  };*/
  
  var createTrainingRoom = {
    'spec': {
      description: 'Booking operations',
      path: '/booking/training',
      method: 'POST',
      summary: 'Create Booking for Training Room',
      notes: '',
      type: 'Booking',
      nickname: 'createTrainingRoom',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
          name: 'body',
          in: 'body',
          description: 'Booking json.',
          required: true,
          type: 'Booking',
          paramType: 'body',
          allowMultiple: false
      }]
    }
  };
  
  /*var allTrainingRoomAndroid = {
	'spec': {
      description: 'Booking operations',
      path: '/android/booking/training',
      method: 'GET',
      summary: 'Load partner bookings for training room',
      notes: '',
      type: 'Booking',
      nickname: 'allHotDeskAndroid',
      produces: ['application/json'],
      params: searchParms
    }
  };*/
  
  var createTrainingRoomAndroid = {
    'spec': {
      description: 'Booking operations',
      path: '/android/booking/training',
      method: 'POST',
      summary: 'Create Booking for training room',
      notes: '',
      type: 'Booking',
      nickname: 'createTrainingRoomAndroid',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
          name: 'body',
          in: 'body',
          description: 'Booking json.',
          required: true,
          type: 'Booking',
          paramType: 'body',
          allowMultiple: false
      }]
    }
  };
  
  var loadScheduleTrainingRoom = {
	'spec': {
      description: 'Booking operations',
      path: '/loadSchedule/training',
      method: 'GET',
      summary: 'Load schedules for Training Room',
      notes: '',
      type: 'Schedule',
      nickname: 'loadScheduleTrainingRoom',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
          name: 'roomId',
          in: 'query',
          description: 'Room id to be passed as query parameter so as to fetch Schedule.',
          required: true,
          type: 'integer',
          paramType: 'query',
          allowMultiple: false
      }, {
          name: 'selectFromDate',
          in: 'query',
          description: 'From Date to be passed as query parameter so as to fetch Booking.',
          required: true,
          type: 'integer',
          paramType: 'query',
          allowMultiple: false
      }, {
          name: 'selectEndDate',
          in: 'query',
          description: 'End Date to be passed as query parameter so as to fetch Booking.',
          required: true,
          type: 'integer',
          paramType: 'query',
          allowMultiple: false
      }]
    }
  };
  
  var createBookingByBackOfficeTrainingRoom = {
	'spec': {
      description: 'Booking operations',
      path: '/back-office/booking/training',
      method: 'POST',
      summary: 'Create Booking from event scheduler by Back officer for Training Room',
      notes: '',
      type: 'Booking',
      nickname: 'createBookingByBackOfficeTrainingRoom',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
          name: 'body',
          in: 'body',
          description: 'Booking json.',
          required: true,
          type: 'Booking',
          paramType: 'body',
          allowMultiple: false
      }]
    }
  };
  
  var loadTrainingRoomBookingByBackOffice = {
	'spec': {
	    description: 'Booking operations',
	    path: '/training/booking/:trainingRoomId/back-office/:backOfficeId',
	    method: 'GET',
	    summary: 'Load Training Room for Back office',
	    notes: '',
	    type: 'Booking',
	    nickname: 'loadTrainingRoomBookingByBackOffice',
	    produces: ['application/json'],
	    params: searchParms,
	    parameters: [{
	          name: 'trainingRoomId',
	          in: 'path',
	          description: 'Training Room Id to be passed as path parameter so as to fetch Booking.',
	          required: true,
	          type: 'integer',
	          paramType: 'path',
	          allowMultiple: false
	      }, {
	          name: 'backOfficeId',
	          in: 'path',
	          description: 'Back Office Id to be passed as path parameter so as to fetch Booking.',
	          required: true,
	          type: 'integer',
	          paramType: 'path',
	          allowMultiple: false
	      }]
	  }
  };
  
  var fetchDateRange = {
	'spec': {
	    description: 'Booking operations',
	    path: '/date-range/from-to',
	    method: 'POST',
	    summary: 'Load Training Room for Back office',
	    notes: '',
	    type: 'Booking',
	    nickname: 'fetchDateRange',
	    produces: ['application/json'],
	    params: searchParms,
	    parameters: [{
          name: 'body',
          in: 'body',
          description: "From date as 'fromDate', End date as 'endDate', Holiday as boolean 'excludeHoliday', Sunday as boolean 'excludeSunday.'",
          required: true,
          type: 'Booking',
          paramType: 'body',
          allowMultiple: false
      }]
	}
  };
  
  
  swagger.addGet(loadRequiredUserMobile).addGet(bookedSchedule).addGet(loadRequiredRoomType).addGet(loadRequiredUser).addGet(loadClosedSchedule).addGet(loadBookedSchedules)
  	.addGet(loadPartnerBookings).addGet(loadUserBookings).addGet(all).addGet(dashboardBookings).addGet(loadSchedule).addGet(notifyUserReviews).addGet(bookingFailure).addGet(retryPayment)
  	.addGet(loadReasonForCancelBooking).addGet(loadAdminReasonForCancelBooking).addGet(loadPartnerBookingsHotDesk).addGet(allHotDesk).addGet(allHotDeskAndroid).addGet(loadScheduleHotDesk)
  	.addGet(loadPartnerBookingsTrainingRoom).addGet(loadScheduleTrainingRoom).addGet(loadTrainingRoomBookingByBackOffice)
  	.addPost(create).addPost(createAndroid).addPost(backOfficeBookingCreate).addPost(cancelBooking).addPost(cancelBookingRetry).addPost(addCancelBookingReasons).addPost(createHotDesk)
  	.addPost(addAdminCancelBookingReason).addPost(addAdminCancelBookingReason).addPost(createHotDeskAndroid).addPost(cancelBookingHotDesk).addPost(createBookingByBackOfficeHotDesk)
  	.addPost(createTrainingRoom).addPost(createTrainingRoomAndroid).addPost(createBookingByBackOfficeTrainingRoom).addPost(fetchDateRange);

};
