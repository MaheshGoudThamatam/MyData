'use strict';

// var hasAuthorization = function (req, res, next) {
//     if (!req.user.isAdmin && !req.UserCounselling.user._id.equals(req.user._id)) {
//         return res.status(401).send('User is not authorized');
//     }
//     next();
// };

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(UserCounselling, app, auth, database) {

  var userCounsellingCtrl = require('../controllers/user_counselling')(UserCounselling);
	
  app.route('/api/userCounselling')
  	.post(userCounsellingCtrl.create)
    .get(userCounsellingCtrl.all);

  app.route('/api/userCounselling/:userCounsellingId')
  	.get(userCounsellingCtrl.show)
  	.put(userCounsellingCtrl.update)
  	.delete(userCounsellingCtrl.destroy);
  
  app.route('/api/dateRequestList')
  .post(userCounsellingCtrl.dateCreate);

  app.route('/api/deleteRequest/:counsellingId')
  .delete(userCounsellingCtrl.deleteStudentRequest);

  app.route('/api/slotList')
  .get(userCounsellingCtrl.slotList);
  
  app.route('/api/dateRequestUser')
  .get(userCounsellingCtrl.dateRequestUser);
  
  app.param('userCounsellingId', userCounsellingCtrl.userCounselling);
  app.param('counsellingId', userCounsellingCtrl.counselling);
  
};