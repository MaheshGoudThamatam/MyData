'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Curriculum = new Module('curriculum');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Curriculum.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Curriculum.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  Curriculum.menus.add({
    title: 'curriculum example page',
    link: 'curriculum example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  Curriculum.aggregateAsset('css', 'curriculum.css');

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Curriculum.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Curriculum.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Curriculum.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Curriculum;
});
