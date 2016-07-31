/*(function () {
  'use strict';

  /* jshint -W098 */
  // The Package is past automatically as first parameter
  /*module.exports = function (Rooms, app, auth, database) {*/
    // User routes use room controller
    /*var rooms = require('../controllers/rooms')(Rooms);*/
  //  app.get('/api/rooms', auth.requiresAdmin, rooms.list); 
    // get a room information
   // app.get('/api/room/:id', auth.requiresAdmin, rooms.get);   
    // add a new room to database
    //app.post('/api/room/add', auth.requiresLogin, rooms.add);
  //  app.post('/api/room/add', auth.requiresAdmin, rooms.add);
    // update a partnet infomation
   // app.put('/api/room/:id/update', auth.requiresAdmin, rooms.update);
    // delete a room
   // app.delete('/api/room/:id/delete', auth.requiresAdmin, rooms.delete);

   /* app.post('/api/roomtypes/create', rooms.addroomtype);
    app.get('/api/addroom/loadroomtypes', rooms.loadroomtypes);

    app.post('/api/roomdetails', rooms.createroom);


    
  };
})();*/



'use strict';

  /* jshint -W098 */
  // The Package is past automatically as first parameter
module.exports = function (Rooms, app, auth, database) {

  var roomCtrl = require('../controllers/rooms')(Rooms);
  
  app.route('/api/room/loadroomsBasedOnRoomType')
  .get(roomCtrl.fetchRoomsBasedOnRoomType);
  
  app.route('/api/room/roomType')
  .get(roomCtrl.loadRoomBasedOnRoomType);
  
  app.route('/api/roomtypes/create').post(roomCtrl.addroomtype);
  app.route('/api/addroom/loadroomtypes').get(roomCtrl.loadroomtypes);

  app.route('/api/roomdetails')
     .post(roomCtrl.createroom)
     .get(roomCtrl.getAllRooms);

 app.route('/api/roomdetails/:roomId')
    .delete(roomCtrl.deactivateroom)
    .get(roomCtrl.singleRoomDetail)
    .put(roomCtrl.saveEditedRoomDetail);

 app.route('/api/scheduleeditroomdetails/:scheduleeditroomId')
    .put(roomCtrl.confirmupdatescheduledetail);
   
 
 app.route('/api/getRoomsFilterDate')
 .get(roomCtrl.getAllRoomsFilterByDate);
 

 app.route('/api/space/room/amenity')
     .get(roomCtrl.getAllRoomAmenties);

 app.route('/api/space/room/getroomsparticulertospace')
     .get(roomCtrl.getallroomsparticulertospace);   

  app.route('/api/space/room/cronaddrowtoschedule')
     .get(roomCtrl.cronaddrowtoschedule);  
     
  app.route('/api/space/room/sendingcronscheddulefailuremail')
     .get(roomCtrl.sendingcronscheddulefailuremailtoadmin); 


  app.route('/api/space/room/genricApiToCreateScheduleToRooms')
     .get(roomCtrl.creatingScheduleThroughGenricApi);
  
  app.route('/api/room/gettingroomtypename')
     .get(roomCtrl.gettingroomtypename); 
  
  app.route('/api/getRoomsPriceSort')
  .get(roomCtrl.getAllRoomsSortByPrice);
  
  app.route('/api/getRoomsRatingSort')
  .get(roomCtrl.getAllRoomsSortByRating);

 app.route('/api/room/checkingadmin')
     .get(roomCtrl.checkingForAdminLogin);   

 app.route('/api/room/admin/getAllRooms')
     .get(roomCtrl.gettingAllRoomsAdmin); 

 app.route('/api/room/admin/approveRoom')
     .put(roomCtrl.approveRoom); 

app.route('/api/room/admin/rejectRoom')
     .put(roomCtrl.rejectRoom); 

 app.route('/api/room/admin/sendToAdminApproval')
     .put(roomCtrl.sendToAdminApproval);     

  app.route('/api/room/admin/publishRoom')
     .post(roomCtrl.publishRoom); 

   app.route('/api/room/activateRoom')
     .post(roomCtrl.activateRoom);  
   
   
  app.param('roomId', roomCtrl.room);
  app.param('scheduleeditroomId', roomCtrl.room);
  
  app.route('/api/room/roomType/status')
  .get(roomCtrl.loadRoomBasedOnStatus);
 };