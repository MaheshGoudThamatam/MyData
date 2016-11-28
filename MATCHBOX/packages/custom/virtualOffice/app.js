'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var VirtualOffice = new Module('virtualOffice');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
VirtualOffice.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  VirtualOffice.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  VirtualOffice.menus.add({
    title: 'virtualOffice example page',
    link: 'virtualOffice example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  VirtualOffice.aggregateAsset('css', 'virtualOffice.css');

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    VirtualOffice.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    VirtualOffice.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    VirtualOffice.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return VirtualOffice;
});
