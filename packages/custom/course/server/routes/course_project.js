'use strict';
// Article authorization helpers
var hasAuthorization = function (req, res, next) {
    if (!req.user.isAdmin && !req.Courseproject.user._id.equals(req.user._id)) {
        return res.status(401).send('User is not authorized');
    }
    next();
};


/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(CourseprojectCtrl, app, auth, database) {

	 var courseprojectCtrl = require('../controllers/course_project')(CourseprojectCtrl);
	 
	// Pagination API
	  app.route('/api/courseproject/pagination')
	      .get(courseprojectCtrl.courseprojectListByPagination);
	  
	  app.route('/api/courseproject')
	  	.post(auth.requiresLogin, hasAuthorization,courseprojectCtrl.create)
	    .get(auth.requiresLogin, hasAuthorization,courseprojectCtrl.all);

	  app.route('/api/courseproject/:courseprojectId')
	  	.get(auth.requiresLogin, hasAuthorization,courseprojectCtrl.show)
	  	.put(auth.requiresLogin, hasAuthorization,courseprojectCtrl.update)
	  	.delete(auth.requiresLogin, hasAuthorization,courseprojectCtrl.destroy);	  
	  
	  app.param('courseprojectId', courseprojectCtrl.courseproject);

};
