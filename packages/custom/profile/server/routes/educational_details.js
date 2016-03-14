'use strict';

var hasAuthorization = function (req, res, next) {
    if (!req.user.isAdmin && !req.EducationalDetail.user._id.equals(req.user._id)) {
        return res.status(401).send('User is not authorized');
    }
    next();
};

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(EducationalDetail, app, auth, database) {

  var educationalDetailCtrl = require('../controller/educational_details')(EducationalDetail);
	
  app.route('/api/educationaldetails')
  	.post(auth.requiresLogin, hasAuthorization,educationalDetailCtrl.create)
    .get(auth.requiresLogin, hasAuthorization,educationalDetailCtrl.all);

  app.route('/api/educationaldetails/:educationaldetailId')
  	.get(auth.requiresLogin, hasAuthorization,educationalDetailCtrl.show)
  	.put(auth.requiresLogin, hasAuthorization,educationalDetailCtrl.update)
  	.delete(auth.requiresLogin, hasAuthorization,educationalDetailCtrl.destroy);
  
  app.param('educationaldetailId', educationalDetailCtrl.educationalDetail);
  
};



