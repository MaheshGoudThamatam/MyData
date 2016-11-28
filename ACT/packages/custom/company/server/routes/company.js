/**
 * <Author:Akash Gupta>
 * <Date:30-06-2016>
 * <Routes: Create, Update, GetAll, GetSingle, Hard Delete & fetch security manager of Company>
 */

(function() {
	'use strict';

	/* jshint -W098 */
	// The Package is past automatically as first parameter

	/**
	 * user logged in validation for routes
	 */
	var authorization = function(req,res,next){
        if (!req.user) {
            return res.status(401).send("Unauthorised");
        }
        next();
    }

	module.exports = function(Company, app, auth, database) {
		var config = require('../../../../custom/actsec/server/config/config.js');
		var companyCtrl = require('../controllers/company')(Company);
		var setRoleObject = function(req, res, next) {
			req.feature = config.features.COMPANY;
			next();
		};
		app.route('/api/company')
			.post(setRoleObject, auth.create, auth.checkPermission,companyCtrl.create)
			.get(setRoleObject, auth.read, auth.checkPermission,companyCtrl.all);

		app.route('/api/company/:companyId')
			.get(setRoleObject, auth.read, auth.checkPermission,authorization,companyCtrl.show)
			.put(setRoleObject, auth.update, auth.checkPermission, authorization,companyCtrl.update)
			.delete(setRoleObject, auth.delete, auth.checkPermission,companyCtrl.destroy);
			
		app.route('/api/company/:companyId/companyManagers')
			.get(setRoleObject, auth.read, auth.checkPermission, authorization,companyCtrl.manager);
		app.route('/api/company/:tokenId/updateToken')
			.get(companyCtrl.updateToken);
			app.route('/api/company/:tokenId/loadCompany')
			.get(companyCtrl.loadCompany);
		app.route('/api/onUserLogged/company')
			.get(companyCtrl.getLoggedUserCompany);

		app.param('companyId', companyCtrl.company);
		app.param('tokenId', companyCtrl.loadbyToken);
	};
})();