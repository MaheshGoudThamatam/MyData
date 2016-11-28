'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var CalendarScheduler = new Module('calendar-scheduler');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
CalendarScheduler.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  CalendarScheduler.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  CalendarScheduler.menus.add({
    title: 'calendarScheduler example page',
    link: 'calendarScheduler example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  CalendarScheduler.aggregateAsset('css', 'calendarScheduler.css');
  
  CalendarScheduler.angularDependencies(['daterangepicker']);

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    CalendarScheduler.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    CalendarScheduler.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    CalendarScheduler.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return CalendarScheduler;
});
