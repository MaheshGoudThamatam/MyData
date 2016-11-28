'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function (VirtualOffice, app, auth, database) {

	var virtualOfficeCtrl = require('../controllers/virtualOffice')(VirtualOffice);

	app.route('/api/virtualOffices')
		.post(virtualOfficeCtrl.create)
		.get(virtualOfficeCtrl.getVirtualOffices);

	app.route('/api/virtualOffices/:virtualOfficeId')
		.get(virtualOfficeCtrl.getVirtualOfficebyId)
		.put(virtualOfficeCtrl.update);

	app.route('/api/virtualOffice/facilities')
		.post(virtualOfficeCtrl.createFacilities)
		.get(virtualOfficeCtrl.getFacilities);

   app.route('/api/virtualoffice/rooms/partner')
		.get(virtualOfficeCtrl.getVirtualOfficesPartner);

   app.route('/api/space/virtualoffice/rooms')
		.get(virtualOfficeCtrl.getVirtualOfficesBySapce); 		 		


	app.param('virtualOfficeId', virtualOfficeCtrl.getVirtualOffice);

};

