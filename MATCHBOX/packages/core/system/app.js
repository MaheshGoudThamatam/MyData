'use strict';

/*
 * Defining the Package
 */
var meanio = require('meanio');
var Module = meanio.Module,
  config = meanio.loadConfig(),
  favicon = require('serve-favicon');

var SystemPackage = new Module('system');

var session = require('express-session');
var crypto = require('crypto');
function genUuid() {
  if (typeof(callback) !== 'function') {
    return uuidFromBytes(crypto.randomBytes(16));
  }
}
function uuidFromBytes(rnd) {
  rnd[6] = (rnd[6] & 0x0f) | 0x40;
  rnd[8] = (rnd[8] & 0x3f) | 0x80;
  rnd = rnd.toString('hex').match(/(.{8})(.{4})(.{4})(.{4})(.{12})/);
  rnd.shift();
  return rnd.join('-');
}
/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
SystemPackage.register(function(app, auth, database, circles) {

  //We enable routing. By default the Package Object is passed to the routes
  SystemPackage.routes(app, auth, database);

  SystemPackage.aggregateAsset('css', 'common.css');
  SystemPackage.angularDependencies(['ui.router', 'mean-factory-interceptor']);
  

  // The middleware in config/express will run before this code

  // Set views path, template engine and default layout
  app.set('views', __dirname + '/server/views');

  // Setting the favicon and static folder
  /*if(config.favicon) {
    app.use(favicon(config.favicon));
  } else {
    // app.use(favicon(__dirname + '/public/assets/img/logo/favicon.png'));
  }*/
  app.use(session({
    genid: function(req) {
      return genUuid() // use UUIDs for session IDs
    },
    secret: 'keyboard cat'
  }));
  // Adding robots and humans txt
  app.useStatic(__dirname + '/public/assets/static');
  return SystemPackage;

});
