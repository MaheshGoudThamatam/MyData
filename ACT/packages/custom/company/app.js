'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Company = new Module('company');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Company.register(function(app, auth, database, circles) {

	//We enable routing. By default the Package Object is passed to the routes
	Company.routes(app, auth, database, circles);

	//We are adding a link to the main menu for all authenticated users
	Company.menus.add({
		title: 'company example page',
		link: 'company example page',
		roles: ['authenticated'],
		menu: 'main'
	});

	return Company;
});