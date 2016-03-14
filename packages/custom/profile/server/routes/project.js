'use strict';

var hasAuthorization = function (req, res, next) {
    if (!req.user.isAdmin && !req.ProjectCtrl.user._id.equals(req.user._id)) {
        return res.status(401).send('User is not authorized');
    }
    next();
};

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(ProjectCtrl, app, auth, database) {

  var projectCtrl = require('../controller/project')(ProjectCtrl);
	
  app.route('/api/project')
  	.post(auth.requiresLogin, hasAuthorization,projectCtrl.create)
    .get(auth.requiresLogin, hasAuthorization,projectCtrl.all);

  app.route('/api/project/:projectId')
  	.get(auth.requiresLogin, hasAuthorization,projectCtrl.show)
  	.put(auth.requiresLogin, hasAuthorization,projectCtrl.update)
  	.delete(auth.requiresLogin, hasAuthorization,projectCtrl.destroy);
  app.route('/api/project/projectPicture')
  .post(auth.requiresLogin, hasAuthorization,projectCtrl.uploadProjectPic);
  
  app.param('projectId', projectCtrl.project);
  
};



