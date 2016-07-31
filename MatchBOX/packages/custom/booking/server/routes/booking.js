'use strict';

var hasAuthorization = function (req, res, next) {
    if (!req.user.isAdmin && !req.booking.user._id.equals(req.user._id)) {
        return res.status(401).send('User is not authorized');
    }
    next();
};

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Booking, app, auth, database) {

  var bookingCtrl = require('../controllers/booking')(Booking);
  
  app.route('/api/booking/loadRequiredRoomType')
  .get(bookingCtrl.loadRequiredRoomType);
  
  app.route('/api/booking/loadRequiredUser')
  .get(bookingCtrl.loadRequiredUser);
  
     app.route('/api/schedule/isclosed')
     .get(bookingCtrl.loadClosedSchedule);
  
     app.route('/api/booking/loadBookedSchedule')
  	 .get(bookingCtrl.loadBookedSchedules);
     
    app.route('/api/booking/loadPartnerBooking')
  	.get(bookingCtrl.loadPartnerBookings);
  	
  	app.route('/api/booking/loadUserBooking')
  	.get(bookingCtrl.loadUserBookings);
  	
  	app.route('/api/booking')
    .get(bookingCtrl.all);
  	
    app.route('/api/booking/:bookingId')
   .get(bookingCtrl.show)
   .put(bookingCtrl.update)
   .delete(bookingCtrl.destroy);
    
     app.route('/api/:scheduleId/booking')
    .post(bookingCtrl.create);
    
    app.route('/api/:scheduleId/booking/:bookingId')
    .get(bookingCtrl.show)
    .put(bookingCtrl.update)
    .delete(bookingCtrl.destroy);
    
     app.route('/api/loadSchedule')
    .get(bookingCtrl.loadSchedule);
     
   
     
    
     
     app.route('/api/:scheduleId/booking/backoffice')
     .post(bookingCtrl.backOfficeBookingCreate);
     
     
     
  app.param('bookingId', bookingCtrl.booking);
   app.param('scheduleId', bookingCtrl.schedule);
 
};
