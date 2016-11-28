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

  var bookingHotDeskCtrl = require('../controllers/booking_hot_desk')(Booking);
  
  	app.route('/api/hot-desk/loadPartnerBooking/booking')
  		.get(bookingHotDeskCtrl.loadPartnerBookings);
  
  	app.route('/api/booking/hot-desk')
  		.get(bookingHotDeskCtrl.all)
  		.post(bookingHotDeskCtrl.create);
    
    app.route('/api/:scheduleId/booking/:bookingId')
    	.get(bookingHotDeskCtrl.show)
    	.put(bookingHotDeskCtrl.update)
    	.delete(bookingHotDeskCtrl.destroy);
   
   app.route('/api/loadSchedule/hot-desk')
   		.get(bookingHotDeskCtrl.loadSchedule);
    
   app.route('/api/booking/admin/hot-desk/cancel-booking')
   		.post(bookingHotDeskCtrl.cancelBooking);
   
   app.route('/api/back-office/booking/hot-desk')
		.post(bookingHotDeskCtrl.createBookingByBackOffice);
    
   app.param('bookingId', bookingHotDeskCtrl.booking);
   app.param('scheduleId', bookingHotDeskCtrl.schedule);
 
};
