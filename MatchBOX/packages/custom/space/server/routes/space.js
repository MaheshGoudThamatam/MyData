
'use strict';

  /* jshint -W098 */
  // The Package is past automatically as first parameter
module.exports = function (Space, app, auth, database) {

	var space = require('../controllers/space')(Space);
	
	app.route('/api/space/pagination')
		.get(space.pagination);
	
	app.route('/api/space')
		.post(space.create);
	
	app.route('/api/partner/:partnerId/space')
		.get(space.loadPartnersSpace);
	
	app.route('/api/space/partner')
		.get(space.loadPartners);
	
	app.route('/api/space/:spaceId')
		.get(space.get)
		.put(space.update)
		.delete(space.delete);
	
	app.route('/api/partner/team/:userId/space')
		.get(space.getSpaceAddress);
		
	app.param('spaceId', space.space);
	app.param('userId', space.user);
	app.param('partnerId', space.user);
	
 };

