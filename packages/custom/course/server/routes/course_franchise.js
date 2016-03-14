'use strict';

/* JSHint -W098 */
// This Package is passed automatically as first parameter

// Defines hasAuthorization
  var hasAuthorization = function (req, res, next) {
    if (!req.user.isAdmin && !req.RoleCtrl.user._id.equals(req.user._id)) {
        return res.status(401).send('User is not authorized');
    }
    next();
};

module.exports = function(FranchiseCtrl, app, auth, database) {

	var Course_Franchise = require('../controllers/course_franchise')(FranchiseCtrl);

	//Pagination API
	app.route('/api/franchise/pagination')
       .get(Course_Franchise.franchiseListByPagination);

	app.route('/api/franchise')
	   .post(auth.requiresLogin, hasAuthorization, Course_Franchise.create)
	   .get(auth.requiresLogin, hasAuthorization, Course_Franchise.all);

	app.route('/api/franchise/:franchiseId')
	   .get(auth.requiresLogin, hasAuthorization, Course_Franchise.show)
	   .put(auth.requiresLogin, hasAuthorization, Course_Franchise.update)
	   .delete(auth.requiresLogin, hasAuthorization, Course_Franchise.destroy);
	  
		
	app.param('franchiseId', Course_Franchise.franchise);

};