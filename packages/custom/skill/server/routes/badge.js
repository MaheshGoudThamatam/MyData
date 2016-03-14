'use strict';

var MESSAGE = require('../../../../core/system/server/controllers/message.js');
var FEATURES = require('../../../../core/system/server/controllers/features.js');
var validation = require('../../../../core/system/server/controllers/validationUtil.js');
var ERRORS = MESSAGE.ERRORS;

var hasAuthorization = function (req, res, next) {
    var hasFeatures = validation.hasPermission(req, FEATURES.BADGES.name);
    if (!req.user.isAdmin && !hasFeatures) {
        return res.status(401).send(ERRORS.ERROR_1012);
    }
    next();
};

module.exports = function (BadgeCtrl, app, auth, database) {

    var badgeCtrl = require('../controllers/badge')(BadgeCtrl);

    app.route('/api/badge/pagination')
        .get(badgeCtrl.badgeListByPagination);

    app.route('/api/badge')
        .post(auth.requiresLogin, hasAuthorization, badgeCtrl.create)
        .get(auth.requiresLogin, hasAuthorization, badgeCtrl.all);

    app.route('/api/badge/:badgeId')
        .get(auth.requiresLogin, hasAuthorization, badgeCtrl.show)
        .put(auth.requiresLogin, hasAuthorization, badgeCtrl.update)
        .delete(auth.requiresLogin, hasAuthorization, badgeCtrl.destroy);

    app.param('badgeId', badgeCtrl.badge);
};
