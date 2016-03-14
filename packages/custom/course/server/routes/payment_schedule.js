'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(PaymentscheduleCtrl, app, auth, database) {

	 var PaymentscheduleCtrl = require('../controllers/payment_schedule')(PaymentscheduleCtrl);

	  app.route('/api/course/:courseId/paymentschedule/student/:studentId')
	  	.get(PaymentscheduleCtrl.selectPaymentschedule);
	  
	  app.route('/api/paymentSchedule/:paymentScheduleId/installment')
	  	.put(PaymentscheduleCtrl.payNow);
	  
	  
	  app.route('/api/student/:studentId/paymentschedule/course/:courseId')
	  .get(PaymentscheduleCtrl.loadPaymentSchedule);
	    
	 app.param('courseId', PaymentscheduleCtrl.course);
	  app.param('studentId', PaymentscheduleCtrl.student);
	  app.param('paymentScheduleId', PaymentscheduleCtrl.paymentSchedule);
};
