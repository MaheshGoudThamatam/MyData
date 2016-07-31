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

  var bookingTrainingCtrl = require('../controllers/booking_training_room')(Booking);
  
  	app.route('/api/training/loadPartnerBooking/booking')
  		.get(bookingTrainingCtrl.loadPartnerBookings);
  
  	app.route('/api/booking/training')
  		.get(bookingTrainingCtrl.all)
  		.post(bookingTrainingCtrl.create);
    
    app.route('/api/:scheduleId/booking/:bookingId')
    	.get(bookingTrainingCtrl.show)
    	.put(bookingTrainingCtrl.update)
    	.delete(bookingTrainingCtrl.destroy);
   
    app.route('/api/loadSchedule/training')
    	.get(bookingTrainingCtrl.loadSchedule);
    
    app.route('/api/back-office/booking/training')
		.post(bookingTrainingCtrl.createBookingByBackOffice);
    
    app.route('/api/training/booking/:trainingRoomId/back-office/:backOfficeId')
		.get(bookingTrainingCtrl.loadTrainingRoomBookingByBackOffice);
    
    
   app.param('bookingId', bookingTrainingCtrl.booking);
   app.param('scheduleId', bookingTrainingCtrl.schedule);
   app.param('trainingRoomId', bookingTrainingCtrl.room);
   app.param('backOfficeId', bookingTrainingCtrl.user);
 
};
