'use strict';

/**
 * Module dependencies.
 */
 require('../../../../core/users/server/models/user.js');
 require('../../../rooms/server/models/rooms.js');
 require('../../../search/server/models/search.js');
 require('../../../role/server/models/role.js');
 require('../../../promo_code/server/models/promoCode.js');
 
var notify = require('../../../notification/server/controllers/notify.js');
 
var mongoose = require('mongoose'), 
	BookingModel = mongoose.model('Booking'), 
	UserModel = mongoose.model('User'), 
	RoomsSchemaModel = mongoose.model('Rooms'), 
	ScheduleModel = mongoose.model('Schedule'),
	PromoCodeModel = mongoose.model('PromoCode'),
	RoleModel = mongoose.model('Role'); 
	
var	nodemailer = require('nodemailer'), 
	templates = require('../template'), 
	config = require('meanio').loadConfig(), 
	_ = require('lodash'),
	async = require('async'),
	payumoney = require('./payumoney.js'),
	scheduler = require('./scheduler.js'),
	Mailgen = require('mailgen'),
	GuestModel = mongoose.model('Guest'),
    mail = require('../../../../core/system/server/services/mailService.js'),
    randtoken = require('rand-token');
var logger = require('../../../../core/system/server/controllers/logs.js');
var sms = require('../../../../core/system/server/controllers/sms.js');

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

function sendMailTemplates(actor,req,booking,bookingsstartTime,bookingsendTime) {
    var mailOptions = {
        to: [actor.email],
        from: config.emailFrom
    };
    mailOptions = templates.booking_cancellation(booking.user,req,booking,bookingsstartTime,bookingsendTime,mailOptions);
    sendMail(mailOptions);
}

