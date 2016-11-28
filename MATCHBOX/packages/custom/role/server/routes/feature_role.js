'use strict';

var MESSAGE = require('../../../../core/system/server/controllers/message.js');
var validation = require('../../../../core/system/server/controllers/validationUtil.js');
var ERRORS = MESSAGE.ERRORS;

/*var hasAuthorization = function (req, res, next) {
    var hasFeatures = validation.hasPermission(req, FEATURES.ROLES.name);
    if (!req.user.isAdmin && !hasFeatures) {
        return res.status(401).send(ERRORS.ERROR_1012);
    }
    next();
};*/

module.exports = function (FeatureroleCtrl, app, auth, database) {

    var featureRoleCtrl = require('../controllers/feature_role')(FeatureroleCtrl);


    // APIS
    app.route('/api/featureRole')
        .post(featureRoleCtrl.create)
        .get(featureRoleCtrl.all);

    app.route('/api/featureRole/:featureRoleId')
        .get(featureRoleCtrl.show)
        .put(featureRoleCtrl.update)
        .delete(featureRoleCtrl.destroy);

    app.route('/api/featureRole/role/:role')
        .get(featureRoleCtrl.featurerolebyRole)

    app.route('/api/user/role/:userId')
        .get(featureRoleCtrl.useronRoles);
    //  Fetch the role by its ID (roleId) from the database

    app.param('featureRoleId', featureRoleCtrl.featurerole);
    app.param('role', featureRoleCtrl.role);
    app.param('userId', featureRoleCtrl.user);
};