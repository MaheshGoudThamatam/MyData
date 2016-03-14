'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Loan = new Module('loan');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Loan.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Loan.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  Loan.menus.add({
    title: 'loan example page',
    link: 'loan example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  Loan.aggregateAsset('css', 'loan.css');

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Loan.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Loan.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Loan.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Loan;
});
