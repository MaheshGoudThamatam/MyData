exports.models = {

  Role: {
    id: 'Role',
    required: ['content', 'title'],
    properties: {
   
      name: {
        type: 'string',
        description: 'name of the role'
      },
      description: {
        type: 'string',
        description: 'description of the role'
      },
      features: {
        type: 'Array',
        description: 'features Ids'
      },
      createdAt: {
    	 type: 'string',
    	 format: 'date',
         description: 'role creation date'
  	  },
  	  updatedAt: {
  		type: 'string',
  		format: 'date',
        description: 'role updation date'
  	  },
  	  isAdmin: {
  		type: 'boolean'
  	  },	
  	  isTeam: {
    	type: 'boolean'
  	  }
      
    }
  }
};
