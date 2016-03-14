'use strict';

/*
 * Defining the Package Role
 */
var Module = require('meanio').Module;

var Role = new Module('role');

Role.register(function (app, auth, database, swagger) {

    Role.routes(app, auth, database);

    Role.aggregateAsset('css', 'role.css');

    swagger.add(__dirname);

    return Role;
});
