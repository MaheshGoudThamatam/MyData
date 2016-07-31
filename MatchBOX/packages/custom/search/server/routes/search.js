'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Search, app, auth, database) {

	var search = require('../controllers/search')(Search);			
	

	app.route('/api/search/rooms')
		.post(search.searchRooms);
	
/*	  app.route('/api/roomresult/pagination')
	  .get(search.loadresultpagination);*/

};
