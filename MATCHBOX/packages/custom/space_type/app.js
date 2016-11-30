'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var SpaceType = new Module('space_type');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
SpaceType.register(function(app, auth, database, swagger) {

  //We enable routing. By default the Package Object is passed to the routes
  SpaceType.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  SpaceType.menus.add({
    title: 'spaceType example page',
    link: 'spaceType example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  SpaceType.aggregateAsset('css', 'spaceType.css');
  swagger.add(__dirname);
  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    SpaceType.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    SpaceType.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    SpaceType.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return SpaceType;
});
