'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Location = new Module('location');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Location.register(function(app, auth, database, circles) {

  //We enable routing. By default the Package Object is passed to the routes
  Location.routes(app, auth, database, circles);

  //We are adding a link to the main menu for all authenticated users
  Location.menus.add({
    title: 'location example page',
    link: 'location example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Location.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Location.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Location.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Location;
});
