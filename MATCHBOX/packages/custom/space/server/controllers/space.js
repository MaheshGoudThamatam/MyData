'use strict';

/**
 * Module dependencies.
 */


require('../../../space/server/models/space.js');
require('../../../space/server/models/review.js');
require('../../../booking/server/models/booking.js');
require('../../../holidays/server/models/holiday.js');
require('../../../role/server/models/role.js');
require('../../../../core/users/server/models/user.js');
require('../../../rooms/server/models/rooms.js');
require('../../../space_type/server/models/space_types.js');
require('../../../search/server/models/search.js');
 var notify = require('../../../notification/server/controllers/notify.js');
var mongoose = require('mongoose'),
  SpaceModel = mongoose.model('Space'),
  SpaceTypeModel = mongoose.model('SpaceType'),
  ReviewModel = mongoose.model('Review'),
  BookingModel = mongoose.model('Booking'),
    HolidayModel = mongoose.model('Holiday'),
    UserModel= mongoose.model('User'),
    RoomsModel= mongoose.model('Rooms'),
    config = require('meanio').loadConfig(),
     nodemailer = require('nodemailer'), 
    templates = require('../template'), 
     randtoken = require('rand-token'),
    async = require('async'),
    UserModel = mongoose.model('User'),
    RoleModel = mongoose.model('Role'),
    Mailgen = require('mailgen'),
    mail = require('../../../../core/system/server/services/mailService.js'),
  logger = require('../../../../core/system/server/controllers/logs.js'),
  ScheduleModel = mongoose.model("Schedule"),
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

/**
 * Update the space with the aggregated rating
 */
function updateSpaceRating(spaceId, reviewId) {
	SpaceModel.load(spaceId, function(err, space) {
		if(err) {
			// Log the error. TODO: Replace console.log with logger.
			console.log('Rating aggregation failed for review: ' + reviewId + '[Error: ' + err + ']');
		} else if(!space) {
			// Log the error. TODO: Replace console.log with logger.
			console.log('Rating aggregation failed for review: ' + reviewId + '[Error: ' + err + ']');
		} else {
			ReviewModel.aggregate([{
				$match: {
					space: space._id
				}
			}, {
				$group: {
					_id: "$space",
					avgRating: {
						$avg: "$rating"
					}
				}
			}]).exec(function(err, review) {
				space.rating = Math.round(review[0].avgRating);
				space.save(function(err, updatedSpace) {
					if(err) {
						// Log the error. TODO: Replace console.log with logger.
						console.log('Rating aggregation failed for review: ' + reviewId + '[Error: ' + err + ']');
					} else if(!space) {
						// Log the error. TODO: Replace console.log with logger.
						console.log('Rating aggregation failed for review: ' + reviewId + '[Error: ' + err + ']');
					} else {
						// Successfully updated the space object asynchronously,
						// the server has already sent the response for
						// creating/updating the review.
						// console.log(updatedSpace);
					}
				});
			});
		}
	});
}

/**
 * Delete Room if Space is deleted only if active bookings are not there
 */
