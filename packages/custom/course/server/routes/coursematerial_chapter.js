'use strict';

var hasAuthorization = function (req, res, next) {
    if (!req.user.isAdmin && !req.Course.user._id.equals(req.user._id)) {
        return res.status(401).send('User is not authorized');
    }
    next();
};

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(CoursematerialchapterCtrl, app, auth, database) {

	 var CoursematerialchapterCtrl = require('../controllers/coursematerial_chapter')(CoursematerialchapterCtrl);
	 
	  app.route('/api/materials')
	  	.post(CoursematerialchapterCtrl.create)
	    .get(CoursematerialchapterCtrl.all);

	  app.route('/api/materials/:materialId')
	  	.get(CoursematerialchapterCtrl.show)
	  	.put(CoursematerialchapterCtrl.update)
	  	.delete(CoursematerialchapterCtrl.destroy);

	  app.route('/api/material/Subtopic')
      .get(CoursematerialchapterCtrl.subTopic);

      app.route('/api/material/Subtopic/:subTopicId')
      .get(CoursematerialchapterCtrl.findOneSubTopic)
      .put(CoursematerialchapterCtrl.update)
      .delete(CoursematerialchapterCtrl.destroy);

      app.route('/api/material/list')
      .get(CoursematerialchapterCtrl.materialList);

      app.route('/api/material/:materialTitleId')
      .get(CoursematerialchapterCtrl.materialfindOne)
      .put(CoursematerialchapterCtrl.update)
      .delete(CoursematerialchapterCtrl.destroy);
	  
	 app.param('materialId', CoursematerialchapterCtrl.materials);
	 app.param('materialTitleId', CoursematerialchapterCtrl.materialTitle);
	 app.param('subTopicId', CoursematerialchapterCtrl.subTopicDetails);
	 app.param('courseId', CoursematerialchapterCtrl.course);
};
