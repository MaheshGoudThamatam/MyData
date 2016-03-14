exports.models = {

  Role: {
    id: 'Role',
    required: ['name', 'roleCode','description'],
    properties: {
   
    	name: {
        type: 'string',
        description: 'name of the role'
      },
      roleCode: {
        type: 'string',
        description: 'roleCode of the role'
      },
      description: {
          type: 'string',
          description: 'description of the role'
        }
    }
  },
  
  Feature: {
	    id: 'Feature',
	    required: ['name', 'url'],
	    properties: {
	   
	    	name: {
	        type: 'string',
	        description: 'name of the Feature'
	      },
	      url: {
	        type: 'string',
	        description: 'url of the Feature'
	      }
	    }
	  },
	  FeatureCategory: {
		    id: 'FeatureCategory',
		    required: ['name', 'icon','description'],
		    properties: {
		   
		    	name: {
		        type: 'string',
		        description: 'name of the FeatureCategory'
		      },
		      icon: {
		        type: 'string',
		        description: 'icon of the FeatureCategory'
		      },
		      description: {
			        type: 'string',
			        description: 'description of the FeatureCategory'
			      }
		    }
		  }
};
