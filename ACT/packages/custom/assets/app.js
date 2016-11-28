'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Assets = new Module('assets');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Assets.register(function(app, auth, database, circles) {

  //We enable routing. By default the Package Object is passed to the routes
  Assets.routes(app, auth, database, circles);

  //We are adding a link to the main menu for all authenticated users
  Assets.menus.add({
    title: 'assets example page',
    link: 'assets example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Assets.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Assets.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Assets.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  Assets.angularDependencies(['angular-jwt', 'mean.system', 'mean.users', 'ngFileUpload']);

  return Assets;
});
