'use strict';

var hasAuthorization = function (req, res, next) {
    if (!req.user.isAdmin && !req.CourseMode.user._id.equals(req.user._id)) {
        return res.status(401).send('User is not authorized');
    }
    next();
};

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(CourseMode, app, auth, database) {

  var courseModeCtrl = require('../controllers/course_mode')(CourseMode);
	
  app.route('/api/courseMode')
  	.post(courseModeCtrl.create)
    .get(courseModeCtrl.all);

  app.route('/api/courseMode/:courseModeId')
  	.get(courseModeCtrl.show)
  	.put(courseModeCtrl.update)
  	.delete(courseModeCtrl.destroy);
  
  app.param('courseModeId', courseModeCtrl.courseMode);
  
};
