'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(PromoCode, app, auth, database) {

	var promoCode = require('../controllers/promoCode')(PromoCode);
	
	app.route('/api/promoCode')
		.get(promoCode.all)
		.post(promoCode.create);
	
	app.route('/api/promoCode/:promoCodeId')
		.get(promoCode.get)
		.put(promoCode.update)
		.delete(promoCode.delete);
	
	app.route('/api/deActivate/promoCode/:promoCodeId')
		.get(promoCode.deActivatePromoCode);
	
	app.route('/api/validate/promoCode/:promoCodeId')
		.get(promoCode.validatePromoCode);
	
	app.param('promoCodeId', promoCode.promoCode);

};
