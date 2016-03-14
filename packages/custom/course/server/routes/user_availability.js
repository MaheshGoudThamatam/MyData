'use strict';

var MESSAGE = require('../../../../core/system/server/controllers/message.js');
var FEATURES = require('../../../../core/system/server/controllers/features.js');
var validation = require('../../../../core/system/server/controllers/validationUtil.js');
var ERRORS = MESSAGE.ERRORS;

var hasAuthorization = function (req, res, next) {
    var hasFeatures = validation.hasPermission(req, FEATURES.USERAVAILABILITY.name);
    if (!req.user.isAdmin && !hasFeatures) {
        return res.status(401).send(ERRORS.ERROR_1012);
    }
    next();
};
/* JSHint -W098 */
//This Package is passed automatically as first parameter

module.exports = function (UseravailabilityCtrl, app, auth, database) {

    var UseravailabilityCtrl = require('../controllers/user_availability')(UseravailabilityCtrl);


    //Pagination API
/*    app.route('/api/role/pagination')
        .get(UseravailabilityCtrl.roleListByPagination);*/

    // APIS
    app.route('/api/useravailability')
        .post( UseravailabilityCtrl.create)
        .get( UseravailabilityCtrl.all);

    app.route('/api/useravailability/:useravailabilityId')
        .get( UseravailabilityCtrl.show)
        .put( UseravailabilityCtrl.update)
        .delete( UseravailabilityCtrl.destroy);


  /*  app.route('/api/role/admin/user')
        .get(rolectrl.loadRoleOfAdmin);*/
    //  Fetch the role by its ID (roleId) from the database

   /* app.route('/api/admin/user/role/pagination')
        .get(rolectrl.loadUserBasedOnRole);*/

    app.param('useravailabilityId', UseravailabilityCtrl.useravailability);


};