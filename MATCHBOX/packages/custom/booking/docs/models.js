exports.models = {

  Booking: {
    id: 'Booking',
    //required: ['content', 'title'],
    properties: {
    	
    	_id: {
    		type: 'integer',
	        format: 'int64'
    	},
		user: {
			type: 'integer',
	        format: 'int64'
	    },
	    room: {
	    	type: 'integer',
	        format: 'int64'
	    },
	    bookedRooms: [{
	    	type: 'Array',
	        description: 'Ids of room, in case of Hot Desk'
	    }],
	    status: {
	    	type: 'string',
	        default: 'Failed'
	    },
	    sequenceNumber: {
			type: 'integer'
	    },
	    isAgreed: {
	        type: 'boolean',
	        default: false
	    },
	    bookingDate: {
	    	type: 'date'
	    },
	    bookingFrom: {
	    	type: 'date'
	    },
	    bookingTo: {
	    	type: 'date'
	    },
	    bookingStartTime: {
	    	type: 'date'
	    },
	    bookingEndTime: {
	    	type: 'date'
	    },
	    price: {
			type: 'integer'
	    },
	    schedule: {
			type: 'integer',
	        format: 'int64'
	    },
	    scheduleTraining: [{
			type: 'Array',
	        format: 'Ids of schedule'
	    }],
	    relatedBookedRooms: [{
	    	type: 'Array',
	        description: 'Ids of room, in case of Hot Desk'
	    }],
	    partner: {
			type: 'integer',
	        format: 'int64'
	    },
	    space: {
			type: 'integer',
	        format: 'int64'
	    },

	    createdAt: {
	    	type: 'date'
	    },
	    updatedAt: {
	    	type: 'date'
	    },
	    day: {
	    	type: 'string'
	    },
	    bookingStartTimeNumber: {
			type: 'integer'
	    },
	    bookingEndTimeNumber: {
			type: 'integer'
	    },
	    startTime: {
	    	type: 'string'
	    },
	    endTime: {
	    	type: 'string'
	    },
	    fromDate : {
	    	type: 'string'
	    },
	    endDate: {
	    	type: 'string'
	    },
	    no_of_days: {
			type: 'integer'
	    },
	    timeZoneOffset: {
			type: 'integer'
	    },
	    payUMoneyId: {
	    	type: 'string',
	        default: ''
	    },
	    totalHours:{
			type: 'integer'
	    },
	    priceWithoutTax:{
			type: 'integer'
	    },
	    reviewed: {
	    	type: 'boolean',
	    	default: false
	    },
	    bookingConfirmationId:{
	    	type: 'string'
	    },
	    partnerAmount:{
			type: 'integer'
	    },
	    adminAmount:{
			type: 'integer'
	    },
	    capacity:{
			type: 'integer'
	    },
	    roomPrice:{
			type: 'integer'
	    },
	    requestReview :{
	    	type: 'boolean',
    		default: false
	    },
	    promoCode: {
			type: 'integer',
	        format: 'int64'
	    },
	    guestUser:{
			type: 'integer',
	        format: 'int64'
	    },
	    isWalkin:{
	    	type: 'boolean',
			default: false
	    },
	    isFaliedMerge:{
	    	type: 'boolean',
			default: false
	    },
	    specialNoteDescription:{
	    	type: 'string'
	    },
	    address:{
	    	type: 'string'
	    },
	    service_tax: {
			type: 'integer'
	    },
	    reason:{
	    	type: 'string'
	    },
	    reasondescription:{
	    	type: 'string'
	    },
	    isMerged:{
	    	type: 'boolean',
			default: false
	    },
	    initiatedBy : {
	    	type: 'string'
	    },
	    cancelledBy : {
			type: 'integer',
	        format: 'int64'
	    },
	    feature : {
	    	type: 'string'
		}
      
    }
  },
  
  Schedule : {
	    id: 'Schedule',
	    //required: ['content', 'title'],
	    properties: {
			room: {
				type: 'integer',
		        format: 'int64'
		    },
			spaceId: {
				type: 'integer',
		        format: 'int64'
		    },
			loc: [{
		    	type: 'Array',
		        description: '2dSphere as Number'
		    }],
			roomType: {
				type: 'integer',
		        format: 'int64'
		    },
			day: {
				type: 'string'
			},
			date: {
				type: 'date'
			},
			createdAt: {
				type: 'date'
			},
			initialAval: [{
		    	type: 'Array',
		        description: 'start time and end time in date format'
		    }],
			currentAval: [{
		    	type: 'Array',
		        description: 'start time and end time in date format and boolean value isBlocked with default value false'
		    }],
			isAllday: {
				type: 'boolean'
			},
			isClosed: {
				type: 'boolean'
			}
	    }
  },
  
  Notification : {
    id: 'Notification',
    //required: ['content', 'title'],
    properties: {
    	_id: {
    		type: 'integer',
	        format: 'int64'
    	},
		user: {
			type: 'integer',
	        format: 'int64'
	    }      
    }
  }
  
};
