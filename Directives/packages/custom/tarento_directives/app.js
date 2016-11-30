'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var TarentoDirectives = new Module('tarento_directives');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
TarentoDirectives.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  TarentoDirectives.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  TarentoDirectives.menus.add({
    title: 'tarentoDirectives example page',
    link: 'tarentoDirectives example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  TarentoDirectives.aggregateAsset('css', 'tarentoDirectives.css');

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    TarentoDirectives.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    TarentoDirectives.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    TarentoDirectives.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return TarentoDirectives;
});
