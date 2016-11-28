
  'use strict';

  /* jshint -W098 */
  // The Package is past automatically as first parameter
  module.exports = function (Amenity, app, auth, database) {
    var amenity = require('../controllers/amenity')(Amenity);
    // list all the amenities
    

    app.route('/api/amenity-space/:appliesToId')
		.get(amenity.selectedAmenities);
    
    app.route('/api/amenity')
    	.get(amenity.all)
    	.post(amenity.create);

    app.route('/api/amenity/:amenityId')
		.get(amenity.show)
    	.put(amenity.update)
    	.delete(amenity.destroy);
    
    
    app.param('amenityId', amenity.amenity);
    app.param('appliesToId', amenity.spaceType);
    
  };
