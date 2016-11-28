'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Securitytasks = new Module('securitytasks');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Securitytasks.register(function(app, auth, database, circles) {

  //We enable routing. By default the Package Object is passed to the routes
  Securitytasks.routes(app, auth, database, circles);

  //We are adding a link to the main menu for all authenticated users
  Securitytasks.menus.add({
    title: 'securitytasks example page',
    link: 'securitytasks example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Securitytasks.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Securitytasks.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Securitytasks.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Securitytasks;
});
