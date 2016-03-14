'use strict';

//Article authorization helpers
var hasAuthorization = function (req, res, next) {
    if (!req.user.isAdmin && !req.CourseTopicCtrl.user._id.equals(req.user._id)) {
        return res.status(401).send('User is not authorized');
    }
    next();
};
/* JSHint -W098 */
//This Package is passed automatically as first parameter

module.exports = function (CourseTopicCtrl, app, auth, database) {

 var topicctrl = require('../controllers/coursetopic')(CourseTopicCtrl);

 app.route('/api/coursetopic/course/:courseId')
     .post(auth.requiresLogin, hasAuthorization,topicctrl.create)
     .get(auth.requiresLogin, hasAuthorization,topicctrl.loadTopicsByCourse);
 app.route('/api/coursetopic/:coursetopicId')
 	.put(auth.requiresLogin, hasAuthorization,topicctrl.update)
 	.get(auth.requiresLogin, hasAuthorization,topicctrl.show)
 	.delete(auth.requiresLogin, hasAuthorization,topicctrl.destroy);
app.route('/api/course/topic/:coursetopicId/list')
 	.get(auth.requiresLogin, hasAuthorization,topicctrl.loadTopicsByParent);
app.route('/api/:courseId/topic/subtopic')
 	 .post(auth.requiresLogin, hasAuthorization,topicctrl.createsubtopic);
app.route('/api/:courseId/curriculum/subtopic')
 	.get(auth.requiresLogin, hasAuthorization,topicctrl.all);

 app.param('coursetopicId',topicctrl.topic);
 app.param('courseId',topicctrl.course);
}