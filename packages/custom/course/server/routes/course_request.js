'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(CourseRequest, app, auth, database) {

	var courseRequest = require('../controllers/course_request')
			(CourseRequest);

	app.route('/api/course/:courseId/courseRequest')
		.post(courseRequest.create)
		.get(courseRequest.loadPaymentScheme);
		
	app.route('/api/courserequest/:courserequestId')
	  	.get( courseRequest.show)
	  	.put( courseRequest.update)
	  	.delete( courseRequest.destroy);
	app.route('/api/courseRequest')	
		.get(courseRequest.all);
	
	app.route('/api/adminListCourseRequest/pagination')	
	.get(courseRequest.adminListCourseRequestPagination);
	
	app.route('/api/course/:courseId/branch/:branchId/paymentRequest')
       .get(courseRequest.paymentSchema);
    app.route('/api/loadCourseRequestsBasedonUser')
        .get( courseRequest.loadCourseRequestsBasedonUser);
    
    app.route('/api/batch/branch/:branchId/course/:courseId')
    	.get( courseRequest.loadBatchesSpecificToBranch);

     app.route('/api/courseRequestList/pagination')
    	.get( courseRequest.fetchingallcourserequestlist); 	
	
	app.param('courseId', courseRequest.course);
	app.param('userId', courseRequest.user);
	app.param('courserequestId', courseRequest.courserequest);
	app.param('branchId', courseRequest.branch);


};
