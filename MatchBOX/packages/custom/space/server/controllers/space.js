'use strict';

/**
 * Module dependencies.
 */


require('../../../space/server/models/space.js');
require('../../../holidays/server/models/holiday.js');
require('../../../role/server/models/role.js');
require('../../../../core/users/server/models/user.js');
 var notify = require('../../../notification/server/controllers/notify.js');
var mongoose = require('mongoose'),
  SpaceModel = mongoose.model('Space'),
    HolidayModel = mongoose.model('Holiday'),
    UserModel= mongoose.model('User'),
    config = require('meanio').loadConfig(),
     nodemailer = require('nodemailer'), 
    templates = require('../template'), 
     randtoken = require('rand-token'),
    async = require('async'),
    UserModel = mongoose.model('User'),
    RoleModel = mongoose.model('Role'),
    _ = require('lodash');

/**
 * Send email to team member
 */
function sendMail(mailOptions) {
    var transport = nodemailer.createTransport(config.mailer);
    transport.sendMail(mailOptions, function(err, response) {
        if (err) return err;
        return response;
    });
}

module.exports = function(Rooms) {
  return {
    
    /**
	 * Load Space Type
	 */
    space: function(req, res, next, id){
      SpaceModel.load(id, function (err, space) {
              if (err) { return next(err); }
              if (!space) { return next(new Error('Failed to load space ' + id)); }
              req.space = space;
              next();
          });
    },
     user: function(req, res, next, id) {
            UserModel.findOne({
                _id: id
            }).exec(function(err, user) {
                if (err) return next(err);
                if (!user) return next(new Error('Failed to load User ' + id));
                req.user = user;
                next();
            });
        },
    
   /**
	 * list all spaces
	 */
    pagination : function(req, res) {
        var user = req.user;
        /*
		 * if(user.roles.indexOf('admin') === -1) { return
		 * res.status(401).send('User is not authorized'); }
		 */
        SpaceModel.find().populate('teams').populate("partner","").exec(function (err, spaces) {
          if(err) {
            return res.json(err);
          }
          res.json(spaces);
        });
    },
    
    /**
	 * get a specific space
	 */
    get : function(req, res) {
      res.send(req.space);
    },

   
    /**
	 * create a space
	 */
    create: function(req, res) {
      var user = req.user;
      var teams =req.body.teams;
      	/**
		 *  if(user.roles.indexOf('admin') === -1) { return
		 *  res.status(401).send('User is not authorized'); }
		 */
      req.assert('name', 'You must enter a name').notEmpty();
      req.body['admin'] = user;
      delete req.body.teams;
      var space = new SpaceModel(req.body);
      for(var i = 0; i < space.space_holiday.length; i++){
    	  space.space_holiday[i].isNew = true;
      }
      var errors = req.validationErrors();
      if (errors) {
    	  return res.status(400).send("error1");
      }
      var geocodeObj = {};
      var geocoderProvider = 'google';
      var httpAdapter = 'https';
      var extra = {
      serverKey: 'AIzaSyA3mNMJvbJ6MJ3n4KJ4_I0MEDesB1SH4kE',   
          formatter: null                           
      };
      var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter, extra);
      var address = space.address1 + ',' + space.address2 + ',' + space.locality + ',' 
            + space.state + ',' + space.city + ',' + space.postal_code 
            + ',' + space.country;
      geocoder.geocode(address).then(function(response) {
    	  	geocodeObj = response[0];
    	  	space.loc = [geocodeObj.longitude, geocodeObj.latitude];

    	  	var counter = 0;
           	async.each(teams, function (team, callback) {

                    var teamSpace = {
                        role: team.role,
                        first_name: team.first_name,
                        email: team.email,
                        isNew: true
                    };
                    teamSpace.resetPasswordToken = randtoken.generate(16);
                    teamSpace.resetPasswordExpires = (Date.now() / 1000 | 0) + 60 * 60;
                    
                    var spaceTeam = new UserModel(teamSpace);
                    spaceTeam.save(function (err, teamuser) {
	                    if (err) {
	                    	console.log(err);
	                        switch (err.code) {
	                        	case 11000:
	                        	case 11001:
	                        		res.status(400).json([{
	                        			msg: 'Username already taken',
	                        			param: 'first_name'
	                        		}]);
	                        	case 11002:
	                        		res.status(400).json([{
	                        			msg: 'Email id already exists',
	                        			param: 'email'
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
	                  } else {
	                	  space.teams.push(teamuser._id);
	                	  counter++;
	                  }
	                  if(counter == teams.length){
	                      space.save(function(err) {
  	                          if (err) {
  	                        	  return res.status(400).json(err);
  	                          }
                              console.log(space);
  	                          RoleModel.findOne({"name":"Admin"},function(err,role){
                                  if(err)
                                  {
                                    logger.log('error', 'GET '+req._parsedUrl.pathname+'Checking for admin login'+err+''); 
                                  }
                                  else
                                  {
                                      console.log("inside role else");
                                      UserModel.find({
                                           role : { "$in" : [role._id] }
                                        }, function(err, users) {
                                            async.each(users, function (user, callback) {
                                            notify.addNotificationURL('Space added',space.name +' Space has been added.',user,'/admin/space');
                                            callback();
                                          });
                                      });
                                  }
                                });   
	                    	 var token = randtoken.generate(8);
		                    //  var token = 'welcome123';
		                      spaceTeam.password = token;
		                      spaceTeam.isPasswordUpdate = true;
		                      //spaceTeam.isUserConfirmed = true;
		                      spaceTeam.isPasswordUpdate=true;
		                      spaceTeam.profileUpdated=true;
		                      var mailOptions = {
		                    	  to: spaceTeam.email,
		                    	  from: config.emailFrom
		                      };
		                      mailOptions = templates.team_email(spaceTeam, req, token, spaceTeam.resetPasswordToken, mailOptions);
		                      sendMail(mailOptions);  

		                      SpaceModel.findOne({_id: space._id}).populate('teams').exec(function (err, space) {
		                          if(err) {
		                        	  return res.json(err);
		                          }
		                          res.json(space);
		                      });   
  	                     });
	                 }
                 });
              });
         }).catch(function(err) {
        	 res.status(400).send(err);
         });
    },

    /**
	 * update a space
	 */
    update : function(req, res) {
        var user = req.user;
        var space = req.space;
        var teams = [];
        for(var i = 0; i < req.body.teams.length; i++){
        	if(!req.body.teams[i]._id){
        		teams.push(req.body.teams[i]);
        		req.body.teams.splice(i, 1);
        	}
        }
        // team is assigned to a variable so as to update the team members
        var teamList = req.body.teams;
        var counter;
        for(var i = 0; i < space.teams.length; i++){
        	counter = 0;
        	for(var j = 0; j < req.body.teams.length; j++){
	        	if(JSON.stringify(space.teams[i]) === JSON.stringify(req.body.teams[j]._id)){
	        		break;
	        	} else {
	        		counter++;
	        	}
        	}
        	if(counter === req.body.teams.length){
        		space.teams.splice(i, 1);
        	}
        }
        delete req.body.teams;
        
        space = _.extend(space, req.body);
        var errors = req.validationErrors();
        if (errors) {
            return res.status(400).send(errors);
        }
        var geocodeObj = {};
        var geocoderProvider = 'google';
        var httpAdapter = 'https';
        var extra = {
        serverKey: 'AIzaSyA3mNMJvbJ6MJ3n4KJ4_I0MEDesB1SH4kE',   
            formatter: null                           
        };
        var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter, extra);
        var address = space.address1 + ',' + space.address2 + ',' + space.locality + ',' 
              + space.state + ',' + space.city + ',' + space.postal_code 
              + ',' + space.country;
        geocoder.geocode(address).then(function(response) {
      	  	geocodeObj = response[0];
      	  	space.loc = [geocodeObj.longitude, geocodeObj.latitude];

      	  	var counter = 0;
      	  		if(teams.length === 0){
	      	  		space.save(function(err) {
	                    if (err) {
	                    	return res.status(400).json(err);
	                    } 
	                    res.json(space);    
	                });
      	  		}
             	async.each(teams, function (team, callback) {

                      var teamSpace = {
                          role: team.role,
                          first_name: team.first_name,
                          email: team.email,
                          isNew: true
                      };
                      teamSpace.resetPasswordToken = randtoken.generate(16);
                      teamSpace.resetPasswordExpires = (Date.now() / 1000 | 0) + 60 * 60;
                       var spaceTeam = new UserModel(teamSpace);
                      spaceTeam.save(function (err, teamuser) {
  	                    if (err) {
  	                    	console.log(err);
  	                        switch (err.code) {
  	                        	case 11000:
  	                        	case 11001:
  	                        		res.status(400).json([{
  	                        			msg: 'Username already taken',
  	                        			param: 'first_name'
  	                        		}]);
  	                        	case 11002:
  	                        		res.status(400).json([{
  	                        			msg: 'Email id already exists',
  	                        			param: 'email'
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
  	                  } else {
  	                	  space.teams.push(teamuser._id);
  	                	  counter++;
  	                  }
  	                  if(counter == teams.length){
  	                      space.save(function(err) {
  	                          if (err) {
  	                        	  return res.status(400).json(err);
  	                          }
  	                           
	                    	 // var token = randtoken.generate(4); 
		                      var token = 'welcome123';
		                      spaceTeam.password = token;
		                      spaceTeam.isPasswordUpdate = true;
		                      spaceTeam.isUserConfirmed = true;
		                      spaceTeam.isPasswordUpdate=true;
		                      spaceTeam.profileUpdated=true;
		                      var mailOptions = {
		                    	  to: spaceTeam.email,
		                    	  from: config.emailFrom
		                      };
		                      mailOptions = templates.team_email(spaceTeam, req, token, spaceTeam.resetPasswordToken, mailOptions);
		                      sendMail(mailOptions); 
		                      SpaceModel.findOne({_id: space._id}).populate('teams').exec(function (err, space) {
		                          if(err) {
		                        	  return res.json(err);
		                          }
		                          res.json(space);
		                      //res.json(space);    
  	                     });
  	                    });
  	                  }
                   });
                });
             	
           }).catch(function(err) {
          	 res.status(400).send(err);
           });
    },
    
    /**
	 * delete a space
	 */
    delete : function(req, res) {
        var user = req.user;
        var space = req.space;
        /*
		 * if(user.roles.indexOf('admin') === -1) { return
		 * res.status(401).send('User is not authorized'); }
		 */
        space.remove({ _id: req.space._id}, function(err) {
        	if (err) {
        		return res.status(500).json({
                    error: 'Cannot delete the space'
                });
            }
        	res.json(space);
        });
    },
    
    loadPartners: function(req, res){
      var userType = req.query.userType;
      var query = {
        'name' : new RegExp('^' + userType + '$', "i")
      };
      RoleModel.findOne(query, function(err, role) {
      if (err) {
        return res.status(500).json({
          error : 'Cannot load role'
        });
      }
      query = {};
      query.role = { 
        $in: [role._id]
      }
      UserModel.find(query).exec(function(err, partners){
        if (err) {
          return res.status(500).json({
            error : 'Cannot load partners'
          });
        }
        res.json(partners);
      })
    });
    },
    
    loadPartnersSpace: function(req, res){
    	var query = {
    		partner: req.user._id	
    	};
    	SpaceModel.find(query).populate("teams").exec(function(err, spaces){
    		if(err){
    			return res.status(500).json({
    	            error : 'Cannot load spaces'
    	        });
    		}
    		res.json(spaces);
    	});
    },
    
    getSpaceAddress: function(req, res){
    	var query = {};
    	query.partner = req.user._id;
    	SpaceModel.find(query).populate("teams").exec(function(err, spacesByPartner){
    		if(err){
    			return res.status(500).json({
    	            error : 'Cannot load spaces'
    	        });
    		}
    		if(spacesByPartner.length === 0){
    			query = {
    				back_office: {
    					$in: [req.user._id]
    				}	
    			}
    			SpaceModel.find(query).populate("teams").exec(function(err, spacesByBackOffice){
    	    		if(err){
    	    			return res.status(500).json({
    	    	            error : 'Cannot load spaces'
    	    	        });
    	    		}
    	    		if(spacesByBackOffice.length === 0){
    	    			query = {
    	    				front_office: {
    	    					$in: [req.user._id]
    	    				}	
    	    			}
    	    			SpaceModel.find(query).populate("teams").exec(function(err, spacesByFrontOffice){
    	    	    		if(err){
    	    	    			return res.status(500).json({
    	    	    	            error : 'Cannot load spaces'
    	    	    	        });
    	    	    		}
    	    	    		res.json(spacesByFrontOffice);
    	    	    	});
    	    		} else {
    	    			res.json(spacesByBackOffice);
    	    		}
    	    	});
    		} else {
    			res.json(spacesByPartner);
    		}
    	});
    },
    
  };
};