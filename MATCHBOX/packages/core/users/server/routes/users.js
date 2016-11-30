'use strict';

var config = require('meanio').loadConfig();
var jwt = require('jsonwebtoken'); //https://npmjs.org/package/node-jsonwebtoken
var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports = function(MeanUser, app, auth, database, passport) {

  // User routes use users controller
  var users = require('../controllers/users')(MeanUser);

  app.route('/api/logout')
    .get(users.signout);
  app.route('/api/users/me')
    .get(users.me);
  
  app.route('/api/fetch/user/:userId')
	.get(users.fetchUser);

  app.put('/api/change-password', auth.requiresLogin, users.changePassword)
  // Setting up the userId param
  app.param('userId', users.user);

  // AngularJS route to check for authentication
  app.route('/api/loggedin')
    .get(function(req, res) {
      if (!req.isAuthenticated()) return res.send('0');
      auth.findUser(req.user._id, function(user) {
        res.send(user ? user : '0');
      });
  });
    
  // for uploading images
  app.put('/api/upload/image', users.upload_image)

  if(config.strategies.local.enabled)
  {
      // Setting up the users api
      app.route('/api/register')
        .post(users.create);

      // update a user profile
      app.route('/api/user/:userId/update')
        .put(users.update);
      
      app.route('/api/registerSocial/accounts').post(users.createSocial);
      
      app.route('/api/forgot-password')
        .post(users.forgotpassword);

      app.route('/api/reset/:token')
        .post(users.resetpassword);
      
      app.route('/api/user/updateProfile')
      	.post(users.updateProfile);

      // user email confirmation.
      app.route('/api/confirm/:token').get(users.confirmUser); 
      // Setting the local strategy route
      app.post('/api/login', function (req, res, next) {
    	  console.log(req.body);
          passport.authenticate('local', function (err, user, info) {
              if (err) {
                  return next(err)
              }
              if (!user) {
                  return res.status(401).json(info);
              }
              //user has authenticated correctly thus we create a JWT token
              User.findOne({
                  _id: user.id
              }).populate('role').exec(function (err, user) {
                  if (err) {
                      return next(err);
                  }
                  var payload = user;

                  var escaped = JSON.stringify(payload);
                  escaped = encodeURI(escaped);
                  // We are sending the payload inside the token
                  var token = jwt.sign(escaped, config.secret, { expiresInMinutes: 60 * 5 });
                  MeanUser.events.publish({
                      action: 'logged_in',
                      user: {
                          name: user.name
                      }
                  });
                  res.json({ 
                	  token: token,
                      redirect: req.body.redirect || config.strategies.landingPage 
                  });
              });
          })(req, res, next);
      });
  }

  // AngularJS route to get config of social buttons
  app.route('/api/get-config')
    .get(function (req, res) {
      // To avoid displaying unneccesary social logins
      var strategies = config.strategies;
      var configuredApps = {};
      for (var key in strategies)
      {
        if(strategies.hasOwnProperty(key))
        {
          var strategy = strategies[key];
          if (strategy.hasOwnProperty('enabled') && strategy.enabled === true) {
            configuredApps[key] = true ;
          }
        }
      }
      res.send(configuredApps);
    });

  if(config.strategies.facebook.enabled)
  {
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
  if(config.strategies.google.enabled)
  {
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

  if(config.strategies.github.enabled)
  {
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
  if(config.strategies.twitter.enabled)
  {    
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

  if(config.strategies.linkedin.enabled)
  {
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
