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
module.exports = function (PolicyCtrl, app, auth, database) {

    var PolicyCtrl = require('../controllers/policy')(PolicyCtrl);


    //Pagination API
    app.route('/api/policy/pagination')
        .get(PolicyCtrl.PolicyListByPagination);

    // APIS
    app.route('/api/policy')
        .post(auth.requiresLogin, hasAuthorization, PolicyCtrl.create)
        .get(auth.requiresLogin, hasAuthorization, PolicyCtrl.all);

    app.route('/api/policy/:policyId')
        .get(auth.requiresLogin, hasAuthorization, PolicyCtrl.show)
        .put(auth.requiresLogin, hasAuthorization, PolicyCtrl.update)
        .delete(auth.requiresLogin, hasAuthorization, PolicyCtrl.destroy);


  /*  app.route('/api/policy/admin/user')
        .get(PolicyCtrl.loadpolicyOfAdmin);
    //  Fetch the policy by its ID (roleId) from the database*/
/*
    app.route('/api/admin/user/role/pagination')
        .get(PolicyCtrl.loadUserBasedOnRole);*/

    app.param('policyId', PolicyCtrl.policy);


};