'use strict';

/* JSHint -W098 */

// This Package is passed automatically as first parameter

module.exports = function(AdminCourseCtrl, app, auth, database) {

	var admincourse = require('../controllers/admin_course_request')(AdminCourseCtrl);

	app.route('/api/studentCourse')
	   .post(admincourse.create)
	   .get(admincourse.all);
	   
	app.route('/api/studentCourse/:studentCourseId')
		.get(admincourse.show)
		.delete(admincourse.destroy);   
	//Pagination API
	app.route('/api/listPaginationStudentCourses/pagination')
	   .get(admincourse.listPaginationStudentCourses);
	
	app.route('/api/loadCourseRequest/courseRequest/:courseRequestId')
	   .get(admincourse.loadCourseRequestDetails);
	
	app.route('/api/confirm/adminCourseRequest/:courseRequestId')
	   .put(admincourse.confirmUserAsCourseRequest);

	app.route('/api/loadCoursesonUsers')
        .get( admincourse.loadCoursesBasedonUser);
	
	/*app.route('/api/studentConfirmed/email')
	   .get(admincourse.emailTriggerConfirmation);*/
	
	app.param('courseRequestId', admincourse.courseRequest);
	app.param('studentCourseId', admincourse.studentCourse);
	
		};
