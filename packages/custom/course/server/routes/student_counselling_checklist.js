'use strict';

var hasAuthorization = function(req, res, next) {
    if (!req.user.isAdmin && !req.StudentCounsellingChecklist.user._id.equals(req.user._id)) {
        return res.status(401).send('User is not authorized');
    }
    next();
};

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(StudentCounsellingChecklist, app, auth, database) {

    var studentCounsellingChecklistCtrl = require('../controllers/student_counselling_checklist')(StudentCounsellingChecklist);

   
    app.route('/api/studentCounsellingChecklist')
        .post(auth.requiresLogin, hasAuthorization,studentCounsellingChecklistCtrl.create)
        .get(auth.requiresLogin, hasAuthorization,studentCounsellingChecklistCtrl.all);

    app.route('/api/studentCounsellingChecklist/:studentCounsellingChecklistId')
        .get(auth.requiresLogin, hasAuthorization,studentCounsellingChecklistCtrl.show)
        .put(auth.requiresLogin, hasAuthorization,studentCounsellingChecklistCtrl.update)
        .delete(auth.requiresLogin, hasAuthorization,studentCounsellingChecklistCtrl.destroy);
    
    app.param('studentCounsellingChecklistId', studentCounsellingChecklistCtrl.studentCounsellingChecklist);
    
};
