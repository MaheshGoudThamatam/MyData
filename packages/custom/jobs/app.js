'use strict';
/*
 * Defining the Package Jobs
 */
var Module = require('meanio').Module;
var Jobs = new Module('jobs');

Jobs.register(function(app, auth, database, swagger) {
    //We enable routing. By default the Package Object is passed to the routes
    Jobs.routes(app, auth, database);

    Jobs.aggregateAsset('css', 'jobs.css');
    Jobs.angularDependencies(['ngFileUpload','angucomplete-alt']);

    swagger.add(__dirname);

    return Jobs;
});