
'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(AdminMentor, app, auth, database) {

	var adminMentor = require('../controllers/adminMentor')(AdminMentor);

	//Pagination API
	app.route('/api/mentor-request/pagination')
		.get(adminMentor.mentorRequestListByPagination);

	app.route('/api/confirm/mentor-request/:mentorRequestId')
		.put(adminMentor.confirmUserAsMentor);
	
	app.route('/api/assign/mentor/test/:mentorRequestId')
 		.put(adminMentor.assignTest);
	
	app.route('/api/mentorRequest/:mentorRequestId')
	 	.get(adminMentor.showMentorRequest);
		
	app.param('mentorRequestId', adminMentor.mentorRequest);

};
