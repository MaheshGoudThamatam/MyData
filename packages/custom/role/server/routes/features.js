'use strict';

var MESSAGE = require('../../../../core/system/server/controllers/message.js');
var FEATURES = require('../../../../core/system/server/controllers/features.js');
var validation = require('../../../../core/system/server/controllers/validationUtil.js');
var ERRORS = MESSAGE.ERRORS;

var hasAuthorization = function (req, res, next) {
    var hasFeatures = validation.hasPermission(req, FEATURES.FEATURE.name);
    if (!req.user.isAdmin && !hasFeatures) {
        return res.status(401).send(ERRORS.ERROR_1012);
    }
    next();
};


module.exports = function (FeatureCtrl, app, auth, database) {

    var featurectrl = require('../controllers/features')(FeatureCtrl);


//Pagination API
    app.route('/api/feature/pagination')
        .get(auth.requiresLogin, hasAuthorization, featurectrl.roleListByPagination);
    // APIS
    app.route('/api/feature')
        .post(auth.requiresLogin, hasAuthorization, featurectrl.create)
        .get(auth.requiresLogin, hasAuthorization, featurectrl.all);

    app.route('/api/feature/:featureId')
        .get(auth.requiresLogin, hasAuthorization, featurectrl.show)
        .put(auth.requiresLogin, hasAuthorization, featurectrl.update)
        .delete(auth.requiresLogin, hasAuthorization, featurectrl.destroy);

    //  Fetch the feature by its ID (featureId) from the database

    app.param('featureId', featurectrl.feature);


};