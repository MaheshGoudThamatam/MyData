'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Space = new Module('space');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Space.register(function(app, auth, database, swagger) {

  //We enable routing. By default the Package Object is passed to the routes
  Space.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  Space.menus.add({
    title: 'space example page',
    link: 'space example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  Space.aggregateAsset('css', 'space.css');

  //Space.angularDependencies(['cleave.js']);
  
  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Space.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Space.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Space.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  //Only use swagger.add if /docs and the corresponding files exists
  swagger.add(__dirname);

  return Space;
});
