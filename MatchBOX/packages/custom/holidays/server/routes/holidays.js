'use strict';

var hasAuthorization = function (req, res, next) {
    if (!req.user.isAdmin && !req.holiday.user._id.equals(req.user._id)) {
        return res.status(401).send('User is not authorized');
    }
    next();
};

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Holiday, app, auth, database) {

  var holidayCtrl = require('../controllers/holiday')(Holiday);
  
  app.route('/api/holiday')
    .post(holidayCtrl.create)
    .get(holidayCtrl.all);
  app.route('/api/holiday/basedonyear')
    .get(holidayCtrl.loadHolidayBasedOnYear);
  app.route('/api/holiday/:holidayId')
    .get(holidayCtrl.show)
    .put(holidayCtrl.update)
    .delete(holidayCtrl.destroy);
  
  app.param('holidayId', holidayCtrl.holiday);
  
};
