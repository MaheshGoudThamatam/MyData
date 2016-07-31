'use strict';

/**
 * Module dependencies.
 */

require('../../../role/server/models/role.js')

var mongoose = require('mongoose');
var User = mongoose.model('User');
var RoleModel = mongoose.model('Role');
var nodemailer = require('nodemailer'), 
config = require('meanio').loadConfig(),
templates = require('../template'), 
randtoken = require('rand-token'),
 _ = require('lodash');

/**
 * Send email to partner
 */
function sendMail(mailOptions) {
    var transport = nodemailer.createTransport(config.mailer);
    transport.sendMail(mailOptions, function(err, response) {
        if (err) return err;
        return response;
    });
}

module.exports = function(Partner) {
  return {
	  
	  partner: function(req, res, next, id){
		  User.load(id, function(err, partner){
			  if(err){
				  console.log(err);
			  }
			  req.partner = partner;
			  next();
		  })
	  },
      /**
		 * list all partners
		 */
      list : function(req, res) {
        var _user = req.user;
        // if we do not have admin or partner role return here.
        /*if(_user.roles.indexOf('admin') === -1) {
          return res.status(401).send('User is not authorized for this action');
        }*/
        var name = 'partner';
        var query = {'name': new RegExp('^'+name+'$', "i")};
    	RoleModel.findOne(query, function(err, role) {
    		query = {
    			role : 	{'$in' : [role._id]}
    		};
	        User.find(query).exec(function(err, partners) {
	          if (err)  {
	            return res.json(err);
	          }
	          if(!partners) {
	            return res.json({ "error": "unable to find partners"});
	          }
	          // send all users having partner role
	          return res.json(partners);
	        });
    	});
      },
      /**
		 * get a specific partner
		 */
      get : function(req, res) {
        var _user = req.user;
        /*
		 * if(_user.roles.indexOf('admin') === -1) { return
		 * res.status(401).send('User is not authorized for this action'); }
		 */
        User.findById(req.params.id).exec(function(err, user) {
          if (err)  {
            return res.json(err);
          }
          if(!user) {
            return res.json({ "error": "unable to find partner"});
          }
          return res.json(user);
        });
      },
      /**
		 * add a partner
		 */
      create: function(req, res) {
        var _user = req.user;
        /*if(_user.roles.indexOf('admin') === -1) {
          return res.status(401).send('User is not authorized for this action');
        }*/
        var user = new User(req.body);
        user.provider = 'local';

        // because we set our user.provider to local our models/user.js
		// validation will always be true
       // req.assert('name', 'You must enter a name').notEmpty();
        req.assert('email', 'You must enter a valid email address').isEmail();
        var errors = req.validationErrors();
        if (errors) {
          return res.status(400).send(errors);
        }

        // Hard coded for now. Will address this with the user permissions
		// system in v0.3.5
        user.roles = ['authenticated'];
        var name = 'partner';
        var query = {'name': new RegExp('^'+name+'$', "i")};
    	RoleModel.findOne(query, function(err, role) {
    	//user.role.push(role._id);
       	  var token = randtoken.generate(8);
          //  var token = 'welcome123';
            user.password = token;
            user.isPasswordUpdate = true;
            user.isUserConfirmed = true;
            user.isPasswordUpdate=true;
            user.profileUpdated=true;
            user.role.push(role._id);
	        user.save(function(err) {
	            if (err) {
	                switch (err.code) {
	                    case 11000:
	                    case 11001:
	                    res.status(400).json([{
	                        msg: 'email id already taken',
	                        param: 'email'
	                    }]);
                      case 11002:
                              res.status(400).json([{
                                msg: 'username is already taken',
                                param: 'first_name'
                              }]);
	                    break;
	                    default:
	                    var modelErrors = [];
	
	                    if (err.errors) {
	
	                        for (var x in err.errors) {
	                            modelErrors.push({
	                                param: x,
	                                msg: err.errors[x].message,
	                                value: err.errors[x].value
	                            });
	                        }
	
	                        res.status(400).json(modelErrors);
	                    }
	                }
	                return res.status(400);
	            }
	            var mailOptions = {
	                to: user.email,
	                from: config.emailFrom
	            };
	            mailOptions = templates.partner_email(user, req,token,mailOptions);
	            sendMail(mailOptions);
	            return res.status(200).send(user);
	        });
    	});
      },
      /**
		 * update a partner
		 */
      update : function(req, res) { 
        var partner = req.partner;
        var partner = _.extend(partner, req.body);
        
        partner.save(function (err) {
                 if (err) {
                  switch (err.code) {
                      case 11000:
                      case 11001:
                      case 11002:
                              res.status(400).json([{
                                msg: 'username is already taken',
                                param: 'first_name'
                              }]);
                      break;
                      default:
                      var modelErrors = [];
  
                      if (err.errors) {
  
                          for (var x in err.errors) {
                              modelErrors.push({
                                  param: x,
                                  msg: err.errors[x].message,
                                  value: err.errors[x].value
                              });
                          }
  
                          res.status(400).json(modelErrors);
                      }
                  }
                  return res.status(400);
              }
            res.json(partner);
        });
    
      },
      
      /**
		 * delete a partner
		 */
      delete : function(req, res) {
    	  var partner = req.partner;

    	  partner.remove(function (err) {
              if (err) {
                  return res.status(400).json({
                      error: 'Cannot delete the partner'
                  });
              }
              res.json(partner);
          });
      } 
  };
};