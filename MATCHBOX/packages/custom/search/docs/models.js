exports.models = {

  Rooms: {
    id: 'Rooms',
    //required: ['content', 'title'],
    properties: {
    	
    	_id: {
    		type: 'integer',
	        format: 'int64'
    	},
        name: {
          type: 'string',
          description: 'name of the room'
        },
        description: {
          type: 'string',
          description: 'description of the room'
        },
        features: {
          type: 'Array',
          description: 'features Ids'
        },
        createdAt: {
     	  type: 'string',
    	  format: 'date',
          description: 'room creation date'
  	    },
  	    updatedAt: {
   		  type: 'string',
  	  	  format: 'date',
          description: 'room updation date'
  	    },
		roomtype: {
			//type: Schema.ObjectId,
			type: 'integer',
	        format: 'int64'
		},
		spaceId: {
			//type: Schema.ObjectId,
			type: 'integer',
	        format: 'int64'
		},
		pricePerhour: {
			type: 'integer'
		},
		pricePerhalfday: {
			type: 'integer'
		},
		pricePerfullday: {
			type: 'integer'
		},
		capacity: {
			type: 'integer'
		},
		created: {
			type: 'date'
		},
		images: [{
			type: 'Array',
	        description: 'images'
		}],
		status: {
			type: 'string'
		},
		avgRating: {
			type: 'integer'
		},
		isAdminAdded: {
			type: 'boolean',
			default: false
		},
		sentToAdminApproval: {
			type: 'boolean',
			default: false
		},
		isPublished: {
			type: 'boolean',
			default: false
		},
		partner: { // hotel or business center
			//type: Schema.ObjectId,
			type: 'integer',
	        format: 'int64'
		},
		isActive: {
			type: 'boolean'
		},
		reasonForRejection: {
			type: 'string'
		}
      
    }
  }
};
