'use strict';

var MESSAGE = require('../../../../core/system/server/controllers/message.js');
var validation = require('../../../../core/system/server/controllers/validationUtil.js');
var ERRORS = MESSAGE.ERRORS;

/*var hasAuthorization = function (req, res, next) {
    var hasFeatures = validation.hasPermission(req, 'Feature');
    if (!req.user.isAdmin && !hasFeatures) {
        return res.status(401).send(ERRORS.ERROR_1012);
    }
    next();
};*/

module.exports = function (FeatureCtrl, app, auth, database) {

    var featurectrl = require('../controllers/feature')(FeatureCtrl);

    //Pagination API
    app.route('/api/feature/pagination')
        .get(featurectrl.roleListByPagination);
    
    // APIS
    app.route('/api/feature')
        .post(featurectrl.create)
        .get(featurectrl.all);

    app.route('/api/feature/:featureId')
        .get(featurectrl.show)
        .put(featurectrl.update)
        .delete(featurectrl.destroy);

    //  Fetch the feature by its ID (featureId) from the database

    app.param('featureId', featurectrl.feature);


};