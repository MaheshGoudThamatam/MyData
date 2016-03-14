'use strict';

var hasAuthorization = function(req, res, next) {
    if (!req.user.isAdmin && !req.CourseCounsellingChecklist.user._id.equals(req.user._id)) {
        return res.status(401).send('User is not authorized');
    }
    next();
};

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(CourseCounsellingChecklist, app, auth, database) {

    var courseCounsellingChecklistCtrl = require('../controllers/course_counselling_checklist')(CourseCounsellingChecklist);

    app.route('/api/courseCounsellingChecklist/pagination')
    .get(auth.requiresLogin, hasAuthorization,courseCounsellingChecklistCtrl.courseCounsellingChecklistByPagination);
    
    app.route('/api/course/:courseId/courseCounsellingChecklist')
        .post(auth.requiresLogin, hasAuthorization,courseCounsellingChecklistCtrl.create)
        .get(auth.requiresLogin, hasAuthorization,courseCounsellingChecklistCtrl.all);

    app.route('/api/course/:courseId/courseCounsellingChecklist/:courseCounsellingChecklistId')
        .get(auth.requiresLogin, hasAuthorization,courseCounsellingChecklistCtrl.show)
        .put(auth.requiresLogin, hasAuthorization,courseCounsellingChecklistCtrl.update)
        .delete(auth.requiresLogin, hasAuthorization,courseCounsellingChecklistCtrl.destroy);
    
    app.param('courseCounsellingChecklistId', courseCounsellingChecklistCtrl.courseCounsellingChecklist);
    app.param('courseId', courseCounsellingChecklistCtrl.course);
};
