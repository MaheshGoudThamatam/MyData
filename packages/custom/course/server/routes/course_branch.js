'use strict';

var hasAuthorization = function(req, res, next) {
	if (!req.user.isAdmin && !req.Course.user._id.equals(req.user._id)) {
		return res.status(401).send('User is not authorized');
	}
	next();
};

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(CourseBranch, app, auth, database) {

	var courseBranchCtrl = require('../controllers/course_branch')(CourseBranch);
	
	app.route('/api/course/:courseId/payment-scheme/branch/:branchId')
		.put(courseBranchCtrl.assignCourseToBranch)
		.get(courseBranchCtrl.removeCourseFromBranch);
	
	app.route('/api/country/:countryId/payment-scheme/course/:courseId')
		.put(courseBranchCtrl.assignCourseToBranch)
		.get(courseBranchCtrl.removeCourseFromBranch);
	
	app.route('/api/course/country/:countryId')
		.get(auth.requiresLogin,hasAuthorization,courseBranchCtrl.loadCountry);
	
	app.route('/api/course/branch/:branchId')
		.get(auth.requiresLogin,hasAuthorization,courseBranchCtrl.loadAvailableCoursesForBranch);
	
	app.route('/api/payment-scheme/course/:courseId')
		.get(auth.requiresLogin,hasAuthorization,courseBranchCtrl.loadPaymentSchemes);

	app.route('/api/:courseId/payment-scheme')
		.get(auth.requiresLogin,hasAuthorization,courseBranchCtrl.showPaymentSchemes);
	
	app.route('/api/branch/:branchId/course/:courseId/payment-scheme')
		.get(courseBranchCtrl.loadCoursePaymentSchemesForBranch);

	app.param('branchId', courseBranchCtrl.branch);
	app.param('courseId', courseBranchCtrl.course);
	app.param('countryId', courseBranchCtrl.country);
};
