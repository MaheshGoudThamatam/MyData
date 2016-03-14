'use strict';
var MESSAGE = require('../../../../core/system/server/controllers/message.js');
var FEATURES = require('../../../../core/system/server/controllers/features.js');
var validation = require('../../../../core/system/server/controllers/validationUtil.js');
var ERRORS = MESSAGE.ERRORS;

var hasAuthorization = function (req, res, next) {
    var hasFeatures = validation.hasPermission(req, FEATURES.LOCATIONS.name);
    if (!req.user.isAdmin && !hasFeatures) {
        return res.status(401).send(ERRORS.ERROR_1012);
    }
    next();
};

module.exports = function (Zone, app, auth, database) {

    var zoneCtrl = require('../controllers/zone')(Zone);

    //Pagination API
    app.route('/api/zone/pagination')
        .get(zoneCtrl.zoneListByPagination);

    app.route('/api/country/:countryId/zone')
        .post(auth.requiresLogin, hasAuthorization, zoneCtrl.create)
        .get(auth.requiresLogin, hasAuthorization, zoneCtrl.all);

    app.route('/api/zone/:zoneId')
        .get(auth.requiresLogin, hasAuthorization, zoneCtrl.show)
        .put(auth.requiresLogin, hasAuthorization, zoneCtrl.update)
        .delete(auth.requiresLogin, hasAuthorization, zoneCtrl.destroy);

    app.param('countryId', zoneCtrl.country);
    app.param('zoneId', zoneCtrl.zone);

};
