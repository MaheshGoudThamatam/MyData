'use strict';

exports.load = function(swagger, parms) {

  var searchParms = parms.searchableOptions;

  var all = {
      'spec': {
        description: 'Load all holiday',
        path: '/holiday',
        method: 'GET',
        summary: 'Load all holiday',
        notes: '',
        type: 'Holiday',
        nickname: 'all',
        produces: ['application/json'],
        params: searchParms
      }
  };

  var loadHolidayBasedOnYear = {
    'spec': {
      description: 'Load holiday based on year',
      path: '/holiday/basedonyear',
      method: 'GET',
      summary: 'Load holiday based on year',
      notes: '',
      type: 'Holiday',
      nickname: 'loadHolidayBasedOnYear',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
          name: 'selectedyears',
          in: 'query',
          description: 'Search object that contains parameter in order to query and fetch the booking.',
          required: true,
          type: 'integer',
          paramType: 'query',
          allowMultiple: false
        }]
    }
  };

  var loadHolidayBasedByDays = {
    'spec': {
      description: 'Load holiday based on days',
      path: '/holiday/days',
      method: 'GET',
      summary: 'Load holiday based on days',
      notes: '',
      type: 'Holiday',
      nickname: 'loadHolidayBasedByDays',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
          name: 'days',
          in: 'query',
          description: 'Search object that contains parameter in order to query and fetch the booking.',
          required: true,
          type: 'integer',
          paramType: 'query',
          allowMultiple: false
        }]
    }
  };

  var show = {
    'spec': {
      description: 'Load holiday based on days',
      path: '/holiday/{holidayId}',
      method: 'GET',
      summary: 'Load holiday based on days',
      notes: '',
      type: 'Holiday',
      nickname: 'show',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
          name: 'holidayId',
          in: 'path',
          description: 'Search object that contains parameter in order to query and fetch the booking.',
          required: true,
          type: 'int32',
          paramType: 'path',
          allowMultiple: false
        }]
    }
  };
  
  var create = {
    'spec': {
      description: 'Create Holiday',
      path: '/holiday',
      method: 'POST',
      summary: 'Create Holiday',
      notes: '',
      type: 'Holiday',
      nickname: 'create',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
          name: 'body',
          in: 'body',
          description: 'Holiday json.',
          required: true,
          type: 'Holiday',
          paramType: 'body',
          allowMultiple: false
      }]
    }
  };

  var update = {
    'spec': {
      description: 'Update Holiday',
      path: '/holiday/{holidayId}',
      method: 'DESTROY',
      summary: 'Update Holiday',
      notes: '',
      type: 'Holiday',
      nickname: 'update',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
          name: 'holidayId',
          in: 'path',
          description: 'Holiday json.',
          required: true,
          type: 'Holiday',
          paramType: 'path',
          allowMultiple: false
      }]
    }
  };

  var destroy = {
    'spec': {
      description: 'Delete Holiday',
      path: '/holiday/{holidayId}',
      method: 'POST',
      summary: 'Delete Holiday',
      notes: '',
      type: 'Holiday',
      nickname: 'destroy',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
          name: 'holidayId',
          in: 'path',
          description: 'Holiday json.',
          required: true,
          type: 'Holiday',
          paramType: 'path',
          allowMultiple: false
      }]
    }
  };
  
  swagger.addGet(all).addGet(loadHolidayBasedOnYear).addGet(loadHolidayBasedByDays).addGet(show)
         .addPost(create)
         .addPut(update)
         .addDelete(destroy);
  };
