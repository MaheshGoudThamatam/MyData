'use strict';

/*
 * Defining the Package Branch
 */
var Module = require('meanio').Module;

var Branch = new Module('branch');

Branch.register(function (app, auth, database, swagger) {
    //We enable routing. By default the Package Object is passed to the routes
    Branch.routes(app, auth, database);

    Branch.aggregateAsset('css', 'branch.css');

    Branch.angularDependencies(['ngTagsInput']);

    swagger.add(__dirname);

    return Branch;
});
