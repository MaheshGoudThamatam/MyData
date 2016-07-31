'use strict';

var hasAuthorization = function (req, res, next) {
    if (!req.user.isAdmin && !req.attendee.user._id.equals(req.user._id)) {
        return res.status(401).send('User is not authorized');
    }
    next();
};

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Attendee, app, auth, database) {

  var attendeeCtrl = require('../controllers/attendee')(Attendee);
  
  app.route('/api/attendee')
    .post(attendeeCtrl.create)
    .get(attendeeCtrl.all);
  app.route('/api/attendee/getByBooking')
    .get(attendeeCtrl.loadAttendees);
   app.route('/api/attendee/:attendeeId')
    .get(attendeeCtrl.show)
    .put(attendeeCtrl.update)
    .delete(attendeeCtrl.destroy);
   
  
  app.param('attendeeId', attendeeCtrl.attendee);
  
};
