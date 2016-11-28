'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Partner = new Module('partner');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Partner.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Partner.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  Partner.menus.add({
    title: 'partner example page',
    link: 'partner example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  Partner.aggregateAsset('css', 'partner.css');

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Partner.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Partner.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Partner.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Partner;
});