function deleteSpaceRoom(req, res, space){
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
	    		space.remove({ _id: req.space._id}, function(err) {
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
	    	    	res.json({
	    	            status: 'Success',
	    	            space: space
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
		}
	});
}

function officeHourScheduleHoursMinutes(officeHourSchedule){
	var timeZoneOffset = -330;
	var spaceOfficeHourTimingSchedule = [];
	var hrsStart, minStart, hrsEnd, minEnd;
	
    for(var i = 0; i < officeHourSchedule.length; i++){
    	var spaceOfficeHourTimingScheduleObj = {};
    	spaceOfficeHourTimingScheduleObj.day = officeHourSchedule[i].day;
    	if(!officeHourSchedule[i].isClosed){
	    	var offsetStartTime = new Date(officeHourSchedule[i].startTime);
	    	offsetStartTime = offsetStartTime.setMinutes(offsetStartTime.getMinutes() - timeZoneOffset);
	    	var startDateTime = new Date(offsetStartTime);
	    	hrsStart = new Date(startDateTime).getHours();
	    	minStart = new Date(startDateTime).getMinutes();
	    	if(0 <= hrsStart && hrsStart < 10){
	    		hrsStart = '0' + hrsStart;
	    	}
	    	if(0 <= minStart && minStart < 10){
	    		minStart = '0' + minStart;
	    	}
	    	if(officeHourSchedule[i].isAllday){
	    		hrsStart = '00';
	    		minStart = '00';
	    	}
        	spaceOfficeHourTimingScheduleObj.isClosed = false;
    	} else {
    		hrsStart = '-';
    		minStart = '-';
        	spaceOfficeHourTimingScheduleObj.isClosed = true;
    	}
    	spaceOfficeHourTimingScheduleObj.startTime = hrsStart + ':' + minStart;
    	
    	if(!officeHourSchedule[i].isClosed){
	    	var offsetEndTime = new Date(officeHourSchedule[i].endTime);
	    	offsetEndTime = offsetEndTime.setMinutes(offsetEndTime.getMinutes() - timeZoneOffset);
	    	var endDateTime = new Date(offsetEndTime);
	    	hrsEnd = new Date(endDateTime).getHours();
	    	minEnd = new Date(endDateTime).getMinutes();
	    	if(0 <= hrsEnd && hrsEnd < 10){
	    		hrsEnd = '0' + hrsEnd;
	    	}
	    	if(0 <= minEnd && minEnd < 10){
	    		minEnd = '0' + minEnd;
	    	}
	    	if(officeHourSchedule[i].isAllday){
	    		hrsEnd = '23';
	    		minEnd = '59';
	    	}
        	spaceOfficeHourTimingScheduleObj.isClosed = false;
    	} else {
    		hrsEnd = '-';
    		minEnd = '-';
    		spaceOfficeHourTimingScheduleObj.isClosed = true;
    	}
    	spaceOfficeHourTimingScheduleObj.endTime = hrsEnd + ':' + minEnd;
    	
    	spaceOfficeHourTimingSchedule.push(spaceOfficeHourTimingScheduleObj);
    }
    return spaceOfficeHourTimingSchedule;
}

function adminRateTimingNotification(req, res, spaceObj, officeHoursScheduleBefore, officeHoursScheduleAfter, callback){
    var query = {
      'name' : new RegExp('^' + 'Admin' + '$', "i")
    };
    RoleModel.findOne(query, function(err, role) {
        if (err) {
          return res.status(500).json({
            error : 'Cannot load role',
            err: err
          });
        }
        query = {};
        query.role = { 
          $in: [role._id]
        }
        UserModel.find(query).exec(function(err, admins){
      	  if (err) {
      		  return res.status(500).json({
      			  error : 'Cannot load admin',
      			  err: err
      		  });
      	  }
      	  async.eachSeries(admins, function(admin, callback1) {
        	  var emailAdmin = templates.space_rate_and_timing_change_email(admin, spaceObj, officeHoursScheduleBefore, officeHoursScheduleAfter);
        	  mail.mailService(emailAdmin, admin.email);
        	  callback1();
      	  }, function(err) {
      		  if(err) {
      			  return res.status(500).json({
      				  error: 'Error while sending mail.',
      				  err : err
      			  });
      		  }
      		  callback();
      	  });
        });
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
    room: function(req, res, next, id){
      RoomsModel.load(id, function (err, room) {
              if (err) { return next(err); }
              if (!room) { return next(new Error('Failed to load room ' + id)); }
              req.room = room;
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
        role: function (req, res, next, id) {
            RoleModel.load(id, function (err, role) {
                if (err) {
                    return next(err);
                }
                if (!role) {
                    return next(new Error('Failed to load role ' + id));
                }
                req.role = role;
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
	get: function(req, res) {
		if (!req.space.space_type._id) {
			SpaceTypeModel.findOne({
				_id: req.space.space_type
			}).exec(function(err, spacetype) {
				if (err) {
					res.status(500).send(err);
				}
				if (!spacetype) {
					res.status(500).send('Failed to load spacetype ');
				} else {
					req.space.space_type = spacetype;
				}
			});
			console.log(req.space);
			res.send(req.space);
		} else {
			console.log('here');
			console.log(req.space);
			res.send(req.space);
		}
	},

   
    /**
	 * create a space
	 */
	create: function(req, res) {
	      var user = req.user;
	      var teams =req.body.teams;
	      	/**
			 * if(user.roles.indexOf('admin') === -1) { return
			 * res.status(401).send('User is not authorized'); }
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
	    	  return res.status(400).json(errors);
	      }
	      /*
			 * var geocodeObj = {}; var geocoderProvider = 'google'; var
			 * httpAdapter = 'https'; var extra = { serverKey:
			 * 'AIzaSyA3mNMJvbJ6MJ3n4KJ4_I0MEDesB1SH4kE', formatter: null }; var
			 * geocoder = require('node-geocoder')(geocoderProvider,
			 * httpAdapter, extra); var address = space.address1 + ',' +
			 * space.address2 + ',' + space.locality + ',' + space.state + ',' +
			 * space.city + ',' + space.postal_code + ',' + space.country;
			 * geocoder.geocode(address).then(function(response) { geocodeObj =
			 * response[0]; space.loc = [geocodeObj.longitude,
			 * geocodeObj.latitude];
			 */
	    	  	var counter = 0;
	           	async.each(teams, function (team, callback) {
	                    var teamSpace = {
	                        role: team.role,
	                        first_name: team.first_name,
	                        email: team.email,
	                        phone:team.phone,
	                        isNew: true
	                    };
	                    teamSpace.resetPasswordToken = randtoken.generate(16);
	                    teamSpace.resetPasswordExpires = (Date.now() / 1000 | 0) + 60 * 60;
	                    
	                    var spaceTeam = new UserModel(teamSpace);
	                    spaceTeam.isPasswordUpdate = true;
	                    spaceTeam.isUserConfirmed = true;
	                    spaceTeam.isPasswordUpdate=true;
	                    spaceTeam.profileUpdated=true;
	                    var token = randtoken.generate(8);
	                    spaceTeam.password = token;
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
		                        		break;
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
		                      return res.status(400).json(err);
		                  } else {
		                	  space.teams.push(spaceTeam._id);
		                	  counter++;
		                  }
		                    /*
							 * var mailOptions = { to: spaceTeam.email, from:
							 * config.emailFrom }; mailOptions =
							 * templates.team_email(spaceTeam, req,
							 * spaceTeam.password,mailOptions);
							 */
		                    UserModel.findOne({_id: req.body.partner}).exec(function (err, partner) {
		                    	if(err){
		                    		return res.json(err);
		                    	}
		                    	else{
				                    var email = templates.team_email(spaceTeam, req, spaceTeam.password,partner)
				          			mail.mailService(email,spaceTeam.email)
		                    	}
		                    });
		                      // sendMail(mailOptions);
		                  if(counter == teams.length){
		                      space.save(function(err) {
	  	                          if (err) {
	  	                        	  return res.status(400).json(err);
	  	                        	  console.log("in errorrrrrrrrrrrrrrrr");
	  	                        	  console.log(err);
	  	                          }
	  	                          RoleModel.findOne({"name":"Admin"},function(err,role){
	                                  if(err)
	                                  {
	                                    logger.log('error', 'GET '+req._parsedUrl.pathname+'Checking for admin login'+err+''); 
	                                  }
	                                  else
	                                  {
	                                      UserModel.find({
	                                           role : { "$in" : [role._id] }
	                                        }, function(err, users) {
	                                            async.each(users, function (user, callback) {
	                                            	notify.addNotificationURL('Space added',space.name +' Space has been added.',user,'/admin/space/' + space._id + '/edit');
	                                            	callback();
	                                            });
	                                      });
	                                  }
	                                });   
			                      SpaceModel.findOne({_id: space._id}).populate('teams').deepPopulate('teams.role').exec(function (err, space) {
			                          if(err) {
			                        	  return res.json(err);
			                          }
			                          /*
										 * saving the space id in team member
										 */
				                      async.eachSeries(space.teams, function(teamObj, callback1) {
					                      UserModel.findOne({_id: teamObj._id}).exec(function (err, teamUserSpace) {
					                          if(err) {
					                        	  return res.json(err);	
					                          }
					                          else{
					                        	  teamUserSpace.Spaces.push(space._id);
					                        	  teamUserSpace.save(function(err) {
					                                  if (err) {
					                                      return res.status(500).json({
					                                          error: 'Cannot update the team user'
					                                      });
					                                  }
					                                  callback1();
					                              });
					                          }
					                      }); 
				                      });
				                      /*
										 * end of saving space id in team member
										 */
			                          res.json(space);
			                      });  
	  	                     });
		                 }
	                 });
	              });
	         /*
				 * }).catch(function(err) { res.status(400).send(err); });
				 */
	    },


    /**
	 * update a space
	 */
    update : function(req, res) {
        var user = req.user;
        var space = req.space;
        var spaceObj = req.space;
        var teams = [];
        var present = [];
        
        var spaceHours = req.space.officeHours.slice();
        var reqHours = req.body.officeHours.slice();

        var officeHoursScheduleBefore = officeHourScheduleHoursMinutes(spaceHours);
        console.log('-----------------------');
        var officeHoursScheduleAfter = officeHourScheduleHoursMinutes(reqHours); 

        var officehourschedulebefore = req.space.officeHours;
        var officehourscheduleafter = req.body.officeHours; 
        var spaceIdInSpaceObject=req.body._id;
        var conflictingRoomSchedule=[];

         async.waterfall([
          function(done){

            for (var i = 0; i < officehourscheduleafter.length; i++) {

                var editedstarttimennumberbefore=new Date(officehourschedulebefore[i].startTime);
                var starttimehoursbefore=editedstarttimennumberbefore.getHours();
                var starttimeminutesbefore=editedstarttimennumberbefore.getMinutes();
                var startTimeNumberbefore = starttimehoursbefore*60+starttimeminutesbefore;

                var editedendtimennumberbefore=new Date(officehourschedulebefore[i].endTime);
                var endtimehoursbefore=editedendtimennumberbefore.getHours();
                var endtimeminutesbefore=editedendtimennumberbefore.getMinutes();
                var endTimeNumberbefore= endtimehoursbefore*60+endtimeminutesbefore;

                var editedstarttimennumberafter=new Date(officehourscheduleafter[i].startTime);
                var starttimehoursafter=editedstarttimennumberafter.getHours();
                var starttimeminutesafter=editedstarttimennumberafter.getMinutes();
                var startTimeNumberafter = starttimehoursafter*60+starttimeminutesafter;

                var editedendtimennumberafter=new Date(officehourscheduleafter[i].endTime);
                var endtimehoursafter=editedendtimennumberafter.getHours();
                var endtimeminutesafter=editedendtimennumberafter.getMinutes();
                var endTimeNumberafter= endtimehoursafter*60+endtimeminutesafter;

                if (startTimeNumberbefore != startTimeNumberafter || endTimeNumberbefore != endTimeNumberafter) {
                    present.push(officehourscheduleafter[i]);
                }
            }
               done();
         
          },
          function(done){
             async.each(present, function(spaceofficeslotobject, callback) {

                        var checkingStartTimeNumber = spaceofficeslotobject.checkingStartTimeNumber;
                        var checkingEndTimeNumber= spaceofficeslotobject.checkingEndTimeNumber;

                        RoomsModel.find({
                              "spaceId":spaceIdInSpaceObject,                         
                               roomsslotschedule: { $elemMatch: { 
                                  day: spaceofficeslotobject.day,
                                  isClosed:false,
                                  $or:[
                                   {startTimeMinutes:{$lt: checkingStartTimeNumber}},
                                   {endTimeMinutes:{$gt: checkingEndTimeNumber}}
                                   
                                    ]
                                  
                                  } }

                        }, function(err, docs) {
                            if (err) {
                                res.send(400);
                                callback();
                            } else {
                                async.each(docs, function(roomdoc, callbackconflictschedule) {
                                    conflictingRoomSchedule.push(roomdoc);
                                    callbackconflictschedule();
                                }, function(err) {
                                    callback();
                                });
                            }
                        });
                    }, function(err) {
                        done();
                    });

          },
          function(done){
            if (conflictingRoomSchedule.length > 0) {
                  logger.log('error', 'PUT '+req._parsedUrl.pathname+' Failed to update space details ');
                  res.send({
                      "isConflict": true,
                      "conflictingArray": conflictingRoomSchedule,
                      "changedschedulearray": present
                  });
              } else {
                  done();
              }

          },
          function(done)
          {
 
             var teammember=req.body.teams;
              async.each(teammember, function (teammemberobject, callback) {

                    UserModel.findOne({"_id":teammemberobject._id},function(err,userobject){
                      if(err)
                      {
                          logger.log('error', 'PUT '+req._parsedUrl.pathname+' Failed to update space details ');
                          res.send(400);
                      }
                      else
                      {
                        
                          if(userobject)
                          {

                               userobject.first_name=teammemberobject.first_name;
                               userobject.email=teammemberobject.email;
                               userobject.role=[];
                               userobject.role.push(teammemberobject.role);

                              userobject.save(function(err,userdetails){
                                if(err)
                                {
                                   logger.log('error', 'PUT '+req._parsedUrl.pathname+' Failed to update user details ');
                                   return res.status(500).json({
                                      error: 'Cannot update the user details'
                                  });  
                                }

                              }); 
                          }

                      }

                    });

                     callback();

              },function(err){
                   done();
              });
             
          },
          function(done){

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
        
       // delete req.body.teams;
        space = _.extend(space, req.body);
        
        var errors = req.validationErrors();
        if (errors) {
            return res.status(400).send(errors);
        }
        /*
		 * var geocodeObj = {}; var geocoderProvider = 'google'; var httpAdapter =
		 * 'https'; var extra = { serverKey:
		 * 'AIzaSyA3mNMJvbJ6MJ3n4KJ4_I0MEDesB1SH4kE', formatter: null }; var
		 * geocoder = require('node-geocoder')(geocoderProvider, httpAdapter,
		 * extra); var address = space.address1 + ',' + space.address2 + ',' +
		 * space.locality + ',' + space.state + ',' + space.city + ',' +
		 * space.postal_code + ',' + space.country;
		 * geocoder.geocode(address).then(function(response) { geocodeObj =
		 * response[0]; space.loc = [geocodeObj.longitude, geocodeObj.latitude];
		 */

            var counter = 0;
              if(teams.length === 0){
                space.save(function(err) {
                      if (err) {
                        return res.status(400).json(err);
                      } 
                      adminRateTimingNotification(req, res, spaceObj, officeHoursScheduleBefore, officeHoursScheduleAfter, function(){
                    	  done(null,space);
                      });   
                  });
              }
              async.each(teams, function (team, callback) {

                      var teamSpace = {
                          role: team.role,
                          first_name: team.first_name,
                          email: team.email,
                          phone:team.phone,
                          isNew: true
                      };
                      teamSpace.resetPasswordToken = randtoken.generate(16);
                      teamSpace.resetPasswordExpires = (Date.now() / 1000 | 0) + 60 * 60;
                       var spaceTeam = new UserModel(teamSpace);
                       spaceTeam.isPasswordUpdate = true;
                        spaceTeam.isUserConfirmed = true;
                        spaceTeam.isPasswordUpdate=true;
                        spaceTeam.profileUpdated=true;
                        var token = randtoken.generate(8);
                        spaceTeam.password = token;
                      spaceTeam.save(function (err, teamuser) {
                        if (err) {
                          console.log(err.code);

                          switch (err.code) {
                              case 11000:
                               res.status(400).json([{
                                  msg: 'Email id already exists',
                                  param: 'email'
                                }]);
                               break;
                              case 11001:
                                res.status(400).json([{
                                  msg: 'Username already taken',
                                  param: 'first_name'
                                }]);
                                break;
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
                          
                      } else {
                        space.teams.push(spaceTeam._id);
                        counter++;
                      }

                      UserModel.findOne({_id: req.body.partner}).exec(function (err, partner) {
	                    	if(err){
	                    		return res.json(err);
	                    	}
	                    	else{
			                    var email = templates.team_email(spaceTeam, req, spaceTeam.password,partner)
			          			mail.mailService(email,spaceTeam.email)
	                    	}
	                    });
                      if(counter == teams.length){
                          space.save(function(err) {
                              if (err) {
                                return res.status(400).json(err);
                              }
                          SpaceModel.findOne({_id: space._id}).populate('teams').exec(function (err, space) {
                              if(err) {
                                return res.json(err);
                              }
                              adminRateTimingNotification(req, res, spaceObj, officeHoursScheduleBefore, officeHoursScheduleAfter, function(){
    	                    	  done(null,space);
    	                      });
                         });
                          /*
							 * saving the space id in team member
							 */
	                      UserModel.findOne({_id: spaceTeam._id}).exec(function (err, teamUserSpace) {
	                          if(err) {
	                        	  return res.json(err);
	                          }
	                          else{
	                        	  teamUserSpace.Spaces.push(space._id);
	                        	  teamUserSpace.save(function(err) {
	                                  if (err) {
	                                      return res.status(500).json({
	                                          error: 'Cannot update the team user'
	                                      });
	                                  }
	                              });
	                          }
	                      });
	                      
	                     /*
							 * end of saving space id in team member
							 */
                        });
                      }
                   });
                });
              
           /*
			 * }).catch(function(err) { res.status(400).send(err); });
			 */
          },
          function(space,done)
          {

          	 var space=space;

          	 RoomsModel.find({"spaceId":space._id},function(err,roomobjectarray){
          	 	if(err)
          	 	{
          	 	    res.send(400);
          	 	}
          	 	else
          	 	{

          	 		async.each(roomobjectarray, function(roomobject, callbackbooking) {
                                    roomobject.loc=space.loc;
                                    roomobject.save(function(err){
                                    	if(err)
                                    	{
                                    		res.send(err);
                                    	} 

                                    });
                                    callbackbooking();
                                }, function(err) {                  
                                   done(null,space);
                                });
          	 	}

          	 });

          },
          function(space,done)
          {

          	 var space=space;

          	 ScheduleModel.find({"spaceId":space._id},function(err,schedulefamilyarray){
          	 	if(err)
          	 	{
          	 	    res.send(400);
          	 	}
          	 	else
          	 	{

          	 		async.each(schedulefamilyarray, function(scheduleobject, callbackbookingschedule) {
                                    scheduleobject.loc=space.loc;
                                    scheduleobject.save(function(err){
                                    	if(err)
                                    	{
                                    		res.send(err);
                                    	} 

                                    });
                                    callbackbookingschedule();
                                }, function(err) {
                                    res.send(space);
                                });
          	 	}

          	 });

          }
        ], function (err) {
      
        });


    },
    
    /**
	 * delete a space
	 */
    delete : function(req, res) {
        var user = req.user;
        var space = req.space;
        var query, counter;
        var timeZoneOffset = -330;
        var deleteSpace = false;

        if(space.rooms.length > 0){
			async.eachSeries(space.rooms, function(room, callback) {
		        
				var currentDate = new Date();
				console.log(currentDate);
				currentDate = currentDate.setMinutes(currentDate.getMinutes() + 30);
		    	console.log(currentDate);
		    	var currentDateTime = new Date(currentDate);
		    	console.log(currentDateTime);
				query = {
					room : room.roomId,
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
						/*
						 * res.json({ status: 'Failure', space: {} });
						 */
						callback({err : err});
					} else {
						deleteSpace = true;
						callback();
					}
				});
				
			}, function(err) {
				if(err) {
					return res.status(500).json({
						error: 'Error while deleting room and space.',
						err : err,
						status: 'Failure',
	                    space: {}
					});
				} else if(deleteSpace){
					deleteSpaceRoom(req, res, space);
				}
			});
			
        } else {
        	space.remove({ _id: req.space._id}, function(err) {
    	    	if (err) {
    	    		return res.status(500).json({
    	                error: 'Cannot delete the space'
    	            });
    	        }
    	    	res.json({
    	            status: 'Success',
    	            space: space
    	        });
    	    });
        }
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

    review: function(req, res, next, id){
    	ReviewModel.load(id, function (err, review) {
            if (err) { 
            	return next(err); 
            }
            if (!review) {
            	return next(new Error('Failed to load review ' + id)); 
            }
            req.review = review;
            next();
        });
    },

    booking: function(req, res, next, id) {
    	BookingModel.load(id, function(err, booking) {
    		if(err) {
    			return next(err);
    		}
    		if(!booking) {
    			return next(new Error('Failed to load booking ' + id));
    		}
    		req.booking = booking;
    		next();
    	});
    },

    createReview: function(req, res) {
		req.assert('rating', 'Please choose a rating for the review.').notEmpty();
		var errors = req.validationErrors();
		if(!errors) {
			req.assert('rating', 'Rating must be numeric.').isNumeric();
		}
		//req.assert('title', 'Please enter the review title.').notEmpty();
		errors = req.validationErrors();
		if(!errors) {
			errors = [];
			if(req.body.rating < 1 || req.body.rating > 5) {
				errors.push({
					"param": "rating",
					"msg": "Rating must be between 1 and 5.",
					"value": req.body.rating,
				});
			}
		}

		if (errors.length > 0) {
			return res.status(400).send(errors);
		}

		var review = new ReviewModel(req.body);
		review.booking = req.booking._id;
		review.space = req.booking.space._id;
		review.save(function(err) {
			if (err) {
				return res.status(400).json(err);
			}
			// Fork an asynchronous task to update the average space rating and
			// send the response to client.
			updateSpaceRating(review.space, review._id);
			var booking = req.booking;
			booking.reviewed = true;
			booking.save(function(err) {
				if(err) {
					return res.status(400).json(err);
				}
				
				ReviewModel.findOne({
					space: review.space
				}).populate('createdBy', '_id, first_name').populate('space', '_id').exec(function(err, review) {
					if(err) {
						res.status(400).json(err);
					}
					res.json(review);
				});
			});
		});
	},

	getReview: function(req, res) {
		return res.json(req.review);
	},

	updateReview: function(req, res) {
		var review = req.review;

		req.assert('rating', 'Please choose a rating for the review.').notEmpty();
		var errors = req.validationErrors();
		if(!errors) {
			req.assert('rating', 'Rating must be numeric.').isNumeric();
		}
		req.assert('title', 'Please enter the review title.').notEmpty();
		errors = req.validationErrors();
		if(!errors) {
			errors = [];
			if(req.body.rating < 1 || req.body.rating > 5) {
				errors.push({
					"param": "rating",
					"msg": "Rating must be between 1 and 5.",
					"value": req.body.rating,
				});
			}
		}

		if (errors.length > 0) {
			return res.status(400).send(errors);
		}

		review = _.extend(review, req.body);
		review.updatedAt = new Date().toISOString();
		review.save(function(err) {
			if(err) {
				return res.status(400).json(err);
			}
			// Fork an asynchronous task to update the average space rating and
			// send the response to client.
			updateSpaceRating(review.space, review._id);
			res.json(review);
		});
	},

	deleteReview: function(req, res) {
		var review = req.review;

		review.remove({ _id: req.review._id}, function(err) {
        	if (err) {
        		return res.status(500).json({
                    error: 'Cannot delete the review.'
                });
            }
        	res.json(review);
        });
	},

	getUserReviews: function(req, res) {
		var userId = req.user._id;

		var sort = {createdAt: -1},
			skip = 0,
			count = 50; // Setting a hard upper limit. TODO: Check this.

		if(req.query.perPage && req.query.perPage.length > 0) {
			count = parseInt(req.query.perPage) > 0 ? parseInt(req.query.perPage) : 0;
			if(req.query.page && req.query.page.length > 0) {
				skip = parseInt(req.query.page) > 0 ? (parseInt(req.query.page) - 1) * count : 0;
			}
		}

		if(req.query.sort && req.query.sort.length > 0) {
			switch(req.query.sort) {
				case 'aDate':
					sort = {createdAt: 1};
					break;
				case 'dDate':
					sort = {createdAt: -1};
					break;
				case 'aRating':
					sort = {rating: 1, createdAt: -1};
					break;
				case 'dRating':
					sort = {rating: -1, createdAt: -1};
					break;
				default:
					sort = {createdAt: -1};
			}
		}

		ReviewModel.find({
			createdBy: userId
		}).populate('createdBy', '_id, first_name').populate('space', '_id').limit(count).skip(skip).sort(sort).exec(function(err, reviews) {
			if(err) {
				res.status(400).json(err);
			}
			res.json(reviews);
		});
	},

	getSpaceReviews: function(req, res) {
		var spaceId = req.space._id;

		var sort = {createdAt: -1},
			skip = 0,
			count = 50; // Setting a hard limit. TODO: Check this.

		if(req.query.perPage && req.query.perPage.length > 0) {
			count = parseInt(req.query.perPage) > 0 ? parseInt(req.query.perPage) : 0;
			if(req.query.page && req.query.page.length > 0) {
				skip = parseInt(req.query.page) > 0 ? (parseInt(req.query.page) - 1) * count : 0;
			}
		}

		if(req.query.sort && req.query.sort.length > 0) {
			switch(req.query.sort) {
				case 'aDate':
					sort = {createdAt: 1};
					break;
				case 'dDate':
					sort = {createdAt: -1};
					break;
				case 'aRating':
					sort = {rating: 1, createdAt: -1};
					break;
				case 'dRating':
					sort = {rating: -1, createdAt: -1};
					break;
				default:
					sort = {createdAt: -1};
			}
		}

		ReviewModel.find({
			space: spaceId
		}).populate('createdBy', '_id, first_name').populate('space', '_id').limit(count).skip(skip).sort(sort).exec(function(err, reviews) {
			if(err) {
				res.status(400).json(err);
			}
			ReviewModel.find({
			space: spaceId
		}).count().exec(function(err, count) {
				var response = {
					reviews: reviews,
					totalCount: count
				}
				res.json(response);
			});
		});
	},
  
  getSpaceDetail: function(req, res) {
     res.send(req.room);
  },
  
  /*
	 * Back office user space and bookings
	 * 
	 */
   loadSpaceBackOffice:function(req,res){
	   var requiredSpaceArray=[];
	   var user=req.user;
	   var userSpace=user.Spaces;
	   async.each(userSpace, function(requiredSpace, callbackSpaces) {
		   SpaceModel.findOne({_id: requiredSpace}).exec(function (err, space) {
               if(err) {
             	  return res.json(err);
               }
               else{
            	   requiredSpaceArray.push(space);
            	   res.send(requiredSpaceArray);
               }
           });
		  
		   callbackSpaces();
       }, function(err) {
           // res.send(myresult);
       });
   },
   
	   fetchRoleName:function(req,res){
		var requiredRoleName=req.query.roleId;
		RoleModel.findOne({_id: requiredRoleName}).exec(function (err, role) {
            if(err) {
          	  return res.json(err);
            }
            else{
         	   res.send(role);
            }
        });
	   },

     spaceSendToAdminApproval:function(req,res)
        {
           var spaceId=req.body.spaceId;
           
            SpaceModel.findOne({"_id":spaceId},function(err,item){
                 if(err)
                 {
                   logger.log('error', 'PUT '+req._parsedUrl.pathname+' Failed to update space object '+err+'');
                     res.send(400);
                 }
                 else
                 {             
                     item.sentToAdminApproval=true;
                     item.save(function(err){
                       if(err)
                       {
                          logger.log('error', 'PUT '+req._parsedUrl.pathname+' Failed to update space object '+err+'');
                           res.send(400);
                       }
                       else
                       {    
                               RoleModel.findOne({"name":"Admin"},function(err,role){
                                   if(err)
                                   {
                                     logger.log('error', 'GET '+req._parsedUrl.pathname+'Checking for admin login'+err+''); 
                                   }
                                   else
                                   {  

                                       UserModel.find({
                                          role : { "$in" : [role._id] }
                                       }, function(err, users) {
                                           async.each(users, function (user, callback) {
                                           notify.addNotificationURL('Approval',item.name +' space is waiting for your approval',user,'/admin/space/'+item._id+'/detailpage');
                                           callback();
                                         });
                                     });
                                         
                                   }
                                 });
                             logger.log('info', 'PUT '+req._parsedUrl.pathname+' space details updated successfully'); 
                              res.send(200);
                       }
                     });
                 }
            }); 
        },
        
        spaceByRole : function(req, res){
        	var role = req.query.role;
        	var query = {};
        	var roleName = role;
        	/*query = {'name': new RegExp('^'+role+'$', "i")};
            RoleModel.findOne(query, function (err, role) {
            	if (err) {
                    return res.status(400).json({
                        error: 'Cannot list the Role'
                    });
                }
            
            });*/
        	if(roleName === 'Partner'){
        		UserModel.findOne({
                    _id : req.query.userId
                 }, function(err, user) {
             		 query = {
                		partner : user._id
                	 };
                	 SpaceModel.find(query).populate('teams').deepPopulate('teams.role').exec(function (err, space) {
                         if(err) {
                       	  	return res.json(err);
                         }
                         res.json(space);
                	 });
                 });
        	} else if(roleName === 'BackOffice' || roleName === 'FrontOffice'){
        		UserModel.findOne({
                    _id : req.query.userId
                 }, function(err, user) {
                	 query = {
                 		teams : {
                 			$in : [user._id]
                 		}
                 	 };
                	 SpaceModel.find(query).populate('teams').deepPopulate('teams.role').exec(function (err, space) {
                         if(err) {
                       	  	return res.json(err);
                         }
                         res.json(space);
                	 });
                 });
        	} else {
        		UserModel.findOne({
                    _id : req.query.userId
                 }, function(err, user) {
             		 query = {};
                	 SpaceModel.find(query).populate('teams').deepPopulate('teams.role').exec(function (err, space) {
                         if(err) {
                       	  	return res.json(err);
                         }
                         res.json(space);
                	 });
                 });
        	}
        }


  };
};