'use strict';

// var hasAuthorization = function (req, res, next) {
//     if (!req.user.isAdmin && !req.UserCounselling.user._id.equals(req.user._id)) {
//         return res.status(401).send('User is not authorized');
//     }
//     next();
// };

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(AdminCounselling, app, auth, database) {

  var adminCounsellingCtrl = require('../controllers/admin_counselling')(AdminCounselling);
	
  
  app.route('/api/branchCourse/:branchId')
    .get(adminCounsellingCtrl.show)
  
  app.route('/api/scheduleCreate')
    .post(adminCounsellingCtrl.scheduleCreate)
  
  app.route('/api/userList/:branchIdUser')
  	.get(adminCounsellingCtrl.userList)

  app.route('/api/adminusercounsellinglist/pagination')
  	.get(adminCounsellingCtrl.listadminusercounsellingrequest)

  app.route('/api/adminusercounselling/changestatus')
    .put(adminCounsellingCtrl.changingCounsellingStatus)  

   app.route('/api/adminusercounselling/changestatusreject')
    .put(adminCounsellingCtrl.changingCounsellingStatusreject) 

    app.route('/api/AdminCounsellingScheduleList/pagination')
    .get(adminCounsellingCtrl.listcompleteadminuserschedulelist) 

    app.route('/api/adminusercounselling/getmentor')
    .get(adminCounsellingCtrl.getMentor) 

   app.route('/api/AdminCounsellingDeletingSchedule')
    .get(adminCounsellingCtrl.deleteAdminSchedule)
    .delete(adminCounsellingCtrl.confirmdeleteAdminScheduleandemail)

    app.route('/api/AdminCounsellingEditSchedule/fetchAvailableMentor')
    .get(adminCounsellingCtrl.fetchallavailablementors)  

    app.route('/api/AdminCounsellingUpdateSchedule/updatecounselling')
    .put(adminCounsellingCtrl.updateAdminCounsellingScheduleAndUpdateCounselling) 

    app.route('/api/MentorCounsellingScheduleList/pagination')
    .get(adminCounsellingCtrl.mentorCounsellingScheduleList) 

  app.param('branchId', adminCounsellingCtrl.branch);
  
};
