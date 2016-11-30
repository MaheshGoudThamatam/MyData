'use strict';

exports.load = function(swagger, parms) {

  var searchParms = parms.searchableOptions;

  var all = {
      'spec': {
        description: 'Load all PROMO CODE',
        path: '/promoCode',
        method: 'GET',
        summary: 'Load all PROMO CODE',
        notes: '',
        type: 'PROMO_CODE',
        nickname: 'all',
        produces: ['application/json'],
        params: searchParms
      }
  };

  var get = {
    'spec': {
      description: 'Load promo code',
      path: '/promoCode/{promoCodeId}',
      method: 'GET',
      summary: 'Load promo code',
      notes: '',
      type: 'PROMO_CODE',
      nickname: 'get',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
          name: 'promoCodeId',
          in: 'path',
          description: 'PROMO code should be used instead of Object Id.',
          required: true,
          type: 'string',
          paramType: 'path',
          allowMultiple: false
        }]
    }
  };
  
  var deActivatePromoCode = {
    'spec': {
      description: 'Deactivate PROMO code',
      path: '/deActivate/promoCode/{promoCodeId}',
      method: 'GET',
      summary: 'Deactivate PROMO code',
      notes: '',
      type: 'PROMO_CODE',
      nickname: 'deActivatePromoCode',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
          name: 'promoCodeId',
          in: 'path',
          description: 'PROMO code should be used instead of Object Id.',
          required: true,
          type: 'string',
          paramType: 'path',
          allowMultiple: false
        }]
    }
  };
  
  var validatePromoCode = {
    'spec': {
      description: 'Validate PROMO code',
      path: '/validate/promoCode/{promoCodeId}',
      method: 'GET',
      summary: 'Validate PROMO code',
      notes: '',
      type: 'PROMO_CODE',
      nickname: 'validatePromoCode',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
          name: 'promoCodeId',
          in: 'path',
          description: 'PROMO code should be used instead of Object Id. (Works only with logged in user.)',
          required: true,
          type: 'string',
          paramType: 'path',
          allowMultiple: false
        }]
    }
  };
    var create = {
      'spec': {
        description: 'Create PROMO Code',
        path: '/promoCode',
        method: 'POST',
        summary: 'Create PROMO Code',
        notes: '',
        type: 'PROMO_CODE',
        nickname: 'create',
        produces: ['application/json'],
        params: searchParms,
        parameters: [{
            name: 'body',
            in: 'body',
            description: 'PROMO Code json.',
            required: true,
            type: 'PROMO_CODE',
            paramType: 'body',
            allowMultiple: false
        }]
      }
    };

    var update = {
      'spec': {
        description: 'Update PROMO Code',
        path: '/promoCode/{promoCodeId}',
        method: 'PUT',
        summary: 'Update PROMO Code',
        notes: '',
        type: 'PROMO_CODE',
        nickname: 'update',
        produces: ['application/json'],
        params: searchParms,
        parameters: [{
            name: 'promoCodeId',
            in: 'path',
            description: 'PROMO code should be used instead of Object Id.',
            required: true,
            type: 'integer',
            paramType: 'path',
            allowMultiple: false
        },
        {
            name: 'body',
            in: 'body',
            description: 'PROMO Code json (id) should not have ObjectId and number should be without quote.',
            required: true,
            type: 'PROMO_CODE',
            paramType: 'body',
            allowMultiple: false
        }]
      }
    };

   var destroy = {
    'spec': {
      description: 'Delete PROMO Code',
      path: '/promoCode/{promoCodeId}',
      method: 'POST',
      summary: 'Delete PROMO Code',
      notes: '',
      type: 'PROMO_CODE',
      nickname: 'destroy',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
          name: 'promoCodeId',
          in: 'path',
          description: 'PROMO code should be used instead of Object Id.',
          required: true,
          type: 'integer',
          paramType: 'path',
          allowMultiple: false
      }]
    }
  };
  
  swagger.addGet(all).addGet(get).addGet(deActivatePromoCode).addGet(validatePromoCode)
         .addPost(create)
         .addPut(update)
         .addDelete(destroy);
  };
