'use strict';

var config = require('meanio').loadConfig();
var jwt = require('jsonwebtoken'); //https://npmjs.org/package/node-jsonwebtoken

module.exports = function(MeanUser, app, auth, database, passport, System) {
    var configuration = require('../../../../custom/actsec/server/config/config.js');

    // User routes use users controller
    var users = require('../controllers/users')(MeanUser);
    app.use(users.loadUser);
    //setting up  user object.
    var setRoleObject = function(req, res, next) {
        req.feature = configuration.features.USER;
        next();
    };
    // Initialize the database connection for the database of the company of the user.
    var index = require('../../../../contrib/meanio-system/server/controllers/index')(System);
    app.use(index.initCompanyDb);

    var authentication = function(req, res, next) {
        if (!req.user) {
            return res.status(401).send('User is unauthorized to access this page.');
        } else {
            next();
        }
    };

    app.route('/api/logout')
        .get(users.signout);
    app.route('/api/users/me')
        .get(users.me);
    /*    app.route('/api/users/xls')
        .get(users.testxls);*/

    app.route('/api/permissions')
        .get(users.permissions);
    app.route('/api/users/bulkupload')
        .post(users.bulkUploadUsers);
    app.route('/api/users/getTemplate')
        .get(users.downloadXLSX);

    app.route('/api/userInfo')
        .get(users.getUserInfo);
    // User API
    app.route('/api/users')
        .post(setRoleObject, auth.create, auth.checkPermission, users.createUser)
        .get(setRoleObject, auth.read, auth.checkPermission, users.allUser);

    app.route('/api/users/:createuserId')
        .get(setRoleObject, auth.read, auth.checkPermission, users.showUser)
        .put(setRoleObject, auth.update, auth.checkPermission, users.updateUser)
        .delete(setRoleObject, auth.delete, auth.checkPermission, users.deleteUser);

    app.route('/api/changepassword')
        .post(users.updatePassword);

    app.route('/api/user/updateTraining')
        .put(users.updateUserTraining);

    app.param('createuserId', users.user);

    // Setting up the userId param
    app.param('userId', users.user);

    //based on locations fetch buildings 
    app.route('/api/userlocation')
        .get(users.buildingBasedOnLocation);

    //location and building based on user database
    app.route('/api/user/locationandbuilding')
        .get(users.userLocationAndBuilding);

    //Current User
    app.route('/api/user')
        .get(users.fetchUser)
        .post(users.updateUserProfile);

    // AngularJS route to check for authentication
    app.route('/api/loggedin').get(users.loggedin);

    //Profile Image Upload api
    app.route('/api/profile/imageUpload')
        .post(auth.checkLogin, users.saveProfileImage);

    if (config.strategies.local.enabled) {
        // Setting up the users api
        app.route('/api/register')
            .post(users.create);

        app.route('/api/forgot-password')
            .post(users.forgotpassword);

        app.route('/api/reset/:token')
            .post(users.resetpassword);

        // Setting the local strategy route
        app.route('/api/login')
            .post(passport.authenticate('local', {
                failureFlash: false
            }), function(req, res) {
                var payload = req.user;
                payload.redirect = req.body.redirect;
                var escaped = JSON.stringify(payload);
                escaped = encodeURI(escaped);
                // We are sending the payload inside the token
                var token = jwt.sign(escaped, config.secret);
                MeanUser.events.publish({
                    action: 'logged_in',
                    user: {
                        name: req.user.name
                    }
                });
                res.json({
                    token: token,
                    redirect: config.strategies.landingPage
                });
            });
    }

    // AngularJS route to get config of social buttons
    app.route('/api/get-config')
        .get(function(req, res) {
            // To avoid displaying unneccesary social logins
            var strategies = config.strategies;
            var configuredApps = {};
            for (var key in strategies) {
                if (strategies.hasOwnProperty(key)) {
                    var strategy = strategies[key];
                    if (strategy.hasOwnProperty('enabled') && strategy.enabled === true) {
                        configuredApps[key] = true;
                    }
                }
            }
            res.send(configuredApps);
        });

    if (config.strategies.facebook.enabled) {
        // Setting the facebook oauth routes
        app.route('/api/auth/facebook')
            .get(passport.authenticate('facebook', {
                scope: ['email', 'user_about_me'],
                failureRedirect: '/auth/login',
            }), users.signin);

        app.route('/api/auth/facebook/callback')
            .get(passport.authenticate('facebook', {
                failureRedirect: '/auth/login',
            }), users.authCallback);
    }

    if (config.strategies.github.enabled) {
        // Setting the github oauth routes
        app.route('/api/auth/github')
            .get(passport.authenticate('github', {
                failureRedirect: '/auth/login'
            }), users.signin);

        app.route('/api/auth/github/callback')
            .get(passport.authenticate('github', {
                failureRedirect: '/auth/login'
            }), users.authCallback);
    }

    if (config.strategies.twitter.enabled) {
        // Setting the twitter oauth routes
        app.route('/api/auth/twitter')
            .get(passport.authenticate('twitter', {
                failureRedirect: '/auth/login'
            }), users.signin);

        app.route('/api/auth/twitter/callback')
            .get(passport.authenticate('twitter', {
                failureRedirect: '/auth/login'
            }), users.authCallback);
    }

    if (config.strategies.google.enabled) {
        // Setting the google oauth routes
        app.route('/api/auth/google')
            .get(passport.authenticate('google', {
                failureRedirect: '/auth/login',
                scope: [
                    'https://www.googleapis.com/auth/userinfo.profile',
                    'https://www.googleapis.com/auth/userinfo.email'
                ]
            }), users.signin);

        app.route('/api/auth/google/callback')
            .get(passport.authenticate('google', {
                failureRedirect: '/auth/login'
            }), users.authCallback);
    }

    if (config.strategies.linkedin.enabled) {
        // Setting the linkedin oauth routes
        app.route('/api/auth/linkedin')
            .get(passport.authenticate('linkedin', {
                failureRedirect: '/auth/login',
                scope: ['r_emailaddress']
            }), users.signin);

        app.route('/api/auth/linkedin/callback')
            .get(passport.authenticate('linkedin', {
                failureRedirect: '/auth/login'
            }), users.authCallback);
    }

};