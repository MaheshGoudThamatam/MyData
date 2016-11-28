'use strict';

/* JSHint -W098 */
//This Package is passed automatically as first parameter

module.exports = function(FeatureCtrl, app, auth, database) {

	var featureCtrl = require('../controllers/feature')(FeatureCtrl);

	// APIS
	app.route('/api/feature')
		.get(featureCtrl.all);

	app.route('/api/feature/:featureId')
		.get(featureCtrl.show);

	app.param('featureId', featureCtrl.feature);
};