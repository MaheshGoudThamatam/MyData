'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(OnlineTestCtrl, app, auth, database) {

	var onlinetestCtrl = require('../controllers/onlinetest')(OnlineTestCtrl);
	 //Pagination API
	  app.route('/api/onlinetest/pagination')
	      .get(onlinetestCtrl.onlinetestListByPagination);

	 app.route('/api/onlinetest')
	     .post(onlinetestCtrl.create)
	     .get(onlinetestCtrl.all);
	 app.route('/api/onlinetest/:onlinetestId')
	     .get(onlinetestCtrl.show)
		 .put(onlinetestCtrl.update)
	     .delete(onlinetestCtrl.destroy);
	 app.route('/api/skill/:skillId/onlinetest')
	     .get(onlinetestCtrl.loadOnlineTest);  
	 
	 app.param('onlinetestId', onlinetestCtrl.onlinetest);
	 app.param('skillId', onlinetestCtrl.skill);
};


