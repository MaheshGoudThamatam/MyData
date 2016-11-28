'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function (PlugNplay, app, auth, database) {

var plugNplay = require('../controllers/plugNplay')(PlugNplay);

  app.route('/api/loadRoles')
  .get(plugNplay.loadRoles);
  
  app.route('/api/plugNplay/userEnrolled')
  .post(plugNplay.savePlugNPlayUsers);
  
 app.route('/api/city/plugNplay')
 .get(plugNplay.getPlugNplayCity);
 
 app.route('/api/plugNplay/areas')
   .post(plugNplay.createPlugNPlay)
    .get(plugNplay.loadPlugNPlay);

app.route('/api/plugNplay/areas/:plugNplayId')
  .get(plugNplay.show)
  .put(plugNplay.updatePlugNPlay);

  
app.param('plugNplayId', plugNplay.plugNplay);


};