'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var PlugNplay = new Module('plugNplay');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
PlugNplay.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  PlugNplay.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  PlugNplay.menus.add({
    title: 'plugNplay example page',
    link: 'plugNplay example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  PlugNplay.aggregateAsset('css', 'plugNplay.css');

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    PlugNplay.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    PlugNplay.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    PlugNplay.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return PlugNplay;
});
