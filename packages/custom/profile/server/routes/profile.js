'use strict';

var hasAuthorization = function (req, res, next) {
    if (!req.user.isAdmin && !req.Profile.user._id.equals(req.user._id)) {
        return res.status(401).send('User is not authorized');
    }
    next();
};
/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Profile, app, auth, database) {
	var upload = require('../controller/profile')(Profile);
	app.route('/api/user/profilePicture').post(auth.requiresLogin, hasAuthorization,upload.uploadProfilePic);
	app.route('/api/user/Resume').post(auth.requiresLogin, hasAuthorization,upload.uploadResume);
	//app.param('userId', upload.profile);
};