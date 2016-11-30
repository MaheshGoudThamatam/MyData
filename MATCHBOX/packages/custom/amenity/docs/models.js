exports.models = {

  Amenity: {
    id: 'Amenity',
    required: ['content', 'title'],
    properties: {
    	name: {
    		type: 'string'
    	},
    	description: {
    		type: 'string'
    	},
    	status: {
    		type: 'integer'
    	},
    	created: {
    		type: 'date'
    	},
    	modified: {
    		type: 'date'
    	},
    	icon: {
    		type: 'string'
    	},
    	appliesTo: {
			type: 'integer',
	        format: 'int64'
	    },
    	partOf: {
			type: 'integer',
	        format: 'int64'
	    },
    	isStatus: {
    		type: 'boolean'
    	}
    }
  }
};
