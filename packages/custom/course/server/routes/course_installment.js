'use strict';

var hasAuthorization = function (req, res, next) {
    if (!req.user.isAdmin && !req.CourseInstallment.user._id.equals(req.user._id)) {
        return res.status(401).send('User is not authorized');
    }
    next();
};

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(CourseInstallment, app, auth, database) {

  var courseInstallmentCtrl = require('../controllers/course_installment')(CourseInstallment);
	
  app.route('/api/courseInstallment')
  	.post(courseInstallmentCtrl.create)
    .get(courseInstallmentCtrl.all);

  app.route('/api/courseInstallment/:courseInstallmentId')
  	.get(courseInstallmentCtrl.show)
  	.put(courseInstallmentCtrl.update)
  	.delete(courseInstallmentCtrl.destroy);
  
  app.param('courseInstallmentId', courseInstallmentCtrl.courseInstallment);
  
};
