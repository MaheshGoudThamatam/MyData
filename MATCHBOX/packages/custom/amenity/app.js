'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Amenity = new Module('amenity');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Amenity.register(function(app, auth, database, swagger) {

  //We enable routing. By default the Package Object is passed to the routes
  Amenity.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  Amenity.menus.add({
    title: 'amenity example page',
    link: 'amenity example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  Amenity.aggregateAsset('css', 'amenity.css');
Amenity.angularDependencies(['toastr']);
  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Amenity.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Amenity.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Amenity.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  //Only use swagger.add if /docs and the corresponding files exists
  swagger.add(__dirname);

  return Amenity;
});
