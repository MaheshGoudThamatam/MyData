'use strict';

exports.load = function(swagger, parms) {

  var searchParms = parms.searchableOptions;

  var all = {
    'spec': {
      description: 'Role operations',
      path: '/role',
      method: 'GET',
      summary: 'Get all Roles',
      notes: '',
      type: 'Role',
      nickname: 'getRoles',
      produces: ['application/json'],
      params: searchParms
    }
  };

  var create = {
    'spec': {
      description: 'Role operations',
      path: '/role',
      method: 'POST',
      summary: 'Create article',
      notes: '',
      type: 'Role',
      nickname: 'createRole',
      produces: ['application/json'],
      parameters: [{
        name: 'body',
        description: 'Role to create.  User will be inferred by the authenticated user.',
        required: true,
        type: 'Role',
        paramType: 'body',
        allowMultiple: false
      }]
    }
  };

  swagger.addGet(all)
    .addPost(create);

};
