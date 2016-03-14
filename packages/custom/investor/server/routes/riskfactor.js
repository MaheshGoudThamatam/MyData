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
module.exports = function (RiskFactorCtrl, app, auth, database) {

    var RiskFactorCtrl = require('../controllers/riskfactors')(RiskFactorCtrl);


    //Pagination API
    app.route('/api/riskfactor/policy/pagination')
        .get(RiskFactorCtrl.riskFactorListByPagination);

    // APIS
    app.route('/api/riskfactor/policy')
        .post(auth.requiresLogin, hasAuthorization, RiskFactorCtrl.create)
        .get(auth.requiresLogin, hasAuthorization, RiskFactorCtrl.all);
    app.route('/api/technologyriskfactor/policy')
        .get(auth.requiresLogin, hasAuthorization, RiskFactorCtrl.technologyRiskfactors)
    app.route('/api/riskfactor/policy/:riskfactorId')
        .get(auth.requiresLogin, hasAuthorization, RiskFactorCtrl.show)
        .put(auth.requiresLogin, hasAuthorization, RiskFactorCtrl.update)
        .delete(auth.requiresLogin, hasAuthorization, RiskFactorCtrl.destroy);


  /*  app.route('/api/riskfactor/policy//admin/user')
        .get(RiskFactorCtrl.loadpolicyOfAdmin);
    //  Fetch the policy by its ID (roleId) from the database*/
/*
    app.route('/api/admin/user/role/pagination')
        .get(RiskFactorCtrl.loadUserBasedOnRole);*/

    app.param('riskfactorId', RiskFactorCtrl.riskfactor);


};