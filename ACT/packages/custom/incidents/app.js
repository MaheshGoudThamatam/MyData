'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Incidents = new Module('incidents');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Incidents.register(function(app, auth, database, circles) {

  //We enable routing. By default the Package Object is passed to the routes
  Incidents.routes(app, auth, database, circles);

  //We are adding a link to the main menu for all authenticated users
  Incidents.menus.add({
    title: 'incidents example page',
    link: 'incidents example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Incidents.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Incidents.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Incidents.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Incidents;
});
