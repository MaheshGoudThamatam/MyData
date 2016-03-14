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

/* jshint -W098 */
// The Package is past automatically as first parameter

module.exports = function (Country, app, auth, database) {

    var countryCtrl = require('../controllers/country')(Country);

    //Pagination API
    app.route('/api/country/pagination')
        .get(countryCtrl.countryListByPagination);

    app.route('/api/country')
        .post(auth.requiresLogin, hasAuthorization, countryCtrl.create)
        .get(auth.requiresLogin, hasAuthorization, countryCtrl.all);
    
    app.route('/api/location')
        .get(countryCtrl.locationTreeViewJSON);

    app.route('/api/country/:countryId')
        .get(countryCtrl.show)
        .put(countryCtrl.update)
        .delete( countryCtrl.destroy);
    
    app.param('countryId', countryCtrl.country);
};
