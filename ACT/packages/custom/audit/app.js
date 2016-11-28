'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Audit = new Module('audit');


/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Audit.register(function(app, auth, database, circles) {

    //We enable routing. By default the Package Object is passed to the routes
    Audit.routes(app, auth, database, circles);

    Audit.angularDependencies(['mean.system', 'mean.users', 'ngFileUpload', 'ntt.TreeDnD']);
    

    return Audit;
});