'use strict';

exports.load = function(swagger, parms) {

  var searchParms = parms.searchableOptions;

  var fetchRoomsBasedOnRoomType = {
    'spec': {
      description: 'Room operations',
      path: '/room/loadroomsBasedOnRoomType',
      method: 'GET',
      summary: 'Fetch room based on room type',
      notes: '',
      type: 'Room',
      nickname: 'fetchRoomsBasedOnRoomType',
      produces: ['application/json'],
      params: searchParms
    }
  };

  var loadRoomBasedOnRoomType = {
    'spec': {
        description: 'Room operations',
        path: '/room/roomType',
        method: 'GET',
        summary: 'Load room based on room type',
        notes: '',
        type: 'Room',
        nickname: 'loadRoomBasedOnRoomType',
        produces: ['application/json'],
        params: searchParms,
        parameters: [{
            name: 'scopeUser',
            in: 'query',
            description: 'User id to be passed as query parameter so as to fetch Room.',
            required: true,
            type: 'integer',
            paramType: 'query',
            allowMultiple: false
        }, {
            name: 'roomTypeRooms',
            in: 'query',
            description: 'Room Type id to be passed as query parameter so as to fetch Room.',
            required: true,
            type: 'integer',
            paramType: 'query',
            allowMultiple: false
        }, {
            name: 'space',
            in: 'query',
            description: 'Space id to be passed as query parameter so as to fetch Room.',
            required: true,
            type: 'integer',
            paramType: 'query',
            allowMultiple: false
        }]
      }
  };
  
  var loadRoomTypeSchedule = {
    'spec': {
        description: 'Room operations',
        path: '/loadRoomType',
        method: 'GET',
        summary: 'Load room based on room type',
        notes: '',
        type: 'RoomType',
        nickname: 'loadRoomTypeSchedule',
        produces: ['application/json'],
        params: searchParms
      }
  };
  
  var addroomtype = {
    'spec': {
      description: 'RoomType operations',
      path: '/roomtypes/create',
      method: 'POST',
      summary: 'Create RoomType.',
      notes: '',
      type: 'RoomType',
      nickname: 'addroomtype',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
          name: 'body',
          in: 'body',
          description: 'RoomType json.',
          required: true,
          type: 'RoomType',
          paramType: 'body',
          allowMultiple: false
      }]
    }
  };
  
  var loadroomtypes = {
    'spec': {
      description: 'RoomType operations',
      path: '/addroom/loadroomtypes',
      method: 'GET',
      summary: 'Show RoomType.',
      notes: '',
      type: 'RoomType',
      nickname: 'loadroomtypes',
      produces: ['application/json'],
      params: searchParms
    }
  };
  
  var createroom = {
    'spec': {
      description: 'Room operations',
      path: '/roomdetails',
      method: 'POST',
      summary: 'Create Room.',
      notes: '',
      type: 'Room',
      nickname: 'createroom',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
          name: 'body',
          in: 'body',
          description: 'Room json.',
          required: true,
          type: 'Room',
          paramType: 'body',
          allowMultiple: false
      }]
    }
  };
  
  var getAllRooms = {
    'spec': {
        description: 'Room operations',
        path: '/roomdetails',
        method: 'GET',
        summary: 'Fetch all Rooms.',
        notes: '',
        type: 'Room',
        nickname: 'createroom',
        produces: ['application/json'],
        params: searchParms,
        parameters: [{
            name: 'body',
            in: 'body',
            description: 'Room json.',
            required: true,
            type: 'Room',
            paramType: 'body',
            allowMultiple: false
        }]
     }
  };
  
  var deactivateroom = {
    'spec': {
        description: 'Room operations',
        path: '/roomdetails/{roomId}',
        method: 'DELETE',
        summary: 'Deactivate Room.',
        notes: '',
        type: 'Room',
        nickname: 'deactivateroom',
        produces: ['application/json'],
        params: searchParms,
        parameters: [{
            name: 'roomId',
            in: 'path',
            description: 'Room id to be passed as path parameter so as to deactivate Room.',
            required: true,
            type: 'integer',
            paramType: 'path',
            allowMultiple: false
        }]
     }
  };
  
  var singleRoomDetail = {
    'spec': {
        description: 'Room operations',
        path: '/roomdetails/{roomId}',
        method: 'GET',
        summary: 'Fetch Room.',
        notes: '',
        type: 'Room',
        nickname: 'singleRoomDetail',
        produces: ['application/json'],
        params: searchParms,
        parameters: [{
            name: 'roomId',
            in: 'path',
            description: 'Room id to be passed as path parameter so as to fetch Room.',
            required: true,
            type: 'integer',
            paramType: 'path',
            allowMultiple: false
        }]
     }
  };
  
  var saveEditedRoomDetail = {
    'spec': {
      description: 'Room operations',
      path: '/roomdetails/{roomId}',
      method: 'PUT',
      summary: 'Update Room.',
      notes: '',
      type: 'Room',
      nickname: 'saveEditedRoomDetail',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
          name: 'roomId',
          in: 'path',
          description: 'Room id to be passed as path parameter so as to fetch Room.',
          required: true,
          type: 'integer',
          paramType: 'path',
          allowMultiple: false
      }, {
          name: 'body',
          in: 'body',
          description: 'Room json.',
          required: true,
          type: 'Room',
          paramType: 'body',
          allowMultiple: false
      }]
    }
  };
  
  var confirmupdatescheduledetail = {
    'spec': {
      description: 'Room operations',
      path: '/scheduleeditroomdetails/{scheduleeditroomId}',
      method: 'PUT',
      summary: 'Update Room.',
      notes: '',
      type: 'Room',
      nickname: 'confirmupdatescheduledetail',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
          name: 'scheduleeditroomId',
          in: 'path',
          description: 'Room id to be passed as path parameter so as to fetch Room.',
          required: true,
          type: 'integer',
          paramType: 'path',
          allowMultiple: false
      }, {
          name: 'body',
          in: 'body',
          description: 'Room json.',
          required: true,
          type: 'Room',
          paramType: 'body',
          allowMultiple: false
      }]
    }
  };
  
  var getAllRoomsFilterByDate = {
    'spec': {
        description: 'Room operations',
        path: '/getRoomsFilterDate',
        method: 'GET',
        summary: 'Load Room.',
        notes: '',
        type: 'Room',
        nickname: 'getAllRoomsFilterByDate',
        produces: ['application/json'],
        params: searchParms,
        parameters: [{
            name: 'createdDateFilter',
            in: 'query',
            description: 'Created Date to be passed as query parameter so as to fetch Room.',
            required: true,
            type: 'integer',
            paramType: 'query',
            allowMultiple: false
        }]
     }
  };
  
  var getAllRoomAmenties = {
    'spec': {
        description: 'Room operations',
        path: '/space/room/amenity',
        method: 'GET',
        summary: 'Fetch all amenities.',
        notes: '',
        type: 'Amenity',
        nickname: 'getAllRoomAmenties',
        produces: ['application/json'],
        params: searchParms
     }
  };
  
  var getallroomsparticulertospace = {
    'spec': {
        description: 'Room operations',
        path: '/space/room/getroomsparticulertospace',
        method: 'GET',
        summary: 'Load Room for specific space.',
        notes: '',
        type: 'Room',
        nickname: 'getallroomsparticulertospace',
        produces: ['application/json'],
        params: searchParms,
        parameters: [{
            name: 'particulerroomsspaceId',
            in: 'query',
            description: 'Space id to be passed as query parameter so as to fetch Room.',
            required: true,
            type: 'integer',
            paramType: 'query',
            allowMultiple: false
        }]
     }
  };
  
  var cronaddrowtoschedule = {
    'spec': {
        description: 'Room operations',
        path: '/space/room/cronaddrowtoschedule',
        method: 'GET',
        summary: 'Api to create a schedule for 91st day.',
        notes: '',
        type: 'Room',
        nickname: 'cronaddrowtoschedule',
        produces: ['application/json'],
        params: searchParms
     }
  };
  
  var sendingcronscheddulefailuremailtoadmin = {
    'spec': {
        description: 'Room operations',
        path: '/space/room/sendingcronscheddulefailuremail',
        method: 'GET',
        summary: 'Sending cron schedule failure mail to admin.',
        notes: '',
        type: 'Room',
        nickname: 'sendingcronscheddulefailuremailtoadmin',
        produces: ['application/json'],
        params: searchParms
     }
  };
  
  var creatingScheduleThroughGenricApi = {
    'spec': {
        description: 'Room operations',
        path: '/space/room/genricApiToCreateScheduleToRooms',
        method: 'GET',
        summary: 'Api to create a schedule on database corruption.',
        notes: '',
        type: 'Room',
        nickname: 'sendingcronscheddulefailuremailtoadmin',
        produces: ['application/json'],
        params: searchParms
     }
  };
  
  var gettingroomtypename = {
    'spec': {
        description: 'Room operations',
        path: '/room/gettingroomtypename',
        method: 'GET',
        summary: 'Getting roomtype name.',
        notes: '',
        type: 'Room',
        nickname: 'gettingroomtypename',
        produces: ['application/json'],
        params: searchParms,
        parameters: [{
            name: 'roomTypeId',
            in: 'query',
            description: 'RoomType id to be passed as query parameter so as to fetch Room.',
            required: true,
            type: 'integer',
            paramType: 'query',
            allowMultiple: false
        }]
     }
  };
  
  var getAllRoomsSortByPrice = {
    'spec': {
        description: 'Room operations',
        path: '/getRoomsPriceSort',
        method: 'GET',
        summary: 'Fetch all rooms by price, in sorted order.',
        notes: '',
        type: 'Room',
        nickname: 'getAllRoomsSortByPrice',
        produces: ['application/json'],
        params: searchParms,
        parameters: [{
            name: 'selectedPrice',
            in: 'query',
            description: 'Price to be passed as query parameter so as to fetch Room.',
            required: true,
            type: 'integer',
            paramType: 'query',
            allowMultiple: false
        }, {
            name: 'rooms',
            in: 'query',
            description: 'Room id to be passed as query parameter so as to fetch Room.',
            required: true,
            type: 'integer',
            paramType: 'query',
            allowMultiple: false
        }]
     }
  };
  
  var getAllRoomsSortByRating = {
    'spec': {
        description: 'Room operations',
        path: '/getRoomsRatingSort',
        method: 'GET',
        summary: 'Fetch all rooms by rating, in sorted order.',
        notes: '',
        type: 'Room',
        nickname: 'getAllRoomsSortByPrice',
        produces: ['application/json'],
        params: searchParms,
        parameters: [{
            name: 'selectedRating',
            in: 'query',
            description: 'Rating to be passed as query parameter so as to fetch Room.',
            required: true,
            type: 'integer',
            paramType: 'query',
            allowMultiple: false
        }]
     }
  };
  
  var checkingForAdminLogin = {
    'spec': {
        description: 'Room operations',
        path: '/room/checkingadmin',
        method: 'GET',
        summary: 'Check for Admin login.',
        notes: '',
        type: 'Room',
        nickname: 'checkingForAdminLogin',
        produces: ['application/json'],
        params: searchParms
     }
  };
  
  var gettingAllRoomsAdmin = {
    'spec': {
        description: 'Room operations',
        path: '/room/admin/getAllRooms',
        method: 'GET',
        summary: 'Fetch all rooms.',
        notes: '',
        type: 'Room',
        nickname: 'gettingAllRoomsAdmin',
        produces: ['application/json'],
        params: searchParms
     }
  };
  
  var approveRoom = {
    'spec': {
        description: 'Room operations',
        path: '/room/admin/approveRoom',
        method: 'PUT',
        summary: 'Approve rooms.',
        notes: '',
        type: 'Room',
        nickname: 'approveRoom',
        produces: ['application/json'],
        params: searchParms,
        parameters: [{
            name: 'body',
            in: 'body',
            description: 'Room json.',
            required: true,
            type: 'Room',
            paramType: 'body',
            allowMultiple: false
        }]
     }
  };
  
  var rejectRoom = {
    'spec': {
        description: 'Room operations',
        path: '/room/admin/rejectRoom',
        method: 'PUT',
        summary: 'Approve rooms.',
        notes: '',
        type: 'Room',
        nickname: 'rejectRoom',
        produces: ['application/json'],
        params: searchParms,
        parameters: [{
            name: 'body',
            in: 'body',
            description: 'Room json.',
            required: true,
            type: 'Room',
            paramType: 'body',
            allowMultiple: false
        }]
     }
  };
  
  var sendToAdminApproval = {
    'spec': {
        description: 'Room operations',
        path: '/room/admin/sendToAdminApproval',
        method: 'PUT',
        summary: 'Send to Admin for approval.',
        notes: '',
        type: 'Room',
        nickname: 'sendToAdminApproval',
        produces: ['application/json'],
        params: searchParms,
        parameters: [{
            name: 'body',
            in: 'body',
            description: 'Room json.',
            required: true,
            type: 'Room',
            paramType: 'body',
            allowMultiple: false
        }]
     }
  };
  
  var publishRoom = {
    'spec': {
        description: 'Room operations',
        path: '/room/admin/publishRoom',
        method: 'POST',
        summary: 'Publish Room.',
        notes: '',
        type: 'Room',
        nickname: 'publishRoom',
        produces: ['application/json'],
        params: searchParms,
        parameters: [{
            name: 'body',
            in: 'body',
            description: 'Room json.',
            required: true,
            type: 'Room',
            paramType: 'body',
            allowMultiple: false
        }]
     }
  };
  
  var activateRoom = {
    'spec': {
        description: 'Room operations',
        path: '/room/admin/activateRoom',
        method: 'POST',
        summary: 'Activate Room.',
        notes: '',
        type: 'Room',
        nickname: 'activateRoom',
        produces: ['application/json'],
        params: searchParms,
        parameters: [{
            name: 'body',
            in: 'body',
            description: 'Room json.',
            required: true,
            type: 'Room',
            paramType: 'body',
            allowMultiple: false
        }]
     }
  };
  
  var approvingSpaceByAdmin = {
    'spec': {
        description: 'Room operations',
        path: '/admin/space/approval',
        method: 'PUT',
        summary: 'Admin space approval.',
        notes: '',
        type: 'Room',
        nickname: 'approvingSpaceByAdmin',
        produces: ['application/json'],
        params: searchParms,
        parameters: [{
            name: 'body',
            in: 'body',
            description: 'Room json.',
            required: true,
            type: 'Room',
            paramType: 'body',
            allowMultiple: false
        }]
     }
  };
  
  var getAllRoomsForAdminLogin = {
    'spec': {
        description: 'Room operations',
        path: '/adminLogin/getAllRooms',
        method: 'GET',
        summary: 'Fetch all rooms for admin login.',
        notes: '',
        type: 'Room',
        nickname: 'getAllRoomsForAdminLogin',
        produces: ['application/json'],
        params: searchParms
     }
  };
  
  var getAllRoomsForAdminLoginByRoomTypeFilter = {
    'spec': {
        description: 'Room operations',
        path: '/adminLogin/roomTypeFilter/getRooms',
        method: 'GET',
        summary: 'Fetch all rooms for admin login by RoomType filter.',
        notes: '',
        type: 'Room',
        nickname: 'getAllRoomsForAdminLoginByRoomTypeFilter',
        produces: ['application/json'],
        params: searchParms,
        parameters: [{
            name: 'roomtype',
            in: 'query',
            description: 'RoomType id to be passed as query parameter so as to fetch Room.',
            required: true,
            type: 'integer',
            paramType: 'query',
            allowMultiple: false
        }] 
     }
  };
  
  var creatingScheduleThroughApiForMissingSchedule = {
    'spec': {
        description: 'Room operations',
        path: '/space/room/genricApiToCreateScheduleForMissingSchedule',
        method: 'GET',
        summary: 'Api to create schedule for missing days.',
        notes: '',
        type: 'Room',
        nickname: 'creatingScheduleThroughApiForMissingSchedule',
        produces: ['application/json'],
        params: searchParms
     }
  };
  
  var loadRoomBasedOnStatus = {
    'spec': {
        description: 'Room operations',
        path: '/room/roomType/status',
        method: 'GET',
        summary: 'Fetch all rooms for admin login by RoomType filter.',
        notes: '',
        type: 'Room',
        nickname: 'loadRoomBasedOnStatus',
        produces: ['application/json'],
        params: searchParms,
        parameters: [{
            name: 'status',
            in: 'query',
            description: 'Status to be passed as query parameter so as to fetch Room.',
            required: true,
            type: 'integer',
            paramType: 'query',
		    allowMultiple: false
        }] 
     }
  };
  

  swagger.addGet(fetchRoomsBasedOnRoomType).addGet(loadRoomBasedOnRoomType).addGet(loadRoomTypeSchedule).addGet(loadroomtypes).addGet(singleRoomDetail)
  	.addGet(getAllRoomsFilterByDate).addGet(getAllRoomAmenties).addGet(getallroomsparticulertospace).addGet(cronaddrowtoschedule).addGet(sendingcronscheddulefailuremailtoadmin)
  	.addGet(creatingScheduleThroughGenricApi).addGet(gettingroomtypename).addGet(getAllRoomsSortByPrice).addGet(getAllRoomsSortByRating)
  	.addGet(checkingForAdminLogin).addGet(gettingAllRoomsAdmin).addGet(getAllRoomsForAdminLogin).addGet(getAllRoomsForAdminLoginByRoomTypeFilter)
  	.addGet(creatingScheduleThroughApiForMissingSchedule).addGet(loadRoomBasedOnStatus)
  	.addPost(addroomtype).addPost(createroom).addDelete(deactivateroom).addPut(saveEditedRoomDetail).addPut(confirmupdatescheduledetail).addPut(approveRoom)
  	.addPut(rejectRoom).addPut(sendToAdminApproval).addPost(publishRoom).addPost(activateRoom).addPut(approvingSpaceByAdmin);

};
