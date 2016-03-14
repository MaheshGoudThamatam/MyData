exports.models = {

  Jobsite: {
    id: 'Jobsite',
    required: ['content', 'title'],
    properties: {
   
      title: {
        type: 'string',
        description: 'Title of the branch'
      },
      content: {
        type: 'string',
        description: 'content of the branch'
      },
      permissions: {
        type: 'Array',
        description: 'Permissions for viewing the branch'
      }
    }
  }
};
