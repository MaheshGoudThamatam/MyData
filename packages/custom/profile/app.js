'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Profile = new Module('profile');

Profile.register(function (app, auth, database, swagger) {

    Profile.routes(app, auth, database);

    Profile.aggregateAsset('css', 'profile.css');
    Profile.aggregateAsset('css', 'mentor.css');
    Profile.aggregateAsset('css', 'student-profile.css');
    Profile.aggregateAsset('css', 'messages.css');
    Profile.aggregateAsset('css', 'media.css');
    Profile.aggregateAsset('css', 'leftpanel.css');
    Profile.aggregateAsset('css', 'tag.css');

    Profile.angularDependencies(['ngFileUpload', 'ngTagsInput']);



    swagger.add(__dirname);

    return Profile;
});
