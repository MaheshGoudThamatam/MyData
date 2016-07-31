'use strict';

/**
 * Module dependencies.
 */
 require('../../../../core/users/server/models/user.js');
 require('../../../rooms/server/models/rooms.js');
 require('../../../search/server/models/search.js');
 require('../../../role/server/models/role.js');
var notify = require('../../../notification/server/controllers/notify.js');
 
var mongoose = require('mongoose'), 
	BookingModel = mongoose.model('Booking'), 
	UserModel = mongoose.model('User'), 
	RoomsSchemaModel = mongoose.model('Rooms'), 
	ScheduleModel = mongoose.model('Schedule'),
	RoleModel = mongoose.model('Role'); 
	
var	nodemailer = require('nodemailer'), 
	templates = require('../template'), 
	config = require('meanio').loadConfig(), 
	_ = require('lodash'),
	async = require('async'),
	payumoney = require('./payumoney.js'),
	scheduler = require('./scheduler.js');

/**
 * Send email to booked user
 */
function sendMail(mailOptions) {
    var transport = nodemailer.createTransport(config.mailer);
    transport.sendMail(mailOptions, function(err, response) {
        if (err) return err;
        return response;
    });
}

function sendMailTemplate(actor, room) {
	var mailOptions = {
		to : [ actor.email ],
		from : config.emailFrom
	};
	mailOptions = templates.booking_email(actor, room, mailOptions);
	sendMail(mailOptions);
}

/**
 * string to time conversion
 */
function stringToTimeStamp(dateString) {
       var dateTime = dateString;
       var date = new Date(dateTime);
       return date.getTime();
}

