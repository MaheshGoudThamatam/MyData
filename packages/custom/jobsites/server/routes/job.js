'use strict';

var hasAuthorization = function (req, res, next) {
    if (!req.user.isAdmin && !req.Job.user._id.equals(req.user._id)) {
        return res.status(401).send('User is not authorized');
    }
    next();
};

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Job, app, auth, database) {

  var jobCtrl = require('../controllers/job')(Job);
	
  app.route('/api/admin/job')
  	.post(jobCtrl.create)
    .get(jobCtrl.all);

  app.route('/api/admin/job/:jobId')
  	.get(jobCtrl.show)
  	.put(jobCtrl.update)
  	.delete(jobCtrl.destroy);
  
  app.param('jobId', jobCtrl.job);
  
};
