
'use strict';

  /* jshint -W098 */
  // The Package is past automatically as first parameter
module.exports = function (SpaceType, app, auth, database) {

	var spaceType = require('../controllers/space_type')(SpaceType);
	
	app.route('/api/space-type/pagination')
		.get(spaceType.pagination);
	
	app.route('/api/spaceType')
		.post(spaceType.create);
	
	app.route('/api/spaceType/:spaceTypeId')
		.get(spaceType.get)
		.put(spaceType.update)
		.delete(spaceType.delete);
	
	app.param('spaceTypeId', spaceType.spaceType);
	
 };

