'use strict';

var MESSAGE = require('../../../../core/system/server/controllers/message.js');
var FEATURES = require('../../../../core/system/server/controllers/features.js');
var validation = require('../../../../core/system/server/controllers/validationUtil.js');
var ERRORS = MESSAGE.ERRORS;

var hasAuthorization = function (req, res, next) {
    var hasFeatures = validation.hasPermission(req, FEATURES.ROLES.name);
    if (!req.user.isAdmin && !hasFeatures) {
        return res.status(401).send(ERRORS.ERROR_1012);
    }
    next();
};

module.exports = function (FeatureroleCtrl, app, auth, database) {

    var featureRoleCtrl = require('../controllers/featurerole')(FeatureroleCtrl);


    // APIS
    app.route('/api/featureRole')
        .post(auth.requiresLogin, hasAuthorization, featureRoleCtrl.create)
        .get(auth.requiresLogin, hasAuthorization, featureRoleCtrl.all);

    app.route('/api/featureRole/:featureRoleId')
        .get(auth.requiresLogin, hasAuthorization, featureRoleCtrl.show)
        .put(auth.requiresLogin, hasAuthorization, featureRoleCtrl.update)
        .delete(auth.requiresLogin, hasAuthorization, featureRoleCtrl.destroy);

    app.route('/api/featureRole/role/:role')
        .get(featureRoleCtrl.featurerolebyRole)

    app.route('/api/user/role/:userId')
        .get(featureRoleCtrl.useronRoles)
    //  Fetch the role by its ID (roleId) from the database

    app.param('featureRoleId', featureRoleCtrl.featurerole);
    app.param('role', featureRoleCtrl.role);
    app.param('userId', featureRoleCtrl.user);
};