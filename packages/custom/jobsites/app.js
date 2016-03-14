'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Jobsites = new Module('jobsites');

Jobsites.register(function (app, auth, database, swagger) {
    Jobsites.routes(app, auth, database);

    Jobsites.aggregateAsset('css', 'jobsites.css');

    swagger.add(__dirname);

    return Jobsites;
});
