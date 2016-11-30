exports.models = {

  SPACE_TYPE: {
    id: 'SPACE_TYPE',
    properties: {
    	
    	_id: {
    		type: 'integer',
	        format: 'int64'
    	},
    	name: {
			type: 'string',
			default: ''
		},
		description: {
			type: 'string',
			default: ''
		},
		status: {
			type: 'boolean',
			default: false
		}
  	}
 }
};