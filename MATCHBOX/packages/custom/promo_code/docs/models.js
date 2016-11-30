exports.models = {

  PROMO_CODE: {
    id: 'PROMO_CODE',
    //required: ['content', 'title'],
    properties: {
    	
    	_id: {
    		type: 'integer',
	        format: 'int64'
    	},
    	promo_code: {
			type: 'string',
			default: ''
		},
		description: {
			type: 'string',
			default: ''
		},
		isPercent: {
			type: 'boolean'
		},
		value: {
			type: 'integer',
			minimum: 0
		},
		isActive: {
			type: 'boolean',
			default: true
		},
		maxCount: {
			type: 'integer'
		},
		useCount: {
			type: 'integer'
		}
  	}
 }
};
