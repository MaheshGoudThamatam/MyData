'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var PromoCode = new Module('promo_code');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
PromoCode.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  PromoCode.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  PromoCode.menus.add({
    title: 'promoCode example page',
    link: 'promoCode example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  PromoCode.aggregateAsset('css', 'promoCode.css');

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    PromoCode.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    PromoCode.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    PromoCode.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return PromoCode;
});
