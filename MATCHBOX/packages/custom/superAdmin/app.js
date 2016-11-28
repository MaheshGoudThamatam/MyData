'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var SuperAdmin = new Module('superAdmin');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
SuperAdmin.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  SuperAdmin.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  SuperAdmin.menus.add({
    title: 'superAdmin example page',
    link: 'superAdmin example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  SuperAdmin.aggregateAsset('css', 'superAdmin.css');

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    SuperAdmin.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    SuperAdmin.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    SuperAdmin.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return SuperAdmin;
});
