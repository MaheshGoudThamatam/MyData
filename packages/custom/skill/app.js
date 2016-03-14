'use strict';

/*
 * Defining the Package Skill
 */
var Module = require('meanio').Module;

var Skill = new Module('skill');
Skill.register(function (app, auth, database, swagger) {

    Skill.routes(app, auth, database);

    Skill.aggregateAsset('css', 'skill.css');
    Skill.aggregateAsset('css', 'badge.css');

    Skill.angularDependencies(['ngTagsInput']);

    swagger.add(__dirname);
    

    return Skill;
});