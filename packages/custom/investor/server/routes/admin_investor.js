
'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(AdminInvestor, app, auth, database) {

	var adminInvestor = require('../controllers/admin_investor')(AdminInvestor);

	//Pagination API
	app.route('/api/policy-request/pagination')
		.get(adminInvestor.policyRequestListByPagination);

	app.route('/api/policy-request/:policyRequestId')
 		.get(adminInvestor.loadPolicyRequest)
		.put(adminInvestor.updatePolicyRequestStatus);
	
	app.route('/api/policy-request/pay/:policyRequestId')
		.put(adminInvestor.updatePolicyRequestStatus);

	app.route('/api/admin/policy-request')
 		.post(adminInvestor.assignPolicy)

	
	app.param('policyRequestId', adminInvestor.policyRequest);

};