module.exports = function (Booking) {

    return {

        /**
         * Find Booking by id
         */
        booking: function (req, res, next, id) {
        	BookingModel.load(id, function (err, booking) {
                if (err) return next(err);
                if (!booking) return next(new Error('Failed to load holiday ' + id));
                req.booking = booking;
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
         room: function(req, res, next, id) {
             RoomsSchemaModel.load(id, function(err, room) {
                if (err) {
                    return next(err);
                }
                if (!room) {
                    return next(new Error('Failed to load room ' + id));
                }
                req.room = room;
                next();
            });
        },
        schedule: function(req, res, next, id) {
             ScheduleModel.load(id, function(err, schedule) {
                if (err) {
                    return next(err);
                }
                if (!schedule) {
                    return next(new Error('Failed to load schedule ' + id));
                }
                req.schedule = schedule;
                next();
            });
        },


		create : function(req, res) {
			var user = req.user;
	    	var userObj;
			var room = req.body.room;
			var partner = req.body.room.spaceId.partner;
			var scheduleTrainingList = req.body.scheduleTraining;
			
			req.body.scheduleTraining = [];
			var fromDate = req.body.fromDate;
			var endDate = req.body.endDate;
			delete req.body.fromDate;
			delete req.body.endDate;
			
			var bookingFrom = req.body.bookingFrom;
			var bookingTo = req.body.bookingTo;
			var bookingStartTime = req.body.bookingStartTime;
			var bookingEndTime = req.body.bookingEndTime;
			
			req.body.bookingStartTime = new Date(fromDate + " " + bookingStartTime);
			req.body.bookingEndTime = new Date(endDate + " " + bookingEndTime);
			req.body.bookingDate = new Date(fromDate + " " + bookingStartTime);
			
			var bookingStart, bookingEnd;
			var bookingList = [];
			var counter = 0, countWeekDays = 0, slotNotAvailable = false;

			var betweenDates = [], scheduleCurrentAvailable = [];
			betweenDates = scheduler.dateRangeWithTime(bookingFrom, bookingTo, bookingStartTime, bookingEndTime);
			
			async.waterfall([ function(done) {
				
				async.each(scheduleTrainingList, function(scheduleObj, callback) {
					
			    	var currentAvail = scheduleObj.currentAval;
					if(currentAvail.length > 0){
				    	//var scheduleObjDate = new Date(scheduleObj.date);
				    	var scheduleObjDate = new Date(currentAvail[0].startTime);

				    	if(scheduleObj.isAllday){
					    	scheduleObjDate.setDate(scheduleObjDate.getDate() - 1);
				    	}
				    	
				    	bookingStart = stringToTimeStamp(scheduler.customizeTimeForDate(scheduleObjDate, bookingStartTime));
				    	bookingEnd = stringToTimeStamp(scheduler.customizeTimeForDate(scheduleObjDate, bookingEndTime));
				    	
			            req.body.bookingStartTimeNumber = bookingStart;
			            req.body.bookingEndTimeNumber = bookingEnd;
			            
						var index = scheduler.findSlot(currentAvail, bookingStart, bookingEnd, scheduleObj.isAllday);
						console.log(index);
						if (index >= 0) {
							var bookingEndHour = new Date(bookingEnd);
			                var bookingEndHourTwo = new Date(bookingEndHour);
			                bookingEndHourTwo.setMinutes( bookingEndHour.getMinutes() + 60 );
			                var bookingEndTimeFinal = stringToTimeStamp(bookingEndHourTwo);
			                
							var splittedSlot = scheduler.splitSlot(currentAvail[index], bookingStart, bookingEndTimeFinal);
							currentAvail.splice(index, 1);
							for (var i = splittedSlot.length - 1; i >= 0; i--) {
								currentAvail.splice(index, 0, splittedSlot[i]);
							}
							scheduleCurrentAvailable.push({
								_id: scheduleObj._id,
								currentAvail: currentAvail
							});
							
						} else {
							console.log(scheduleObj);
							slotNotAvailable = true;
						}
					}
					callback();
				}, function(err) {
					if(err) {
						return res.status(500).json({
							error: 'Error while booking. ' + err
						});
					} else {
						if(slotNotAvailable){
							return res.status(500).json({
								error : 'Slot already booked'
							});
						} else {
							//done(null, bookingList);
							done(null, scheduleTrainingList, scheduleCurrentAvailable);
						}
					}
				});

			}, function (scheduleTrainingList, scheduleCurrentAvailable, done) {
				async.eachSeries(scheduleTrainingList, function(scheduleObj, callback1) {
					async.eachSeries(scheduleCurrentAvailable, function(scheduleCurrentAvailableObj, callback2) {
						
						if(JSON.stringify(scheduleObj._id) === JSON.stringify(scheduleCurrentAvailableObj._id)){
							ScheduleModel.findOne({_id: scheduleObj._id}, function(err, scheduleObject){
								if(err){
									return res.status(500).json({
										msg: 'Cannot update the schedule',
										error : err
									});
								}
								scheduleObject.currentAval = scheduleCurrentAvailableObj.currentAvail;
								scheduleObject.save(function(err) {
									if (err) {
										return res.status(500).json({
											error : 'Cannot update the schedule'
										});
									}
									counter++;
									req.body.scheduleTraining.push(scheduleObject._id);
									callback2();
								});
							});
						} else {
							callback2();
						}
					}, function(err) {
						if(err) {
							return res.status(500).json({
								error: 'Error for inner loop. ' + err
							});
						} else {
							callback1();
						}
					});
				}, function(err) {
					if(err) {
						return res.status(500).json({
							error: 'Error for outer loop. ' + err
						});
					} else {
						bookingList = req.body.scheduleTraining;
						done(null, bookingList);
					}
				});
				
            }, function (bookingList, done) {
            	console.log('here');
				if (user == undefined) {
                    req.body.guest.isGuest = true;
                    req.body.scheduleTraining = bookingList;
                    var guestUser = new UserModel(req.body.guest);
                    guestUser.save(function (err, userGuest) {
                        if (err) {
                            console.log(err);
                        } else {
                            done(null, userGuest, bookingList);
                        }
                    });

                }
                else {
                    done(null, user, bookingList);
                }

            }, function (user, bookingList, done) {
                req.body.user = user;
                //req.body.day = scheduleObj.day;
                var booking = new BookingModel(req.body);
                booking.save(function (err, bookedItem) {
                    if (err) {
                        return res.status(500).json({
                            error: 'Cannot save the Booking',
                            err: err
                        });
                    }
                	/*sendMailTemplate(user, room);
                    sendMailTemplate(partner, room);*/
                    var data = payumoney.getPayUMoneyPayload(booking,user);
                    
                    res.json(data);
                    done();
                });
	        } ], function(err, result) {
					
			});

		},
		
		/**
		 * Booking Training Room by Back Office.
		 */
		createBookingByBackOffice : function(req, res) {
			var user = req.user;
	    	var userObj;
			var room = req.body.room;
			var partner = req.body.partner;
			var scheduleTrainingList = req.body.scheduleTraining;
			
			req.body.scheduleTraining = [];
			var fromDate = req.body.fromDate;
			var endDate = req.body.endDate;
			delete req.body.fromDate;
			delete req.body.endDate;
			
			var bookingFrom = req.body.bookingFrom;
			var bookingTo = req.body.bookingTo;
			var bookingStartTime = req.body.bookingStartTime;
			var bookingEndTime = req.body.bookingEndTime;
			
			req.body.bookingStartTime = new Date(fromDate + " " + bookingStartTime);
			req.body.bookingEndTime = new Date(endDate + " " + bookingEndTime);
			req.body.bookingDate = new Date(fromDate + " " + bookingStartTime);
			
			var bookingStart, bookingEnd;
			var bookingList = [];
			var counter = 0, countWeekDays = 0, slotNotAvailable = false;

			var betweenDates = [], scheduleCurrentAvailable = [];
			betweenDates = scheduler.dateRangeWithTime(bookingFrom, bookingTo, bookingStartTime, bookingEndTime);
			
			async.waterfall([ function(done) {
				
				async.each(scheduleTrainingList, function(scheduleObj, callback) {
					
			    	var currentAvail = scheduleObj.currentAval;
					if(currentAvail.length > 0){
				    	//var scheduleObjDate = new Date(scheduleObj.date);
				    	var scheduleObjDate = new Date(currentAvail[0].startTime);

				    	if(scheduleObj.isAllday){
					    	scheduleObjDate.setDate(scheduleObjDate.getDate() - 1);
				    	}
				    	
				    	bookingStart = stringToTimeStamp(scheduler.customizeTimeForDate(scheduleObjDate, bookingStartTime));
				    	bookingEnd = stringToTimeStamp(scheduler.customizeTimeForDate(scheduleObjDate, bookingEndTime));
				    	
			            req.body.bookingStartTimeNumber = bookingStart;
			            req.body.bookingEndTimeNumber = bookingEnd;
			            
						var index = scheduler.findSlot(currentAvail, bookingStart, bookingEnd, scheduleObj.isAllday);
						console.log(index);
						if (index >= 0) {
							var bookingEndHour = new Date(bookingEnd);
			                var bookingEndHourTwo = new Date(bookingEndHour);
			                bookingEndHourTwo.setMinutes( bookingEndHour.getMinutes() + 60 );
			                var bookingEndTimeFinal = stringToTimeStamp(bookingEndHourTwo);
			                
							var splittedSlot = scheduler.splitSlot(currentAvail[index], bookingStart, bookingEndTimeFinal);
							currentAvail.splice(index, 1);
							for (var i = splittedSlot.length - 1; i >= 0; i--) {
								currentAvail.splice(index, 0, splittedSlot[i]);
							}
							scheduleCurrentAvailable.push({
								_id: scheduleObj._id,
								currentAvail: currentAvail
							});
							
						} else {
							console.log(scheduleObj);
							slotNotAvailable = true;
						}
					}
					callback();
				}, function(err) {
					if(err) {
						return res.status(500).json({
							error: 'Error while booking. ' + err
						});
					} else {
						if(slotNotAvailable){
							return res.status(500).json({
								error : 'Slot already booked'
							});
						} else {
							//done(null, bookingList);
							done(null, scheduleTrainingList, scheduleCurrentAvailable);
						}
					}
				});

			}, function (scheduleTrainingList, scheduleCurrentAvailable, done) {
				async.eachSeries(scheduleTrainingList, function(scheduleObj, callback1) {
					async.eachSeries(scheduleCurrentAvailable, function(scheduleCurrentAvailableObj, callback2) {
						
						if(JSON.stringify(scheduleObj._id) === JSON.stringify(scheduleCurrentAvailableObj._id)){
							ScheduleModel.findOne({_id: scheduleObj._id}, function(err, scheduleObject){
								if(err){
									return res.status(500).json({
										msg: 'Cannot update the schedule',
										error : err
									});
								}
								scheduleObject.currentAval = scheduleCurrentAvailableObj.currentAvail;
								scheduleObject.save(function(err) {
									if (err) {
										return res.status(500).json({
											error : 'Cannot update the schedule'
										});
									}
									counter++;
									req.body.scheduleTraining.push(scheduleObject._id);
									callback2();
								});
							});
						} else {
							callback2();
						}
					}, function(err) {
						if(err) {
							return res.status(500).json({
								error: 'Error for inner loop. ' + err
							});
						} else {
							callback1();
						}
					});
				}, function(err) {
					if(err) {
						return res.status(500).json({
							error: 'Error for outer loop. ' + err
						});
					} else {
						bookingList = req.body.scheduleTraining;
						done(null, bookingList);
					}
				});
				
            }, function (bookingList, done) {
            	console.log('here');
				if (user == undefined) {
                    req.body.guest.isGuest = true;
                    req.body.scheduleTraining = bookingList;
                    var guestUser = new UserModel(req.body.guest);
                    guestUser.save(function (err, userGuest) {
                        if (err) {
                            console.log(err);
                        } else {
                            done(null, userGuest, bookingList);
                        }
                    });

                }
                else {
                    done(null, user, bookingList);
                }

            }, function (user, bookingList, done) {
                req.body.user = user;
                //req.body.day = scheduleObj.day;
                var booking = new BookingModel(req.body);
                booking.save(function (err, bookedItem) {
                    if (err) {
                        return res.status(500).json({
                            error: 'Cannot save the Booking',
                            err: err
                        });
                    }
                	/*sendMailTemplate(user, room);
                    sendMailTemplate(partner, room);*/
                    var data = payumoney.getPayUMoneyPayload(booking,user);
                    
                    res.json(data);
                    done();
                });
	        } ], function(err, result) {
					
			});
		},
          
        /**
		 * Update an Booking
		 */
        update: function (req, res) {
            var booking = req.booking;
            booking = _.extend(booking, req.body);
            booking.save(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot update the Booking'
                    });
                }

                res.json(booking);
            });
        },
        
        /**
		 * Delete a Booking
		 */
        destroy: function (req, res) {
            var booking = req.booking;
            
            booking.remove(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete the Booking'
                    });
                }

                res.json(booking);
            });
        },
        
        /**
		 * Show an Booking
		 */
        show: function (req, res) {
            res.json(req.booking);
        },
        
        /**
		 * List of holiday
		 */
        all: function (req, res) {
        	BookingModel.find().populate('user').populate('space').populate('partner').populate('room').exec(function (err, bookings) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the bookings'
                    });
                }
                res.json(bookings);
            });
        },

        loadSchedule: function(req,res){
            var roomId = req.query.roomId;
        	var selectedFromDate = new Date(req.query.selectFromDate);
        	var strFrom = selectedFromDate.toISOString().substr(0,10);
        	strFrom = strFrom + "T00:00:00.000Z";
        	var selectEndDate = new Date(req.query.selectEndDate);
        	var strEnd = selectEndDate.toISOString().substr(0,10);
        	strEnd = strEnd + "T00:00:00.000Z";
            strEnd = strEnd.replace(/00:00:00.000/, '23:59:59.000');
            ScheduleModel.find({
            	$and:[
                      {"room":roomId},
                      {"date":{$gte: new Date(strFrom)}},
                      {"date":{$lte: new Date(strEnd)}},
             ]}).exec(function (err, bookingAvailabilitySchedules) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the bookingAvailabilitySchedules'
                    });
                }
                res.send(bookingAvailabilitySchedules);
            });
        },
        
        loadPartnerBookings:function(req,res){
        	  var user=req.query.partner;
        	  BookingModel.find({"partner":user}).populate('user').populate('space').populate('partner').populate('room').exec(function (err, partnerBookings) {
                  if (err) {
                      return res.status(500).json({
                          error: 'Cannot list the partnerBookings'
                      });
                  }
                  res.json(partnerBookings);
              });
        },
        
        loadTrainingRoomBookingByBackOffice: function(req, res){
        	var query = {
        		user : req.user._id,
        		room: req.room._id
        	};
        	RoleModel.findOne().exec(function(err, role){
        		if (err) {
                    return res.status(500).json({
                        error: 'Cannot load the role'
                    });
                }
        		/*if(role.name.match(/back/i)){*/
		      	  	BookingModel.find(query).populate('user').populate('space').populate('partner').populate('room').exec(function (err, bookings) {
		                if (err) {
		                    return res.status(500).json({
		                        error: 'Cannot list the bookings'
		                    });
		                }
		                res.json(bookings);
		            });
        		/*} else {
        			var array = [];
        			var object = {
           				err : 'error',
       					msg : 'Cannot Process'
        			};
        			array.push(object);
        			res.json(array);
        		}*/
        	});
        },
        
    };
}