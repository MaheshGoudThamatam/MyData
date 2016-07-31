
'use strict';

 //jshint -W098 
// The Package is past automatically as first parameter
module.exports = function (Team, app, auth, database) {
  var team = require('../controllers/team')(Team);
  // list all the amenities
  
  app.route('/api/:partnerId/team')
  	.get(auth.requiresLogin,team.all)
  	.post(team.create);
  	
  app.route('/api/team/:partnerId/:teamId')
    .get(auth.requiresLogin, team.show)
  	.put(auth.requiresLogin,team.update)
  	.delete(auth.requiresLogin,team.destroy);
  
  app.param('partnerId', team.partner);
  app.param('teamId', team.team);
};
