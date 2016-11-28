'use strict';

var MESSAGE = require('../../../../core/system/server/controllers/message.js');
var validation = require('../../../../core/system/server/controllers/validationUtil.js');
var ERRORS = MESSAGE.ERRORS;

/*var hasAuthorization = function (req, res, next) {
    var hasFeatures = validation.hasPermission(req, FEATURES.ROLES.name);
    if (!req.user.isAdmin && !hasFeatures) {
        return res.status(401).send(ERRORS.ERROR_1012);
    }
    next();
};*/

module.exports = function (RoleCtrl, app, auth, database) {

    var rolectrl = require('../controllers/role')(RoleCtrl);


    //Pagination API
    app.route('/api/role/pagination')
        .get(rolectrl.roleListByPagination);

    // APIS
    app.route('/api/role')
        .post(rolectrl.create)
        .get(rolectrl.all);

    app.route('/api/role/:roleId')
        .get(rolectrl.show)
        .put(rolectrl.update)
        .delete(rolectrl.destroy);


    app.route('/api/role/admin/user')
        .get(rolectrl.loadRoleOfAdmin);
    //  Fetch the role by its ID (roleId) from the database

    app.route('/api/admin/user/role/pagination')
        .get(rolectrl.loadUserBasedOnRole);
    
    app.route('/api/role/user/list')
    	.get(rolectrl.loadRole);
    app.route('/api/role/filteredRoles/list')
        .get(rolectrl.filteredRoles);

    app.param('roleId', rolectrl.role);


};