'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
var hasAuthorization = function (req, res, next) {
    if (!req.user.isAdmin && !req.Skillset.user._id.equals(req.user._id)) {
        return res.status(401).send('User is not authorized');
    }
    next();
};

module.exports = function(Skillset, app, auth, database) {

	 var SkillsetCtrl =require('../controllers/skillset')(Skillset, app);
	 
	//Pagination API
	   
	  app.route('/api/skillset')
	  	.post(auth.requiresLogin,SkillsetCtrl.create);
	  	
	  	app.route('/api/skillset/:skillsetId')
	  	    .get(auth.requiresLogin,hasAuthorization,SkillsetCtrl.singleskillsetdetail)
	  	    .put(auth.requiresLogin,hasAuthorization,SkillsetCtrl.skillsetupdate)
	  	    .delete(auth.requiresLogin,hasAuthorization,SkillsetCtrl.skillsetdelete);


	   app.route('/api/skillsetdetails/pagination')
	  	.get(auth.requiresLogin,hasAuthorization,SkillsetCtrl.fetchallskillset); 	
	   
        app.param('skillsetId', SkillsetCtrl.skillset);
};
