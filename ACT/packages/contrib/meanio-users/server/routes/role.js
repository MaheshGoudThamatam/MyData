'use strict';

/* JSHint -W098 */
//This Package is passed automatically as first parameter
module.exports = function(RoleCtrl, app, auth, database) {

	//var Authorization = require('../../authorization')(Authorization);
	var config = require('../../../../custom/actsec/server/config/config.js');
	var rolectrl = require('../controllers/role')(RoleCtrl);

	var setRoleObject = function(req, res, next) {
		req.feature = config.features.ROLE;
		next();
	};

	// APIS
	app.route('/api/role')
		.post(setRoleObject, auth.create, auth.checkPermission, rolectrl.create)
		.get(setRoleObject, auth.read, auth.checkPermission, rolectrl.all);

	app.route('/api/role/:roleId')
		.get(setRoleObject, auth.read, auth.checkPermission, rolectrl.show)
		.put(setRoleObject, auth.update, auth.checkPermission, rolectrl.update)
		.delete(setRoleObject, auth.delete, auth.checkPermission, rolectrl.destroy);

    app.route('/api/roleSelect')
        .get(auth.checkLogin, rolectrl.getSelect);

	app.param('roleId', rolectrl.role);
};