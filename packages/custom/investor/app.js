'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Investor = new Module('investor');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Investor.register(function(app, auth, database, swagger) {

  //We enable routing. By default the Package Object is passed to the routes
  Investor.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  Investor.menus.add({
    title: 'investor example page',
    link: 'investor example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  Investor.aggregateAsset('css', 'investor.css');

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Investor.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Investor.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Investor.settings(function(err, settings) {
        //you now have the settings object
    });
    */
   swagger.add(__dirname);
  return Investor;
});
