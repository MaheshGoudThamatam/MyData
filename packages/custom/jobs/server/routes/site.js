'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(SiteCtrl, app, auth, database) {

	 var siteCtrl = require('../controllers/site')(SiteCtrl);
	 
	//Pagination API
	  app.route('/api/site/pagination')
	      .get(siteCtrl.siteListByPagination);
	  
	  app.route('/api/site')
	  	.post(siteCtrl.create)
	    .get(siteCtrl.all);

	  app.route('/api/site/:siteId')
	  	.get(siteCtrl.show)
	  	.put(siteCtrl.update)
	  	.delete(siteCtrl.destroy);
	  
	  app.param('siteId', siteCtrl.site);

};
