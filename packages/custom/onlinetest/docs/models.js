exports.models = {

  Onlinetest: {
    id: 'Onlinetest',
    required: ['name', 'description','instructions','duration','numberOfQuestions','passMark'],
    properties: {
   
    	name: {
        type: 'string',
        description: 'name of the online test'
      },
      description: {
        type: 'string',
        description: 'description of the online test'
      },
      instructions: {
          type: 'string',
          description: 'instructions of the online test'
        },
        duration: {
          type: 'number',
          description: 'duration of the online test'
        },
        numberOfQuestions: {
          type: 'number',
          description: 'questions of the online test'
         },
         passMark: {
           type: 'number',
           description: 'pass mark of the online test'
         },
     
    }
  }
};
