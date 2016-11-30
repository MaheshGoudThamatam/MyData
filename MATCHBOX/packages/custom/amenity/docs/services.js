'use strict';

exports.load = function(swagger, parms) {

  var searchParms = parms.searchableOptions;

  var selectedAmenities = {
    'spec': {
      description: 'Amenity operations',
      path: '/amenity-space/{appliesToId}',
      method: 'GET',
      summary: 'Get specific Amenity based on id.',
      notes: '',
      type: 'Amenity',
      nickname: 'selectedAmenities',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
          name: 'appliesToId',
          in: 'path',
          description: 'Amenity id to be passed as path parameter so as to fetch Amenity.',
          required: true,
          type: 'integer',
          paramType: 'path',
          allowMultiple: false
      }]
    }
  };

  var all = {
    'spec': {
        description: 'Amenity operations',
        path: '/amenity',
        method: 'GET',
        summary: 'Get all Amenities',
        notes: '',
        type: 'Amenity',
        nickname: 'all',
        produces: ['application/json'],
        params: searchParms
      }
  };
  
  var create = {
    'spec': {
      description: 'Amenity operations',
      path: '/amenity',
      method: 'POST',
      summary: 'Create Amenity.',
      notes: '',
      type: 'Amenity',
      nickname: 'create',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
          name: 'body',
          in: 'body',
          description: 'Amenity json.',
          required: true,
          type: 'Amenity',
          paramType: 'body',
          allowMultiple: false
      }]
    }
  };
  
  var show = {
    'spec': {
      description: 'Amenity operations',
      path: '/amenity/{amenityId}',
      method: 'GET',
      summary: 'Show Amenity.',
      notes: '',
      type: 'Amenity',
      nickname: 'show',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
          name: 'amenityId',
          in: 'path',
          description: 'Amenity id to be passed as path parameter so as to fetch Amenity.',
          required: true,
          type: 'integer',
          paramType: 'path',
          allowMultiple: false
      }]
    }
  };
  
  var update = {
    'spec': {
      description: 'Amenity operations',
      path: '/amenity/{amenityId}',
      method: 'PUT',
      summary: 'Update Amenity.',
      notes: '',
      type: 'Amenity',
      nickname: 'update',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
          name: 'amenityId',
          in: 'path',
          description: 'Amenity id to be passed as path parameter so as to fetch Amenity.',
          required: true,
          type: 'integer',
          paramType: 'path',
          allowMultiple: false
      }, {
          name: 'body',
          in: 'body',
          description: 'Amenity json.',
          required: true,
          type: 'Amenity',
          paramType: 'body',
          allowMultiple: false
      }]
    }
  };
  
  var destroy = {
    'spec': {
        description: 'Amenity operations',
        path: '/amenity/{amenityId}',
        method: 'DELETE',
        summary: 'Delete Amenity.',
        notes: '',
        type: 'Amenity',
        nickname: 'destroy',
        produces: ['application/json'],
        params: searchParms,
        parameters: [{
            name: 'amenityId',
            in: 'path',
            description: 'Amenity id to be passed as path parameter so as to fetch Amenity.',
            required: true,
            type: 'integer',
            paramType: 'path',
            allowMultiple: false
        }]
    }
  };

  swagger.addGet(selectedAmenities).addGet(all).addGet(show)
  	.addPost(create).addPut(update).addDelete(destroy);

};
