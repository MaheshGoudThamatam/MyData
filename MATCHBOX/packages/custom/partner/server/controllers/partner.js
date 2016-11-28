'use strict';

/**
 * Module dependencies.
 */

require('../../../role/server/models/role.js');
require('../../../rooms/server/models/rooms.js');
require('../../../search/server/models/search.js');
require('../../../space/server/models/space.js');
require('../../../booking/server/models/booking.js');

var mongoose = require('mongoose');
var User = mongoose.model('User');
var RoleModel = mongoose.model('Role');
var nodemailer = require('nodemailer'), 
config = require('meanio').loadConfig(),
templates = require('../template'), 
randtoken = require('rand-token'),
Mailgen = require('mailgen'),
async = require('async'),
mail = require('../../../../core/system/server/services/mailService.js'),
 _ = require('lodash');

var BookingModel = mongoose.model('Booking'), 
	UserModel = mongoose.model('User'), 
	RoomsModel = mongoose.model('Rooms'), 
	ScheduleModel = mongoose.model('Schedule'),
	SpaceModel = mongoose.model('Space');

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

function deletePartner(req, res, partner){
	async.waterfall([ function(done) {
		var query = {
    		partner: partner
    	};
    	SpaceModel.find(query).exec(function(err, spaces){
    		if(err){
    			return res.status(500).json({
    	            error : 'Cannot load spaces'
    	        });
    		}
            done(null, spaces);
    	});
	}, function (spaceList, done) {
		var spaceDeleteCounter = 0;
		var spaceLength = spaceList.length;
		
		async.eachSeries(spaceList, function(space, callback) {
			var roomDeleteCounter = 0;
			var roomLength = space.rooms.length;
			
			async.eachSeries(space.rooms, function(room, callback1) {
				RoomsModel.remove({ _id: room.roomId}, function(err) {
			    	if (err) {
			    		return res.status(500).json({
			                error: 'Cannot delete the room'
			            });
			        }
			    	roomDeleteCounter++;
			    	if(roomDeleteCounter === roomLength){
			    		space.remove({ _id: space._id}, function(err) {
			    	    	if (err) {
			    	    		return res.status(500).json({
			    	                error: 'Cannot delete the space'
			    	            });
			    	        }
			    	    	ScheduleModel.remove({ spaceId: space._id, $softRemove: false}, function(err) {
			    		    	if (err) {
			    		    		return res.status(500).json({
			    		                error: 'Cannot delete the room'
			    		            });
			    		        }
			    	    	});
			    	    });
			    	}
			    	callback1();
			    });
				
			}, function(err) {
				if(err) {
					return res.status(500).json({
						error: 'Error while deleting room and space.',
						err : err
					});
				} else {
					spaceDeleteCounter++;
					callback();
				}
			});
		}, function(err) {
			if(err) {
				return res.status(500).json({
					error: 'Error while deleting room and space.',
					err : err
				});
			} else {
				done(null, spaceDeleteCounter, spaceLength);
			}
		});
	}, function (spaceDeleteCounter, spaceLength, done) {																																																																																								
		if(spaceDeleteCounter === spaceLength){
	  	  	partner.remove(function (err) {
	            if (err) {
	                return res.status(400).json({
	                    error: 'Cannot delete the partner'
	                });
	            }
	            res.status(200).json({
    	            status: 'Success',
    	            partner: partner
    	        });
	        });
		}
	} ], function(err, result) {
		if(err) {
			return res.status(500).json({
				error: 'Error while deleting Partner. ' + err
			});
		} 
		//res.json(result);
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
	            	console.log('---------------------');
	            	console.log(err);
	            	switch (err.code) {
	                    case 11000:
	                    	return res.status(400).json([{
		                        msg: 'Email id already taken',
		                        param: 'email',
		                        err: err
		                    }]);
		                    break;
	                    // case 11001:
		                   //  return res.status(400).json([{
		                   //      // msg: 'email id already taken',
		                   //      // param: 'email',
		                   //      err: err
		                   //  }]);
		                   //  break;
	                    // case 11002:
	                    // 	return res.status(400).json([{
                     //            msg: 'Username is already taken',
                     //            param: 'first_name',
		                   //      err: err
                     //        }]);
                            // break;
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
		
		                        return res.status(400).json(modelErrors);
		                    }
	                }
	                return res.status(400);
	            }
	            var mailOptions = {
	                to: user.email,
	                from: config.emailFrom
	            };
	            /*mailOptions = templates.partner_email(user, req,token,mailOptions);
	            sendMail(mailOptions);*/
	            
           	    var email = templates.partner_email(user, req,token)
      			mail.mailService(email,user.email)
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
	  	var currentDate = new Date();
		console.log(currentDate);
		currentDate = currentDate.setMinutes(currentDate.getMinutes() + 30);
    	console.log(currentDate);
    	var currentDateTime = new Date(currentDate);
    	console.log(currentDateTime);
    	
		var query = {
			partner : partner,
			bookingDate : {$gt: currentDateTime}
		}
		
		BookingModel.find(query, function(err, bookings){
			if (err) {
        		return res.status(500).json({
                    error: 'Cannot load booking for the room : ' + room,
                    err: err
                });
            } 
			if(bookings.length > 0){
				res.status(500).json({
                    status: 'Failure'
                });
			} else {
				deletePartner(req, res, partner);
			}
		});
  } 
      
  };
};