'use strict';

/*
 * Defining the Package Onlinetest
 */
var Module = require('meanio').Module;

var Onlinetest = new Module('onlinetest');

Onlinetest.register(function (app, auth, database, swagger) {

    Onlinetest.routes(app, auth, database);

    Onlinetest.aggregateAsset('css', 'onlinetest.css');

    swagger.add(__dirname);

    return Onlinetest;
});
