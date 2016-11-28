'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Search = new Module('search');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Search.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Search.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  Search.menus.add({
    title: 'search example page',
    link: 'search example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  Search.aggregateAsset('css', 'search.css');
  

  // Search.angularDependencies(['ui.bootstrap','ngAnimate']);
  Search.angularDependencies(['daterangepicker']);

  //Search.angularDependencies(['ngMap','ngFileUpload','datetimepicker','angucomplete-alt']);


  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Search.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Search.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Search.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Search;
});
