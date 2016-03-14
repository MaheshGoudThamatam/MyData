'use strict';
// Article authorization helpers
var hasAuthorization = function (req, res, next) {
    if (!req.user.isAdmin && !req.Holiday.user._id.equals(req.user._id)) {
        return res.status(401).send('User is not authorized');
    }
    next();
};

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Holiday, app, auth, database) {

  var holidayCtrl = require('../controllers/holiday')(holidayCtrl);
  app.route('/api/holiday/pagination')
  .get(auth.requiresLogin, hasAuthorization,holidayCtrl.holidayListByPagination);
	
  app.route('/api/holiday')
  	.post(auth.requiresLogin, hasAuthorization,holidayCtrl.create)
    .get(auth.requiresLogin, hasAuthorization,holidayCtrl.all);

  app.route('/api/holiday/:holidayId')
  	.get(auth.requiresLogin, hasAuthorization,holidayCtrl.show)
  	.put(auth.requiresLogin, hasAuthorization,holidayCtrl.update)
  	.delete(auth.requiresLogin, hasAuthorization,holidayCtrl.destroy);

  app.param('holidayId', holidayCtrl.holiday);
  
};
