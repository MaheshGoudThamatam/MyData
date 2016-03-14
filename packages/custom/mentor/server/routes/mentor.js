'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Mentor, app, auth, database) {

	var mentor = require('../controllers/mentor')(Mentor);
	    
	// APIS
	app.route('/api/mentorApply/Resume')
    	.post(auth.requiresLogin,mentor.uploadTaskImage);
	 
    //app.param('mentorRequestId', mentor.mentorRequest);
    app.route('/api/mentorRequestStatus')
  		.get(auth.requiresLogin,mentor.mentorRequest);
    
    app.route('/api/update/user/:userId/isMentor')
		.get(auth.requiresLogin,mentor.updateForMentorIfAlreadyLoggedIn);
    

  	app.param('userId', mentor.user);
};
