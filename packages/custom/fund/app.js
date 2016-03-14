'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Fund = new Module('fund');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Fund.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Fund.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  Fund.menus.add({
    title: 'fund example page',
    link: 'fund example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  Fund.aggregateAsset('css', 'fund.css');

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Fund.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Fund.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Fund.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Fund;
});
