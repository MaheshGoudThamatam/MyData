'use strict';

var hasAuthorization = function (req, res, next) {
    if (!req.user.isAdmin && !req.MentorprojectCtrl.user._id.equals(req.user._id)) {
        return res.status(401).send('User is not authorized');
    }
    next();
};
/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(MentorprojectCtrl, app, auth, database) {
	var mentorprojectctrl = require('../controllers/mentorproject')(MentorprojectCtrl);
		app.route('/api/mentorproject')
			.post(mentorprojectctrl.create)
			.get(mentorprojectctrl.all);
		app.route('/api/mentorproject/:mentorprojectId')
	  		.get(auth.requiresLogin, hasAuthorization,mentorprojectctrl.show)
	  		.put(auth.requiresLogin, hasAuthorization,mentorprojectctrl.update)
	  		.delete(auth.requiresLogin, hasAuthorization,mentorprojectctrl.destroy);
		
	 	app.route('/api/mentorproject/taskImage')
  			.post(auth.requiresLogin, hasAuthorization,mentorprojectctrl.uploadTaskImage);
	 	
  		app.route('/api/mentor-project/pagination')
			.get(mentorprojectctrl.loadMentorProjectDetails);
  		
  		app.route('/api/mentor/project/:mentorProjectId')
  			.put(mentorprojectctrl.updateMentorRequestStatus);
  		
  		app.route('/api/mentor-decline/project/:mentorProjectId')
			.put(mentorprojectctrl.updateMentorRequestStatusDecline);

	  	app.param('mentorprojectId', mentorprojectctrl.mentorproject);
	  	app.param('mentorProjectId', mentorprojectctrl.project);
};
