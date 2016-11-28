'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Socket = new Module('socket');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Socket.register(function(app, auth, database, circles, io) {

	var SocketCtrl = require('./server/controllers/socket')(Socket, io);
	SocketCtrl.init();

	//We enable routing. By default the Package Object is passed to the routes
	Socket.routes(app, auth, database, circles, io);

	//We are adding a link to the main menu for all authenticated users
	Socket.angularDependencies(['btford.socket-io']);

	return Socket;
});