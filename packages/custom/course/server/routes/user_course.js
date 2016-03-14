'use strict';

var hasAuthorization = function (req, res, next) {
    if (!req.user.isAdmin && !req.UserCourse.user._id.equals(req.user._id)) {
        return res.status(401).send('User is not authorized');
    }
    next();
};

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(UserCourse, app, auth, database) {

  var userCourseCtrl = require('../controllers/user_course')(UserCourse);
	
  app.route('/api/usercourse')
  	.post(userCourseCtrl.create)
    .get(userCourseCtrl.all);

  app.route('/api/usercourse/:usercourseId')
  	.get(auth.requiresLogin, hasAuthorization,userCourseCtrl.show)
  	.put(auth.requiresLogin, hasAuthorization,userCourseCtrl.update)
  	.delete(auth.requiresLogin, hasAuthorization,userCourseCtrl.destroy);
  
  app.param('usercourseId', userCourseCtrl.userCourse);
  
};

