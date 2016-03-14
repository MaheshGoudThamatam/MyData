'use strict';

var hasAuthorization = function (req, res, next) {
    if (!req.user.isAdmin && !req.Course.user._id.equals(req.user._id)) {
        return res.status(401).send('User is not authorized');
    }
    next();
};

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Course, app, auth, database) {

  var courseCtrl = require('../controllers/course')(Course);
  
  app.route('/api/course')
    .post(courseCtrl.create)
    .get(auth.requiresLogin, hasAuthorization, courseCtrl.all);

  app.route('/api/course/:courseId')
    .get(courseCtrl.show)
    .put(auth.requiresLogin, hasAuthorization,courseCtrl.update)
    .delete(auth.requiresLogin, hasAuthorization,courseCtrl.destroy);

  app.route('/api/courseList/pagination')
      .get(courseCtrl.loadCoursePagination);

  app.route('/api/courseimage/banner')
      .post(auth.requiresLogin, hasAuthorization,courseCtrl.uploadCourseBanner);
  app.route('/api/courseimage/icon')
      .post(auth.requiresLogin, hasAuthorization,courseCtrl.uploadCourseIcon);
  
  app.param('courseId', courseCtrl.course);
  
};