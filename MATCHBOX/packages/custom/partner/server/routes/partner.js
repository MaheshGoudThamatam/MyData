'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Partner, app, auth, database) {
	// User routes use partner controller
	var partner = require('../controllers/partner')(Partner);

	 app.route('/api/partner')
	  	.get(auth.requiresLogin, partner.list)
	  	.post( partner.create);
	  	
	
	 app.route('/api/partner/:partnerId')
	    .get(auth.requiresLogin, partner.get)
	  	.put(auth.requiresLogin,partner.update)
	  	.delete(auth.requiresLogin,partner.delete);
	 

	 app.param('partnerId', partner.partner);
};
