'use strict';

var hasAuthorization = function (req, res, next) {
    if (!req.user.isAdmin && !req.Course.user._id.equals(req.user._id)) {
        return res.status(401).send('User is not authorized');
    }
    next();
};

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(JobSite, app, auth, database) {

  var jobSiteCtrl = require('../controllers/jobsites')(JobSite);
	
  app.route('/api/admin/jobsites')
  	.post(jobSiteCtrl.create)
    .get(jobSiteCtrl.all);

  app.route('/api/admin/jobsites/:jobSitesId')
  	.get(jobSiteCtrl.show)
  	.put(jobSiteCtrl.update)
  	.delete(jobSiteCtrl.destroy);
  
  app.param('jobSitesId', jobSiteCtrl.jobSite);
  
};
