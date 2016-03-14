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

module.exports = function (City, app, auth, database) {

    var cityCtrl = require('../controllers/city')(City);

    //Pagination API
    app.route('/api/city/pagination')
        .get(cityCtrl.cityListByPagination);

    app.route('/api/zone/:zoneId/city')
        .post(auth.requiresLogin, hasAuthorization, cityCtrl.create)
        .get(auth.requiresLogin, hasAuthorization, cityCtrl.all);

    app.route('/api/city/:cityId')
        .get(auth.requiresLogin, hasAuthorization, cityCtrl.show)
        .put(auth.requiresLogin, hasAuthorization, cityCtrl.update)
        .delete(auth.requiresLogin, hasAuthorization, cityCtrl.destroy);

    app.route('/api/all/city')
        .get(auth.requiresLogin, hasAuthorization, cityCtrl.allCity);
    
    app.route('/api/:countryId/city')
    .get(cityCtrl.cityBasedOnCountry);

    app.param('zoneId', cityCtrl.zone);
    app.param('cityId', cityCtrl.city);
    app.param('countryId', cityCtrl.country);

};