function sendMailTemplate(actor, room,space,booking,bookingsstartTime,bookingsendTime) {
    var mailOptions = {
        to: [actor.email],
        from: config.emailFrom
    };
    mailOptions = templates.booking_email(actor, room,space,booking,bookingsstartTime,bookingsendTime,mailOptions);
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
        guest: function(req, res, next, id) {
            GuestModel.load(id, function(err, booking) {
                if (err) return next(err);
                if (!guest) return next(new Error('Failed to load guest ' + id));
                req.guest = guest;
                next();
            });
        },

		create : function(req, res) {
			var user = req.user;
	    	var userObj;
			var room = req.body.room;
			var partner;
			if(req.body.feature && req.body.feature === 'Event Calendar'){
				partner = req.body.partner;
			} else {
				partner = req.body.room.spaceId.partner;
			}
			
            if(partner.commissionPercentage && (partner.commissionPercentage.length > 0)){
				for (var i = 0; i < partner.commissionPercentage.length; i++) {
					if (partner.commissionPercentage[i]._id.toString() == room.roomtype._id.toString()) {
						var commission = partner.commissionPercentage[i].commission;
						var finalCommissionValue = req.body.price * (commission / 100);
						var PartnerFinalPrice = req.body.price - finalCommissionValue;
						req.body.partnerAmount = PartnerFinalPrice;
						req.body.adminAmount = finalCommissionValue;
					} else {
						console.log("No operations to perform");
					}
				}
            } else {
	        	return res.status(500).json({
	            	ERRBOOKING: 'Partner doesnt have Commission Percentage',
	            	ERRCODE: 1100
	            });
	        }
			
			var scheduleTrainingList = req.body.scheduleTraining;
			
			req.body.scheduleTraining = [];
			var fromDate = req.body.fromDate;
			var endDate = req.body.endDate;
			var timeZoneOffset = parseInt(req.body.timeZoneOffset);
			//delete req.body.fromDate;
			//delete req.body.endDate;
			delete req.body.timeZoneOffset;
			
			var bookingFrom = req.body.bookingFrom;
			var bookingTo = req.body.bookingTo;
			var bookingStartTime = req.body.bookingStartTime;
			var bookingEndTime = req.body.bookingEndTime;
			
			req.body.startTime = bookingStartTime;
			req.body.endTime = bookingEndTime;
			req.body.timeZoneOffset = timeZoneOffset;
			
			req.body.bookingStartTime = new Date(fromDate + " " + bookingStartTime);
			req.body.bookingEndTime = new Date(endDate + " " + bookingEndTime);
			req.body.bookingDate = new Date(fromDate + " " + bookingStartTime);
			
			var bookingStart, bookingEnd;
			var bookingList = [];
			var counter = 0, countWeekDays = 0, slotNotAvailable = false;

			var betweenDates = [], scheduleCurrentAvailable = [];
			betweenDates = scheduler.dateRangeWithTime(bookingFrom, bookingTo, bookingStartTime, bookingEndTime);
			
			/*
			 * generating booking confirmation id
			 */
				var city = '';
				var year = '';
				var roomType = '';
				if (room.spaceId.city.match(RegExp('^Bangalore$', "i"))) {
					city = 'BNG';
				} else if (room.spaceId.city.match(RegExp('^Pune$', "i"))) {
					city = 'PUN';
				} else {
					city = 'MUM';
				}
					roomType = 'T';
				
				var date = new Date();
				year = date.getFullYear();
				var bookingid = city.concat(roomType);
				bookingid = bookingid.concat(year);
				req.body.bookingConfirmationId = bookingid;
                   
            /*
			 * end of generating booking confirmation id
			 */
			async.waterfall([ function(done) {
				
				async.each(scheduleTrainingList, function(scheduleObj, callback) {
					
			    	var currentAvail = scheduleObj.currentAval;
					if(currentAvail.length > 0){
				    	//var scheduleObjDate = new Date(scheduleObj.date);
				    	var scheduleObjDate = new Date(currentAvail[0].startTime);
				    	scheduleObjDate = scheduleObjDate.setMinutes(scheduleObjDate.getMinutes() - timeZoneOffset);
				    	scheduleObjDate = new Date(scheduleObjDate);

				    	/*if(scheduleObj.isAllday){
					    	scheduleObjDate.setDate(scheduleObjDate.getDate() - 1);
				    	}*/
				    	console.log(scheduleObjDate);
				    	
				    	// Using 'scheduler' 'customizeTimeForDate'
				    	var offsetStartTime = new Date(scheduler.customizeTimeForDate(scheduleObjDate, bookingStartTime));
				    	offsetStartTime = offsetStartTime.setMinutes(offsetStartTime.getMinutes() + timeZoneOffset);
				    	var startDateTime = new Date(offsetStartTime);
				    	
				    	var offsetEndTime = new Date(scheduler.customizeTimeForDate(scheduleObjDate, bookingEndTime));
				    	offsetEndTime = offsetEndTime.setMinutes(offsetEndTime.getMinutes() + timeZoneOffset);
				    	var endDateTime = new Date(offsetEndTime);
				    	
				    	bookingStart = stringToTimeStamp(startDateTime);
				    	bookingEnd = stringToTimeStamp(endDateTime);
				    	
				    	// Adding 45Mins to booking end time and substracting 45mins from start time
			             
			               var bookingStartTimeSubstract = new Date(startDateTime);
			               var bookingStartTimeSubstractOne = new Date(bookingStartTimeSubstract);
			               var finalBookingStartTime = stringToTimeStamp(bookingStartTimeSubstractOne.setMinutes(bookingStartTimeSubstract.getMinutes()-45));
			               console.log(finalBookingStartTime);
			               
			               //Adding 45Mins for end time
			               var bookingEndTimeAdd = new Date(endDateTime);
			               var bookingEndTimeAddOne = new Date(bookingEndTimeAdd);
			               var finalBookingEndTime = stringToTimeStamp(bookingEndTimeAddOne.setMinutes(bookingEndTimeAdd.getMinutes()+45));
			               
			            // End of Adding 45Mins to booking end time and substracting 45mins from start time
				    	
				    	/*bookingStart = stringToTimeStamp(scheduler.customizeTimeAndDate(scheduleObjDate, bookingStartTime));
				    	bookingEnd = stringToTimeStamp(scheduler.customizeTimeAndDate(scheduleObjDate, bookingEndTime));*/
				    	
			            req.body.bookingStartTimeNumber = bookingStart;
			            req.body.bookingEndTimeNumber = bookingEnd;
			            
						var index = scheduler.findSlot(currentAvail, bookingStart, bookingEnd, scheduleObj.isAllday);
						if (index >= 0) {
							var bookingEndHour = new Date(bookingEnd);
			                var bookingEndHourTwo = new Date(bookingEndHour);
			                bookingEndHourTwo.setMinutes( bookingEndHour.getMinutes() + 60 );
			                var bookingEndTimeFinal = stringToTimeStamp(bookingEndHourTwo);
			                
							var splittedSlot = scheduler.splitSlot(currentAvail[index], finalBookingStartTime, finalBookingEndTime);
							currentAvail.splice(index, 1);
							for (var i = splittedSlot.length - 1; i >= 0; i--) {
								currentAvail.splice(index, 0, splittedSlot[i]);
							}
							scheduleCurrentAvailable.push({
								_id: scheduleObj._id,
								currentAvail: currentAvail
							});
							
						} else {
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
								ERRBOOKING: 'Slot already booked',
			                	ERRCODE:5001
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
				if (user == undefined) {
               	 	/*UserModel.findOne({"email": req.body.guest.email}).exec(function (err, requireduserobject) {
                        if (err) {
                            return res.status(500).json({
                                error: 'Cannot list the  users'
                            });
                        } else if(requireduserobject == undefined) {
                       	 	req.body.guest.isGuest = true;
                            req.body.scheduleTraining = bookingList;
                            var guestUser = new UserModel(req.body.guest);
                            guestUser.isPasswordUpdate = true;
                            guestUser.isUserConfirmed = true;
                            var token = randtoken.generate(8);
                            guestUser.password = token;
                            guestUser.save(function(err, userGuest) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    var mailOptions = {
                                        to: userGuest.email,
                                        from: config.emailFrom
                                    };
                                    mailOptions = templates.confirmation_email_guest(userGuest, req, token, mailOptions);
                                    sendMail(mailOptions);
                                    var email = templates.confirmation_email_guest(req, userGuest,token)
                          			mail.mailService(email, userGuest.email)
                                    done(null, userGuest, bookingList);
                                }
                            });
                        }  else {
                       	 	done(null, requireduserobject);
                        }
                    });*/
					var guest = new GuestModel(req.body.guest);
                    guest.save(function(err, guest) {
                        if (err) {
                            return res.status(500).json({
                                ERRBOOKING: 'Cannot save the guest',
                                ERRCODE:1001
                            });
                        }
                        else{
                        	req.body.guestUser=guest._id;
                        	done(null, guest);
                        }
                    });
                }
                else {
                	req.body.user = user;
                    done(null, user, bookingList);
                }

            }, function (user, bookingList, done) {
                
                //req.body.day = scheduleObj.day;
                var booking = new BookingModel(req.body);
                booking.save(function (err, bookedItem) {
                	if (err) {
                        return res.status(500).json({
                        	ERRBOOKING : 'Cannot save the Booking',
                            ERRCODE : 1001,
                            ERRMSG : err
                        });
                    }

                	if(booking.promoCode){
	                	PromoCodeModel.findOne({
	                		_id: booking.promoCode
	                	}).exec(function(err, promoCodeObj){
	                		if (err) {
	                            return res.status(500).json({
	                                ERR: 'Cannot find the promo code : ' + err,
	                                ERRCODE: 2001
	                            });
	                        }
	                		if(promoCodeObj.maxCount){
	                			promoCodeObj.useCount = promoCodeObj.useCount + 1;
	                			promoCodeObj.save(function(err, promoCode){
	                            	if (err) {
	                                    return res.status(500).json({
	                                        ERR: 'Cannot update the promo code : ' + err,
	                                        ERRCODE: 2002
	                                    });
	                                }	
	                			});
	                		}
	                	});
                	}
                	
                    // updating booking confirmation id
                	var s=booking.sequenceNumber.toString();
                    s = s.replace(/\d+/g, function(m){
                    	  return "0000".substr(m.length - 1) + m;
                    	});
                    //booking.bookingConfirmationId=booking.bookingConfirmationId.concat(s);
                    
                    booking.bookingConfirmationId = booking._id;
                    booking.status='Pending';
                    booking.save(function(err,bookingid){
                    	if (err) {
                            return res.status(500).json({
                                ERRBOOKING: 'Cannot save the Booking',
                                ERRCODE : 1001,
                                ERRMSG : err
                            });
                        }	
                    });
                    // end of updating booking confirmation id
                    
                	/*sendMailTemplate(user, room);
                    sendMailTemplate(partner, room);*/
                    
                    var data = payumoney.getPayUMoneyPayload(booking,user);
                    
                    res.json(data);
                    //done(null, data);
                });
	        } ], function(err, result) {
				if(err) {
					return res.status(500).json({
						error: 'Error while booking Hot desk. ' + err
					});
				} 
				//res.json(result);
			});

		},
		
		/**
		 * Booking Training Room by Back Office.
		 */
		createBookingByBackOffice : function(req, res) {
			//var user = req.user;
			var user=req.body.user;
	    	var userObj;
			var room = req.body.room;
			var roomTypeRequired = room.roomtype.name;
			var partner;
			if(req.body.feature && req.body.feature === 'Event Calendar'){
				partner = req.body.partner;
			} else {
				partner = req.body.room.spaceId.partner;
			}

            if(partner.commissionPercentage && (partner.commissionPercentage.length > 0)){
				for (var i = 0; i < partner.commissionPercentage.length; i++) {
					if (partner.commissionPercentage[i]._id.toString() == room.roomtype._id.toString()) {
						var commission = partner.commissionPercentage[i].commission;
						var finalCommissionValue = req.body.price * (commission / 100);
						var PartnerFinalPrice = req.body.price - finalCommissionValue;
						req.body.partnerAmount = PartnerFinalPrice;
						req.body.adminAmount = finalCommissionValue;
					} else {
						console.log("No operations to perform");
					}
				}
            } else {
            	return res.status(500).json({
                	ERRBOOKING: 'Partner doesnt have Commission Percentage',
                	ERRCODE: 1100
                });
            }
            
			/*
			 * generating booking confirmation id
			 */
				var city = '';
				var year = '';
				var roomType = '';
				if (room.spaceId.city.match(RegExp('^Bangalore$', "i"))) {
					city = 'BNG';
				} else if (room.spaceId.city.match(RegExp('^Pune$', "i"))) {
					city = 'PUN';
				} else {
					city = 'MUM';
				}
					roomType = 'T';
				
				var date = new Date();
				year = date.getFullYear();
				var bookingid = city.concat(roomType);
				bookingid = bookingid.concat(year);
				req.body.bookingConfirmationId = bookingid;
                   
            /*
			 * end of generating booking confirmation id
			 */
			var scheduleTrainingList = req.body.scheduleTraining;
			
			req.body.scheduleTraining = [];
			var fromDate = req.body.fromDate;
			var endDate = req.body.endDate;
			var timeZoneOffset = parseInt(req.body.timeZoneOffset);
			delete req.body.fromDate;
			delete req.body.endDate;
			delete req.body.timeZoneOffset;
			
			var bookingFrom = req.body.bookingFrom;
			var bookingTo = req.body.bookingTo;
			var bookingStartTime = req.body.bookingStartTime;
			var bookingEndTime = req.body.bookingEndTime;
			
			req.body.startTime = bookingStartTime;
			req.body.endTime = bookingEndTime;
			
			req.body.bookingStartTime = new Date(fromDate + " " + bookingStartTime);
			req.body.bookingEndTime = new Date(endDate + " " + bookingEndTime);
			req.body.bookingDate = new Date(fromDate + " " + bookingStartTime);
			
			var bookingStart, bookingEnd;
			var bookingList = [];
			var counter = 0, countWeekDays = 0, slotNotAvailable = false;

			var betweenDates = [], scheduleCurrentAvailable = [];
			betweenDates = scheduler.dateRangeWithTime(bookingFrom, bookingTo, bookingStartTime, bookingEndTime);
			
			/*
			 * generating booking confirmation id
			 */
				var city = '';
				var year = '';
				var roomType = '';
				if (room.spaceId.city.match(RegExp('^Bangalore$', "i"))) {
					city = 'BNG';
				} else if (room.spaceId.city.match(RegExp('^Pune$', "i"))) {
					city = 'PUN';
				} else {
					city = 'MUM';
				}
					roomType = 'T';
				
				var date = new Date();
				year = date.getFullYear();
				var bookingid = city.concat(roomType);
				bookingid = bookingid.concat(year);
				req.body.bookingConfirmationId = bookingid;
                   
            /*
			 * end of generating booking confirmation id
			 */
			async.waterfall([ function(done) {
				
				async.each(scheduleTrainingList, function(scheduleObj, callback) {
					
			    	var currentAvail = scheduleObj.currentAval;
					if(currentAvail.length > 0){
				    	//var scheduleObjDate = new Date(scheduleObj.date);
				    	var scheduleObjDate = new Date(currentAvail[0].startTime);
				    	scheduleObjDate = scheduleObjDate.setMinutes(scheduleObjDate.getMinutes() - timeZoneOffset);
				    	scheduleObjDate = new Date(scheduleObjDate);

				    	/*if(scheduleObj.isAllday){
					    	scheduleObjDate.setDate(scheduleObjDate.getDate() - 1);
				    	}*/
				    	console.log(scheduleObjDate);
				    	
				    	// Using 'scheduler' 'customizeTimeForDate'
				    	var offsetStartTime = new Date(scheduler.customizeTimeForDate(scheduleObjDate, bookingStartTime));
				    	offsetStartTime = offsetStartTime.setMinutes(offsetStartTime.getMinutes() + timeZoneOffset);
				    	var startDateTime = new Date(offsetStartTime);
				    	
				    	var offsetEndTime = new Date(scheduler.customizeTimeForDate(scheduleObjDate, bookingEndTime));
				    	offsetEndTime = offsetEndTime.setMinutes(offsetEndTime.getMinutes() + timeZoneOffset);
				    	var endDateTime = new Date(offsetEndTime);
				    	
				    	bookingStart = stringToTimeStamp(startDateTime);
				    	bookingEnd = stringToTimeStamp(endDateTime);
				    	
				    	/*bookingStart = stringToTimeStamp(scheduler.customizeTimeAndDate(scheduleObjDate, bookingStartTime));
				    	bookingEnd = stringToTimeStamp(scheduler.customizeTimeAndDate(scheduleObjDate, bookingEndTime));*/
				    	
			            req.body.bookingStartTimeNumber = bookingStart;
			            req.body.bookingEndTimeNumber = bookingEnd;
			            
						var index = scheduler.findSlot(currentAvail, bookingStart, bookingEnd, scheduleObj.isAllday);
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
				if (user == undefined) {
               	 	UserModel.findOne({"email": req.body.guest.email}).exec(function (err, requireduserobject) {
                        if (err) {
                            return res.status(500).json({
                                error: 'Cannot list the  users'
                            });
                        } else if(requireduserobject == undefined) {
                       	 	/*req.body.guest.isGuest = true;
                            req.body.scheduleTraining = bookingList;
                            var guestUser = new UserModel(req.body.guest);
                            guestUser.isPasswordUpdate = true;
                            guestUser.isUserConfirmed = true;
                            var token = randtoken.generate(8);
                            guestUser.password = token;
                            guestUser.save(function(err, userGuest) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    var mailOptions = {
                                        to: userGuest.email,
                                        from: config.emailFrom
                                    };
                                    mailOptions = templates.confirmation_email_guest(userGuest, req, token, mailOptions);
                                    sendMail(mailOptions);
                                    var email = templates.confirmation_email_guest(req, userGuest,token)
                          			mail.mailService(email, userGuest.email)
                                    done(null, userGuest, bookingList);
                                }
                            });*/
                        	var guest = new GuestModel(req.body.guest);
                            guest.save(function(err, guest) {
                                if (err) {
                                    return res.status(500).json({
                                        ERRBOOKING: 'Cannot save the guest',
                                        ERRCODE:1001
                                    });
                                }
                                else{
                                	req.body.guestUser=guest._id;
                                	done(null, guest,bookingList);
                                }
                            });
                        }  else {
                       	 	done(null, requireduserobject);
                        }
                    });
                }
                else {
                	req.body.user = user;
                    done(null, user, bookingList);
                }

            }, function (user, bookingList, done) {
            	req.body.isWalkin=true;
                //req.body.day = scheduleObj.day;
                var booking = new BookingModel(req.body);
                booking.save(function (err, bookedItem) {
                	if (err) {
                        return res.status(500).json({
                        	ERRBOOKING : 'Cannot save the Booking',
                            ERRCODE : 1001,
                            ERRMSG : err
                        });
                    }

                    // updating booking confirmation id
                	var s=booking.sequenceNumber.toString();
                    s = s.replace(/\d+/g, function(m){
                    	  return "0000".substr(m.length - 1) + m;
                    	});
                    booking.bookingConfirmationId=booking.bookingConfirmationId.concat(s);
                    booking.save(function(err,bookingid){
                    	if (err) {
                            return res.status(500).json({
                                ERRBOOKING: 'Cannot save the Booking',
                                ERRCODE : 1001,
                                ERRMSG : err
                            });
                        }	
                    });
                    // end of updating booking confirmation id
                    
                	/*sendMailTemplate(user, room);
                    sendMailTemplate(partner, room);
                    var data = payumoney.getPayUMoneyPayload(booking,user);
                    
                    //res.json(data);*/
                    var starttime = booking.bookingStartTime;
                    logger.log('info', 'GET '+req._parsedUrl.pathname+' bookingStartTime' + starttime );
                    var starttimeiso  = starttime;
                    starttimeiso.setMinutes(starttimeiso.getMinutes() - (config.zoneOffset.indiaOffset)); 

                      starttimeiso=new Date(starttimeiso);
                   
                    var starttimehrs = starttimeiso.getHours();
                    var starttimemins = starttimeiso.getMinutes();

                    if(starttimemins == 0){
                        starttimemins = starttimemins + '0';
                    }
                    if(starttimehrs  < 12)
                        {
                        var bookingsstartTime = starttimehrs + ':' + starttimemins + 'AM';
                        }
                    else if(starttimehrs == 12)
                    {
                    	var bookingsstartTime =  starttimehrs + ':' + starttimemins + 'PM';
                    }
                    else{
                     starttimehrs=starttimehrs-12;
                         var bookingsstartTime =  starttimehrs + ':' + starttimemins + 'PM';
                        }

                    var endtime = booking.bookingEndTime;
                    logger.log('info', 'GET '+req._parsedUrl.pathname+' bookingEndTime' + endtime );
                    var endtimeiso  = endtime;

                    endtimeiso.setMinutes(endtimeiso.getMinutes() - (config.zoneOffset.indiaOffset)); 
                    endtimeiso=new Date(endtimeiso);

                    var endtimehrs = endtimeiso.getHours();
                    var endtimemins = endtimeiso.getMinutes();

                    if(endtimemins == 0){
                        endtimemins = endtimemins + '0';
                    }
                    if(endtimehrs < 12)
                        {
                        var bookingsendTime = endtimehrs + ':' + endtimemins + 'AM';
                        }
                    else if(endtimehrs == 12)
                    	{
                    	var bookingsendTime =  endtimehrs + ':' + endtimemins + 'PM';
                    	}
                    else{
                     endtimehrs=endtimehrs-12;
                         var bookingsendTime =  endtimehrs + ':' + endtimemins + 'PM';
                    }
                    BookingModel.findOne({_id: booking._id}).populate('user').populate('room').populate('space').populate('guestUser').deepPopulate('roomtype').populate('partner').exec(function (err, booking) {
                        if(err) {
                      	  return res.json(err);
                        }
                        //var space= booking.space;
                        var guestUser=booking.guestUser;
                        console.log("+++++++++++++++++++++++++++++");
                        console.log(booking);
                        console.log("+++++++++++++++++++++++++++++");
                    if(!booking.user){
                    	console.log("in iffffffffff");
                    	GuestModel.findOne({_id: guestUser}).exec(function (err, guestUser) {
	                          if(err) {
	                        	  return res.json(err);
	                          }
                    	var email = templates.booking_email_guest(guestUser, booking.room,booking.space,booking,bookingsstartTime,bookingsendTime,roomTypeRequired);
             			mail.mailService(email,guestUser.email);
             			sms.send(guestUser.phone, 'Thank you for using mymatchbox! Your booking id (' + booking.bookingConfirmationId + ') is confirmed. An email has been forwarded to your registered email id.', function(status) {
                            logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New booking SMS sent [' + guestUser.phone + ']: ' + status);
             			});
                            var emailpartner = templates.booking_email_guest(booking.partner, booking.room,booking.space,booking,bookingsstartTime,bookingsendTime,roomTypeRequired)
                 			mail.mailService(emailpartner,booking.partner.email)   
                    	});		
                    }else{
                    	console.log("in elseeeeeeeeeeeee");
                    	var email = templates.booking_email(booking.user, booking.room,booking.space,booking,bookingsstartTime,bookingsendTime,roomTypeRequired);
             			mail.mailService(email,booking.user.email);
                        sms.send(booking.user.phone, 'Thank you for using mymatchbox! Your booking id (' + booking.bookingConfirmationId + ') is confirmed. An email has been forwarded to your registered email id.', function(status) {
                            logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New booking SMS sent [' + booking.user.phone + ']: ' + status);
                        });	
                        var emailpartner = templates.booking_email(booking.partner, booking.room,booking.space,booking,bookingsstartTime,bookingsendTime,roomTypeRequired)
             			mail.mailService(emailpartner,booking.partner.email)
                    }
                    
         			 /*
 			          *  Sending Booking mail to Back office and Front Office 
 			         */
 			          console.log("+++++++++++space teams");
 			          console.log(booking.space.teams);
 			         console.log("+++++++++++space teams");
                      async.eachSeries(booking.space.teams, function(teamObj, callback1) {
	                      UserModel.findOne({_id: teamObj}).exec(function (err, teamUser) {
	                          if(err) {
	                        	  return res.json(err);	
	                          }
	                          else{
	                        	  if(!booking.user){
	                        		  var emailTeam = templates.booking_email_guest(teamUser, booking.room,booking.space,booking,bookingsstartTime,bookingsendTime,roomType)
			                   			mail.mailService(emailTeam,teamUser.email)
			                   			 sms.send(teamUser.phone, 'A new  booking(' + booking.bookingConfirmationId + ') has been done in your Space. Kindly login to the site to check for details.', function(status) {
                                         logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New booking SMS sent [' + teamUser.phone + ']: ' + status);
                                           });
	                        	  }else{
	                        		  var emailTeam = templates.booking_email(teamUser, booking.room,booking.space,booking,bookingsstartTime,bookingsendTime,roomType)
			                   			mail.mailService(emailTeam,teamUser.email)
			                   			 sms.send(teamUser.phone, 'A new  booking(' + booking.bookingConfirmationId + ') has been done in your Space. Kindly login to the site to check for details.', function(status) {
                                         logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New booking SMS sent [' + teamUser.phone + ']: ' + status);
                                           });
	                        		  }
	                        	  }
	                        	  callback1();
	                      }); 
                      });
                      
 			      
 			    /*
 			     * End of Sending Booking mail to Back office and Front Office
 			     * 
 			     */
                    /*
                     * Sending booking mail to all the admins in the system
                     * 
                     */
                    RoleModel.findOne({'name' :'Admin'}).exec(function (err, adminRole) {
       	               if (err) {
       	                   return res.status(500).json({
       	                       error: 'Cannot list the adminRole'
       	                   });
       	               }
       	               else{
       	            	   UserModel.find({
                               role : { "$in" : [adminRole._id] }
                           }).exec(function (err, adminRoleUser) {
       			               if (err) {
       			                   return res.status(500).json({
       			                       error: 'Cannot list the adminRoleUser'
       			                   });
       			               }
       			               else{
       			            	 async.eachSeries(adminRoleUser, function(userAdminRole, callbackuserAdminRoles) {
       			            		 if(!booking.user){
       			            			var emailadmin = templates.booking_email_guest(userAdminRole, booking.room,booking.space,booking,bookingsstartTime,bookingsendTime,roomTypeRequired)
           	                 			mail.mailService(emailadmin,userAdminRole.email)
       			            		 }else{
       			            			var emailadmin = templates.booking_email(userAdminRole, booking.room,booking.space,booking,bookingsstartTime,bookingsendTime,roomTypeRequired)
           	                 			mail.mailService(emailadmin,userAdminRole.email)
       			            		 }
       		                         callbackuserAdminRoles();
       		                     }, function(err) {
       		                     });
       			            	  
       			               }
       			               
       			           });
       	               }
       	               
       	           });
                     /*
                      * End of sending booking mails to all the admins
                      * 
                      */
                });
                    done(null, booking);
                });
	        } ], function(err, result) {
				if(err) {
					return res.status(500).json({
						error: 'Error while booking Hot desk. ' + err
					});
				} 
				res.json(result);
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
        
        fetchDateRange: function(req, res){
        	async.waterfall([ function(done) {
        		scheduler.calculateDateRange(req.body, function(err, results) {
        			if(err) {
        				return res.status(500).json({
        					error: 'Error while returning value from async waterfall in node module. ' + err
        				});
        			} 
        			var filteredDate = results;
        			done(null, filteredDate);
        		});
        		
        	}, function (filteredDate, done) {
        		scheduler.dateArrayWithUTCTime(filteredDate, req.body, function(err, results) {
        			if(err) {
        				return res.status(500).json({
        					error: 'Error while returning value from async waterfall in node module. ' + err
        				});
        			} 
        			var dateRange = {
        				dateDiff : results.length
        			}
        			return res.json(dateRange); 
        			//done(null, dateRange);
        		});
        		
        	} ], function(err, result) {
        		if(err) {
        			return res.status(500).json({
        				error: 'Error in async waterfall in getting dates. ' + err
        			});
        		} 
        		/*return result;*/
        	});
        }
        
    };
}