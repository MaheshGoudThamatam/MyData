'use strict';

exports.load = function(swagger, parms) {

  var searchParms = parms.searchableOptions;

  var pagination = {
      'spec': {
        description: 'Load all space type.',
        path: '/space-type/pagination',
        method: 'GET',
        summary: 'Load all space type.',
        notes: '',
        type: 'SPACE_TYPE',
        nickname: 'all',
        produces: ['application/json'],
        params: searchParms
      }
  };

  var get = {
    'spec': {
      description: 'Load single space type.',
        path: '/spaceType/{spaceTypeId}',
      method: 'GET',
      summary: 'Load single space type.',
      notes: '',
      type: 'SPACE_TYPE',
      nickname: 'get',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
          name: 'spaceTypeId',
          in: 'path',
          description: 'Space type id.',
          required: true,
          type: 'string',
          paramType: 'path',
          allowMultiple: false
        }]
    }
  };
  
   var create = {
      'spec': {
        description: 'Create Space type',
        path: '/spaceType',
        method: 'POST',
        summary: 'Create Space type',
        notes: '',
        type: 'SPACE_TYPE',
        nickname: 'create',
        produces: ['application/json'],
        params: searchParms,
        parameters: [{
            name: 'body',
            in: 'body',
            description: 'Space type json.',
            required: true,
            type: 'SPACE_TYPE',
            paramType: 'body',
            allowMultiple: false
        }]
      }
    };

    var update = {
      'spec': {
        description: 'Update Space type',
        path: '/spaceType/{spaceTypeId}',
        method: 'PUT',
        summary: 'Update Space type',
        notes: '',
        type: 'SPACE_TYPE',
        nickname: 'update',
        produces: ['application/json'],
        params: searchParms,
        parameters: [{
            name: 'spaceTypeId',
            in: 'path',
            description: 'Space type id should be used instead of Object Id.',
            required: true,
            type: 'integer',
            paramType: 'path',
            allowMultiple: false
        },
        {
            name: 'body',
            in: 'body',
            description: 'Space type json.',
            required: true,
            type: 'SPACE_TYPE',
            paramType: 'body',
            allowMultiple: false
        }]
      }
    };

   var destroy = {
    'spec': {
      description: 'Delete Space type',
      path: '/spaceType/{spaceTypeId}',
      method: 'POST',
      summary: 'Delete Space type',
      notes: '',
      type: 'SPACE_TYPE',
      nickname: 'destroy',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
          name: 'spaceTypeId',
          in: 'path',
          description: 'Space type should be used instead of Object Id.',
          required: true,
          type: 'integer',
          paramType: 'path',
          allowMultiple: false
      }]
    }
  };
  
  swagger.addGet(pagination).addGet(get)
         .addPost(create)
         .addPut(update)
         .addDelete(destroy);
  };
