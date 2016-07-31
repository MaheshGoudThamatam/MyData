'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Booking = new Module('booking');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Booking.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Booking.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  Booking.menus.add({
    title: 'booking example page',
    link: 'booking example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  Booking.aggregateAsset('css', 'booking.css');

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Booking.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Booking.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Booking.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Booking;
});
