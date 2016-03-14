'use strict';

//Article authorization helpers
var hasAuthorization = function (req, res, next) {
    if (!req.user.isAdmin && !req.CourseCurriculumCtrl.user._id.equals(req.user._id)) {
        return res.status(401).send('User is not authorized');
    }
    next();
};

/* JSHint -W098 */
//This Package is passed automatically as first parameter

module.exports = function (CourseCurriculumCtrl, app, auth, database) {

 var curriculumctrl = require('../controllers/coursecurriculum')(CourseCurriculumCtrl);

 app.route('/api/:courseId/coursetest')
     .post(auth.requiresLogin, hasAuthorization,curriculumctrl.create)
     .get(auth.requiresLogin, hasAuthorization,curriculumctrl.all);
 app.route('/api/coursetest/:coursetestId')
 	.put(auth.requiresLogin, hasAuthorization,curriculumctrl.update)
 	.get(auth.requiresLogin, hasAuthorization,curriculumctrl.show)
 	.delete(auth.requiresLogin, hasAuthorization,curriculumctrl.destroy);
 app.route('/api/curriculum/pagination')
 	.get(auth.requiresLogin, hasAuthorization,curriculumctrl.CurriculumListByPagination);
 app.route('/api/:courseId/curriculum')
 	.get(auth.requiresLogin, hasAuthorization,curriculumctrl.all);
 app.route('/api/:courseId/coursecurriculumtest')
	.get(curriculumctrl.courseCurriculumTest);
 
 app.param('coursetestId',curriculumctrl.coursetest);
 app.param('courseId',curriculumctrl.course);
}