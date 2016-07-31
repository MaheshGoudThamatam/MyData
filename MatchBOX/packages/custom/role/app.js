'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Role = new Module('role');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Role.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Role.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  Role.menus.add({
    title: 'role example page',
    link: 'role example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  Role.aggregateAsset('css', 'role.css');

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Role.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Role.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Role.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Role;
});
