'use strict';

exports.load = function(swagger, parms) {

  var searchParms = parms.searchableOptions;

  var create = {
    'spec': {
        description: 'Space operations',
        path: '/space',
        method: 'POST',
        summary: 'Create specific Space.',
        notes: '',
        type: 'Space',
        nickname: 'loadPartners',
        produces: ['application/json'],
        params: searchParms,
        parameters: [{
            name: 'body',
            in: 'body',
            description: 'Space json.',
            required: true,
            type: 'integer',
            paramType: 'body',
            allowMultiple: false
        }]
      }
    };
  
  var loadPartnersSpace = {
    'spec': {
        description: 'Space operations',
        path: '/partner/{partnerId}/space',
        method: 'GET',
        summary: 'Create specific Space.',
        notes: '',
        type: 'Space',
        nickname: 'loadPartnersSpace',
        produces: ['application/json'],
        params: searchParms,
        parameters: [{
            name: 'partnerId',
            in: 'path',
            description: 'Partner Id to be passed as query parameter so as to fetch Space.',
            required: true,
            type: 'integer',
            paramType: 'path',
            allowMultiple: false
        }]
      }
    };
  
  var loadPartners = {
    'spec': {
      description: 'Space operations',
      path: '/space/partner',
      method: 'GET',
      summary: 'Fetch partners.',
      notes: '',
      type: 'Space',
      nickname: 'loadPartners',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
          name: 'userType',
          in: 'query',
          description: 'Role name to be passed as query parameter so as to fetch Space.',
          required: true,
          type: 'integer',
          paramType: 'query',
          allowMultiple: false
      }]
    }
  };
  
  var get = {
    'spec': {
        description: 'Space operations',
        path: '/space/{spaceId}',
        method: 'GET',
        summary: 'Get specific Space.',
        notes: '',
        type: 'Space',
        nickname: 'get',
        produces: ['application/json'],
        params: searchParms,
        parameters: [{
            name: 'spaceId',
            in: 'path',
            description: 'Space Id to be passed as path parameter so as to fetch Space.',
            required: true,
            type: 'integer',
            paramType: 'path',
            allowMultiple: false
        }]
      }
    };
  
  var update = {
    'spec': {
        description: 'Space operations',
        path: '/space/{spaceId}',
        method: 'PUT',
        summary: 'Update specific Space.',
        notes: '',
        type: 'Space',
        nickname: 'update',
        produces: ['application/json'],
        params: searchParms,
        parameters: [{
            name: 'spaceId',
            in: 'path',
            description: 'Space Id to be passed as path parameter so update Space.',
            required: true,
            type: 'integer',
            paramType: 'path',
            allowMultiple: false
        }, {
            name: 'body',
            in: 'body',
            description: 'Space json.',
            required: true,
            type: 'integer',
            paramType: 'body',
            allowMultiple: false
        }]
      }
    };
  
  var deleteSpace = {
    'spec': {
        description: 'Space operations',
        path: '/space/{spaceId}',
        method: 'DELETE',
        summary: 'Delete specific Space.',
        notes: '',
        type: 'Space',
        nickname: 'deleteSpace',
        produces: ['application/json'],
        params: searchParms,
        parameters: [{
            name: 'spaceId',
            in: 'path',
            description: 'Space Id to be passed as path parameter so delete Space.',
            required: true,
            type: 'integer',
            paramType: 'path',
            allowMultiple: false
        }]
      }
    };
  
  var getSpaceAddress = {
    'spec': {
        description: 'Space operations',
        path: '/partner/team/{userId}/space',
        method: 'GET',
        summary: 'Get Space Address.',
        notes: '',
        type: 'Space',
        nickname: 'getSpaceAddress',
        produces: ['application/json'],
        params: searchParms,
        parameters: [{
            name: 'userId',
            in: 'path',
            description: 'User Id to be passed as path parameter so as to fetch Space.',
            required: true,
            type: 'integer',
            paramType: 'path',
            allowMultiple: false
        }]
      }
    };
  
  var createReview = {
    'spec': {
        description: 'Space operations',
        path: '/space/review/{bookingId}',
        method: 'POST',
        summary: 'Review Booked Room.',
        notes: '',
        type: 'Review',
        nickname: 'createReview',
        produces: ['application/json'],
        params: searchParms,
        parameters: [{
            name: 'bookingId',
            in: 'path',
            description: 'Booking Id to be passed as path parameter so as to fetch Space.',
            required: true,
            type: 'integer',
            paramType: 'path',
            allowMultiple: false
        }, {
            name: 'body',
            in: 'body',
            description: 'Review json.',
            required: true,
            type: 'integer',
            paramType: 'body',
            allowMultiple: false
        }]
      }
    };
  
  var getReview = {
    'spec': {
        description: 'Space operations',
        path: '/space/review/{reviewId}',
        method: 'GET',
        summary: 'Get specific Review.',
        notes: '',
        type: 'Review',
        nickname: 'getReview',
        produces: ['application/json'],
        params: searchParms,
        parameters: [{
            name: 'reviewId',
            in: 'path',
            description: 'Review Id to be passed as path parameter so as to fetch Review.',
            required: true,
            type: 'integer',
            paramType: 'path',
            allowMultiple: false
        }]
      }
    };
  
  var updateReview = {
    'spec': {
        description: 'Space operations',
        path: '/space/review/{reviewId}',
        method: 'PUT',
        summary: 'Update specific Review.',
        notes: '',
        type: 'Review',
        nickname: 'updateReview',
        produces: ['application/json'],
        params: searchParms,
        parameters: [{
            name: 'reviewId',
            in: 'path',
            description: 'Review Id to be passed as path parameter so update Review.',
            required: true,
            type: 'integer',
            paramType: 'path',
            allowMultiple: false
        }, {
            name: 'body',
            in: 'body',
            description: 'Review json.',
            required: true,
            type: 'integer',
            paramType: 'body',
            allowMultiple: false
        }]
      }
    };
  
  var deleteReview = {
    'spec': {
        description: 'Space operations',
        path: '/space/review/{reviewId}',
        method: 'DELETE',
        summary: 'Delete specific Review.',
        notes: '',
        type: 'Review',
        nickname: 'deleteReview',
        produces: ['application/json'],
        params: searchParms,
        parameters: [{
            name: 'reviewId',
            in: 'path',
            description: 'Review Id to be passed as path parameter so as to delete Review.',
            required: true,
            type: 'integer',
            paramType: 'path',
            allowMultiple: false
        }]
      }
    };
  
  var getUserReviews = {
    'spec': {
        description: 'Space operations',
        path: '/space/reviews/{userId}',
        method: 'GET',
        summary: 'Get specific user Reviews.',
        notes: '',
        type: 'Review',
        nickname: 'getUserReviews',
        produces: ['application/json'],
        params: searchParms,
        parameters: [{
            name: 'userId',
            in: 'path',
            description: 'User Id to be passed as path parameter so as to fetch Review.',
            required: true,
            type: 'integer',
            paramType: 'path',
            allowMultiple: false
        }]
      }
    };
  
  var getSpaceReviews = {
    'spec': {
        description: 'Space operations',
        path: '/space/{spaceId}/reviews',
        method: 'GET',
        summary: 'Get Space Reviews.',
        notes: '',
        type: 'Review',
        nickname: 'getSpaceReviews',
        produces: ['application/json'],
        params: searchParms,
        parameters: [{
            name: 'spaceId',
            in: 'path',
            description: 'Space Id to be passed as path parameter so as to fetch Space Review.',
            required: true,
            type: 'integer',
            paramType: 'path',
            allowMultiple: false
        }]
      }
    };
  
  var getSpaceDetail = {
    'spec': {
        description: 'Space operations',
        path: '/getSpaceRoomDetail/{roomId}',
        method: 'GET',
        summary: 'Get Space Details.',
        notes: '',
        type: 'Space',
        nickname: 'getSpaceDetail',
        produces: ['application/json'],
        params: searchParms,
        parameters: [{
            name: 'roomId',
            in: 'path',
            description: 'Room Id to be passed as path parameter so as to fetch Space details.',
            required: true,
            type: 'integer',
            paramType: 'path',
            allowMultiple: false
        }]
      }
    };
  
  var loadSpaceBackOffice = {
    'spec': {
        description: 'Space operations',
        path: '/getSpaceBackOffice',
        method: 'GET',
        summary: 'Get Space for Back Office.',
        notes: '',
        type: 'Space',
        nickname: 'loadSpaceBackOffice',
        produces: ['application/json'],
        params: searchParms
      }
    };
  
  var fetchRoleName = {
    'spec': {
        description: 'Space operations',
        path: '/fetchRole',
        method: 'GET',
        summary: 'Get Space Details.',
        notes: '',
        type: 'Space',
        nickname: 'fetchRoleName',
        produces: ['application/json'],
        params: searchParms,
        parameters: [{
            name: 'roleId',
            in: 'query',
            description: 'Role Id to be passed as query parameter so as to fetch Role Name.',
            required: true,
            type: 'integer',
            paramType: 'query',
            allowMultiple: false
        }]
      }
    };
  
  var spaceSendToAdminApproval = {
    'spec': {
        description: 'Space operations',
        path: '/space/admin/spaceSendToAdminApproval',
        method: 'PUT',
        summary: 'Sending Space To Admin For Approval.',
        notes: '',
        type: 'Space',
        nickname: 'spaceSendToAdminApproval',
        produces: ['application/json'],
        params: searchParms,
        parameters: [{
            name: 'body',
            in: 'body',
            description: 'Space Id in body.',
            required: true,
            type: 'integer',
            paramType: 'body',
            allowMultiple: false
        }]
      }
    };
  
  var spaceByRole = {
    'spec': {
        description: 'Space operations',
        path: '/event-scheduler/space/role',
        method: 'GET',
        summary: 'Get Space by role.',
        notes: '',
        type: 'Space',
        nickname: 'spaceByRole',
        produces: ['application/json'],
        params: searchParms,
        parameters: [{
            name: 'role',
            in: 'query',
            description: 'Role Name to be passed as query parameter so as to fetch Space.',
            required: true,
            type: 'integer',
            paramType: 'query',
            allowMultiple: false
        }]
      }
    };
  

  swagger.addGet(loadPartners).addGet(get).addGet(loadPartnersSpace).addGet(getSpaceAddress).addGet(getReview).addGet(getUserReviews).addGet(getSpaceReviews)
  	.addGet(getSpaceDetail).addGet(loadSpaceBackOffice).addGet(fetchRoleName).addGet(spaceByRole)
  	.addPost(create).addPost(createReview).addPut(update).addDelete(deleteSpace).addPut(updateReview).addPut(spaceSendToAdminApproval)
  	.addDelete(deleteReview);

};
