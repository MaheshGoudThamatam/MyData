exports.models = {

  Batch: {
    id: 'Batch',
    required: ['batch_name', 'start_date','course'],
    properties: {
   
    	batch_name: {
        type: 'string',
        description: 'Name of the batch'
      },
      start_date: {
        type: 'Date',
        description: 'Start date of the batch'
      },
      course: {
        type: 'Object',
        description: 'Course reference object'
      }
    }
  },
 /**
  * Course franchise  
  * */
  Franchise: {
  id: 'Franchise',
  required: ['name', 'url','email','contactDetails'],
  properties: {
 
	  name: {
      type: 'string',
      description: 'name of the Course franchise  '
    },
    url: {
        type: 'string',
        description: 'url of the Course franchise'
    },
    email: {
        type: 'string',
        description: 'email of the Course franchise'
     },
     contactDetails: {
        type: 'Array',
        description: 'contactDetails of the Course franchise'
      }
     }
},
  /**
   * Course   
   * */
  Course: {
   id: 'Course',
   required: ['name', 'description','qualification','course_startDate'],
   properties: {
  
 	  name: {
       type: 'string',
       description: 'name of the Course'
     },
     description: {
         type: 'string',
         description: 'description of the Course'
     },
     qualification: {
         type: 'string',
         description: 'qualification of the Course '
      },
      course_startDate: {
         type: 'Date',
         description: 'Start date of the Course'
       }
      }
 }
};
