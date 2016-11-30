exports.models = {

  Space: {
    id: 'Space',
    required: ['content', 'title'],
    properties: {
    	name: {
    		type: 'string'
    	},
    	address1: {
    		type: 'string'
    	    	},
    	address2: {
    		type: 'string'
    	    	},
    	/*phone: {
    		type: String
    	},*/
    	contact_details_1: {
    		type: 'string'
    	    	},
    	contact_details_2: {
    		type: 'string'
    	    	},
    	city: {
    		type: 'string'
    	    	},
    	locality: {
    		type: 'string'
    	    	},
    	state: {
    		type: 'string'
    	    	},
    	postal_code: {
    		type: 'integer'
    	},
    	country: {
    		type: 'string'
    	    	},
    	loc: {
			type: 'integer',
	        description: 'array for location'
		},
    	rooms: [{
			type: 'Array',
	        description: 'rooms'
		}],
    	amenities: [{
			type: 'Array',
	        description: 'amenities'
		}],
    	space_type: {
    		type: 'integer',
	        format: 'int64'
    	},
    	partner: {
    		type: 'integer',
	        format: 'int64'
    	},
    	back_office: [{
			type: 'Array',
	        description: 'back_office'
		}],
    	front_office: [{
			type: 'Array',
	        description: 'front_office'
		}],
    	created: {
    		type: 'date'
    	},
    	modified: {
    		type: 'date'
    	    	},
    	rating: {
    		type: 'integer',
    	},
    	images: [{
			type: 'Array',
	        description: 'images'
		}],
    	service_tax: {
    		type: 'string'
    	    	},
    	company_PAN: {
    		type: 'string'
    	    	},
    	company_TIN: {
    		type: 'string'
    	    	},
    	registered_company_name :{
    		type: 'string'
    	    	},
    	registered_company_address :{
    		type: 'string'
    	    	},
    	officeHours: [{
			type: 'Array',
	        description: 'officeHours'
		}],
    	space_holiday: [{
			type: 'Array',
	        description: 'space_holiday'
		}],
    	teams: [{
			type: 'Array',
	        description: 'teams'
		}],
    	createdBy: {
    		type: 'integer',
	        format: 'int64'
    	},
        approveStatus:{
    		type: 'string'
    	    	},
        sentToAdminApproval: {
    		type: 'boolean'
    	}
    }
  },
  
  Review: {
      id: 'Review',
      required: ['content', 'title'],
      properties: {
		space: {
    		type: 'integer',
	        format: 'int64'
    	},
		booking: {
    		type: 'integer',
	        format: 'int64'
    	},
		title: {
    		type: 'string'
    	},
		text: {
    		type: 'string'
    	},
		rating: {
			type: 'integer'
		},
		createdAt: {
			type: 'date'
		},
		updatedAt: {
			type: 'date'
		},
		createdBy: {
    		type: 'integer',
	        format: 'int64'
    	}
	}
  }

};
