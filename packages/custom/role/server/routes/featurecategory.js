'use strict';

var MESSAGE = require('../../../../core/system/server/controllers/message.js');
var FEATURES = require('../../../../core/system/server/controllers/features.js');
var validation = require('../../../../core/system/server/controllers/validationUtil.js');
var ERRORS = MESSAGE.ERRORS;

var hasAuthorization = function (req, res, next) {
    var hasFeatures = validation.hasPermission(req, FEATURES.FEATURE_CATEGORIES.name);
    if (!req.user.isAdmin && !hasFeatures) {
        return res.status(401).send(ERRORS.ERROR_1012);
    }
    next();
};

module.exports = function (FeatureCategory, app, auth, database) {
    var featureCategoryCtrl = require('../controllers/featurecategory')(FeatureCategory);

    //Pagination API
    app.route('/api/featureCategory/pagination')
        .get(auth.requiresLogin, hasAuthorization, featureCategoryCtrl.featureCategoryListByPagination);

    app.route('/api/featureCategory')
        .post(auth.requiresLogin, hasAuthorization, featureCategoryCtrl.create)
        .get(auth.requiresLogin, hasAuthorization, featureCategoryCtrl.all);

    app.route('/api/featureCategory/:featureCategoryId')
        .get(auth.requiresLogin, hasAuthorization, featureCategoryCtrl.show)
        .put(auth.requiresLogin, hasAuthorization, featureCategoryCtrl.update)
        .delete(auth.requiresLogin, hasAuthorization, featureCategoryCtrl.destroy);

    app.param('featureCategoryId', featureCategoryCtrl.featureCategory);

};
