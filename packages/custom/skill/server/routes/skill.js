'use strict';
var MESSAGE = require('../../../../core/system/server/controllers/message.js');
var FEATURES = require('../../../../core/system/server/controllers/features.js');
var validation = require('../../../../core/system/server/controllers/validationUtil.js');
var ERRORS = MESSAGE.ERRORS;

var hasAuthorization = function (req, res, next) {
    var hasFeatures = validation.hasPermission(req, FEATURES.SKILLS.name);
    if (!req.user.isAdmin && !hasFeatures) {
        return res.status(401).send(ERRORS.ERROR_1012);
    }
    next();
};

module.exports = function(SkillCtrl, app, auth, database) {

	 var skillCtrl = require('../controllers/skill')(SkillCtrl);
		
	 //Pagination API
	  app.route('/api/skill/pagination')
	      .get(auth.requiresLogin, hasAuthorization,skillCtrl.skillListByPagination);
	 
	  app.route('/api/skill')
	  	.post(auth.requiresLogin, hasAuthorization,skillCtrl.create)
	    .get(auth.requiresLogin, hasAuthorization,skillCtrl.all);

	  app.route('/api/skill/:skillId')
	  	.get(auth.requiresLogin, hasAuthorization,skillCtrl.show)
	  	.put(auth.requiresLogin, hasAuthorization,skillCtrl.update)
	  	.delete(auth.requiresLogin, hasAuthorization,skillCtrl.destroy);
	  
	  app.param('skillId', skillCtrl.skill);
};
