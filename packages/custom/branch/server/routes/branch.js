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

module.exports = function (Branch, app, auth, database) {

    var branchCtrl = require('../controllers/branch')(Branch);
    //Pagination API
    app.route('/api/branch/pagination')
        .get(branchCtrl.branchListByPagination);

    app.route('/api/city/:cityId/branch')
        .post(auth.requiresLogin, hasAuthorization, branchCtrl.create)
        .get(auth.requiresLogin, hasAuthorization, branchCtrl.all);

    app.route('/api/branch/:branchId')
        .get(auth.requiresLogin, hasAuthorization, branchCtrl.show)
        .put(auth.requiresLogin, hasAuthorization, branchCtrl.update)
        .delete(auth.requiresLogin, hasAuthorization, branchCtrl.destroy);

    app.route('/api/all/branch')
        .get(auth.requiresLogin, hasAuthorization, branchCtrl.allBranch);

    app.route('/api/branch/picture/branchPicture')
        .post(branchCtrl.uploadBranchPic);

    app.route('/api/breadcrumb/branch')
        .get(branchCtrl.loadZoneNCountry);
    app.route('/api/branchCourses')
        .get(auth.requiresLogin, hasAuthorization, branchCtrl.loadBranchesonCourses);
    app.param('cityId', branchCtrl.city);
    app.param('branchId', branchCtrl.branch);

};
