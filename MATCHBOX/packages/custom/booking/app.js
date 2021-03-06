'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Booking = new Module('booking');
var cron = require('node-cron');
var bookingController = require('./server/controllers/booking.js')(Booking);

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Booking.register(function(app, auth, database, swagger) {

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

  //Only use swagger.add if /docs and the corresponding files exists
   swagger.add(__dirname);
  
   // For every 1 minute.
   cron.schedule('*/1 * * * *', function(){
	  console.log('_________________________________________________________________________________________________');
      console.log('|     Running BOOKING FAILURE CRON - ' + new Date() +'                     |'); 
      console.log('|________________________________________________________________________________________________|');
      bookingController.bookingFailureCron();
   });
   
   // For every single day (at 6 P.M).
   /*cron.schedule('* * 18 * *', function(){
      bookingController.bookingReviewCron();
   });*/

  return Booking;
});
