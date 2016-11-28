'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Holidays = new Module('holidays');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Holidays.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Holidays.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  Holidays.menus.add({
    title: 'holidays example page',
    link: 'holidays example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  Holidays.aggregateAsset('css', 'holidays.css');
  Holidays.angularDependencies(['ui.calendar', 'ui.bootstrap']);

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Holidays.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Holidays.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Holidays.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Holidays;
});
