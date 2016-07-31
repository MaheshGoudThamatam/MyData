'use strict';

  /* jshint -W098 */
  // The Package is past automatically as first parameter
module.exports = function (Result, app, auth, database) {

  var resultCtrl = require('../controllers/result')(Result);
  
  

  app.route('/api/roomresult')
     .get(resultCtrl.getAllRoomResult);

  
 /* app.route('/api/roomList/pagination')
  .get(resultCtrl.pagination);*/
 
    
  app.param('roomsId', resultCtrl.room);
  
  
 };