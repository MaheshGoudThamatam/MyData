'use strict';

/*
 * Defining the Package Mentor
 */
var Module = require('meanio').Module;

var Mentor = new Module('mentor');

Mentor.register(function (app, auth, database, swagger) {

    Mentor.routes(app, auth, database);

    Mentor.aggregateAsset('css', 'mentor.css');
    //Mentor.angularDependencies(['materialDatePicker']);

    swagger.add(__dirname);

    return Mentor;
});
