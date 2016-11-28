
  'use strict';

  /* jshint -W098 */
  // The Package is past automatically as first parameter
  module.exports = function (Partof, app, auth, database) {
    var partOf = require('../controllers/partOf')(Partof);
    // list all the amenities
    
    app.route('/api/partOf')
    	.get(partOf.all)
    	.post(partOf.create);
    	
      };
