exports.models = {

  Holiday: {
    id: 'Holiday',
    //required: ['content', 'title'],
    properties: {
    	
    	_id: {
    		type: 'integer',
	        format: 'int64'
    	},
    	name: {
			type: 'string',
			default: '',
		},

		description: {
			type: 'string'
		},
		year: {
			type: 'integer'
		},
		has_admin_created: {
			type: 'boolean',
			default: false
		},
		partner: {
			type: 'integer',
	        format: 'int64'
		},
		holiday_date: {
			type: 'date',
		}		
  	}  
  }
};
