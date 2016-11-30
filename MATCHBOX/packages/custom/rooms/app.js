'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Rooms = new Module('rooms');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Rooms.register(function(app, auth, database, swagger) {

  //We enable routing. By default the Package Object is passed to the routes
  Rooms.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  Rooms.menus.add({
    title: 'rooms example page',
    link: 'rooms example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  Rooms.aggregateAsset('css', 'rooms.css');
  Rooms.angularDependencies(['datatables']); 


  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Rooms.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Rooms.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Rooms.settings(function(err, settings) {
        //you now have the settings object
    });
    */
  
  //Only use swagger.add if /docs and the corresponding files exists
  swagger.add(__dirname);

  return Rooms;
});
