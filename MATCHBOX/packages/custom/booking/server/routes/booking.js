'use strict';

var hasAuthorization = function(req, res, next) {
	if (!req.user.isAdmin && !req.booking.user._id.equals(req.user._id)) {
		return res.status(401).send('User is not authorized');
	}
	next();
};

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Booking, app, auth, database) {

	var bookingCtrl = require('../controllers/booking')(Booking);

	app.route('/api/booking/loadUserBookingMobile')
	.get(bookingCtrl.loadRequiredUserMobile); 
	
	app.route('/api/booking/bookedRoom')
	   .get(bookingCtrl.bookedSchedule);
	
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

    app.route('/api/dashboardBookings')
        .get(bookingCtrl.dashboardBookings);

	app.route('/api/:scheduleId/booking')
		.post(bookingCtrl.create);
	
	app.route('/api/android/:scheduleId/booking')
		.post(bookingCtrl.createAndroid);

	app.route('/api/:scheduleId/booking/:bookingId')
		.get(bookingCtrl.show)
		.put(bookingCtrl.update)
		.delete(bookingCtrl.destroy);
	
	app.route('/api/android/:scheduleId/booking/:bookingId')
		.get(bookingCtrl.show)
		.put(bookingCtrl.update)
		.delete(bookingCtrl.destroy);

	app.route('/api/loadSchedule')
		.get(bookingCtrl.loadSchedule);

	app.route('/api/:scheduleId/booking/backoffice')
		.post(bookingCtrl.backOfficeBookingCreate);

	app.route('/api/booking/notifyReviews/:userId')
		.get(bookingCtrl.notifyUserReviews);
		app.route('/api/booking/admin/cancel-booking')
		.post(bookingCtrl.cancelBooking);
		
		app.route('/api/cancelRetry')
		.post(bookingCtrl.cancelBookingRetry);
		app.route('/api/bookingFailure')
        .get(bookingCtrl.bookingFailure);
		
		app.route('/api/retryPayment')
        .get(bookingCtrl.retryPayment);

    app.route('/api/cancelBooking/loadreasonforcancel')
        .post(bookingCtrl.addCancelBookingReasons)
		.get(bookingCtrl.loadReasonForCancelBooking);

	app.route('/api/cancelBooking/loadReasonAdminCancel')
        .post(bookingCtrl.addAdminCancelBookingReason)
		.get(bookingCtrl.loadAdminReasonForCancelBooking);

	app.param('bookingId', bookingCtrl.booking);
	app.param('scheduleId', bookingCtrl.schedule);
	app.param('userId', bookingCtrl.user);

};