'use strict';
/*
 * <Author: Abha Singh>
 * <Date:21-06-2016>
 * <Routes: Create, Update, GetAll, GetSingle, Soft Delete for location>
 */
/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Location, app, auth, database) {

    var locationCtrl = require('../controllers/location')(Location);

    var authentication = function(req, res, next) {
        if (!req.user) {
            return res.status(401).send('User is unauthorized to access this page.');
        } else {
            next();
        }
    };

    // Location API
    app.route('/api/location')
        .post(authentication, locationCtrl.create)
        .get(authentication, locationCtrl.all);

    app.route('/api/location/:locationId')
        .get(authentication, locationCtrl.show)
        .put(authentication, locationCtrl.update)
        .delete(authentication, locationCtrl.delete);

    app.param('locationId', locationCtrl.location);
};