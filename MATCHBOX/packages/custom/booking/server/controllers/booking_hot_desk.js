'use strict';

/**
 * Module dependencies.
 */
 require('../../../../core/users/server/models/user.js');
 require('../../../rooms/server/models/rooms.js');
 require('../../../search/server/models/search.js');
 require('../../../role/server/models/role.js');
 require('../../../promo_code/server/models/promoCode.js');
 
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

var sms = require('../../../../core/system/server/controllers/sms.js');
var logger = require('../../../../core/system/server/controllers/logs.js');
var notify = require('../../../notification/server/controllers/notify.js');

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
						//console.log("No operations to perform");
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
			var bookedRooms = [];
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
					roomType = 'H';
				var date = new Date();
				year = date.getFullYear();
				var bookingid = city.concat(roomType);
				bookingid = bookingid.concat(year);
				req.body.bookingConfirmationId = bookingid;
                   
            /*
			 * end of generating booking confirmation id
			 */
			
			async.waterfall([ function(done) {
	        	var scheduleTrainingLists = [];
	        	var scheduleTraining = scheduleTrainingList;
	        	for(var i=0; i < scheduleTraining.length; i++){
		            var isDistinct = false;
		            for(var j=0; j<i; j++){
		                if(JSON.stringify(scheduleTraining[i]) == JSON.stringify(scheduleTraining[j])){
		                    isDistinct = true;
		                    break;
		                }
		            }
		            if(!isDistinct){
		            	console.log(scheduleTraining[i]);
		                scheduleTrainingLists.push(scheduleTraining[i]);
		            }
		        }
		        done(null, scheduleTrainingLists);
		        
	        }, function (scheduleTrainingList, done) {
				
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
				    	
				    	var bookingStart = stringToTimeStamp(startDateTime);
				    	var bookingEnd = stringToTimeStamp(endDateTime);
				    	
				    	// Adding 45Mins to booking end time and substracting 45mins from start time
			             
			               var bookingStartTimeSubstract = new Date(startDateTime);
			               var bookingStartTimeSubstractOne = new Date(bookingStartTimeSubstract);
			               var finalBookingStartTime = stringToTimeStamp(bookingStartTimeSubstractOne.setMinutes(bookingStartTimeSubstract.getMinutes()-45));
			               
			               //Adding 45Mins for end time
			               var bookingEndTimeAdd = new Date(endDateTime);
			               var bookingEndTimeAddOne = new Date(bookingEndTimeAdd);
			               var finalBookingEndTime = stringToTimeStamp(bookingEndTimeAddOne.setMinutes(bookingEndTimeAdd.getMinutes()+45));
			               
			            // End of Adding 45Mins to booking end time and substracting 45mins from start time
				    	
				    	//console.log(scheduler.customizeTimeAndDate(scheduleObjDate, bookingStartTime));
				    	/*bookingStart = stringToTimeStamp(scheduler.customizeTimeAndDate(scheduleObjDate, bookingStartTime));
				    	bookingEnd = stringToTimeStamp(scheduler.customizeTimeAndDate(scheduleObjDate, bookingEndTime));*/
				    	
			            req.body.bookingStartTimeNumber = bookingStart;
			            req.body.bookingEndTimeNumber = bookingEnd;
			            
						var index = scheduler.findSlot(currentAvail, bookingStart, bookingEnd, scheduleObj.isAllday);
						console.log(index);
						
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
							
							bookedRooms.push(scheduleObj.room);
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
			                	ERRCODE: 5001
			                });
						} else {
							//done(null, bookingList);
							var bookedRoomList = bookedRooms;
							var distinctBookedRoomList = [];
							var commonBookedRoomList = [];
							for(var i = 0; i < bookedRoomList.length; i++){
					            var isDistinct = false;
					            for(var j = 0; j < i; j++){
					                if(JSON.stringify(bookedRoomList[i]) === JSON.stringify(bookedRoomList[j])){
					                    isDistinct = true;
					                }
					            }
					            if(!isDistinct){
					            	distinctBookedRoomList.push(bookedRoomList[i]);
					            } else {
				                    commonBookedRoomList.push(bookedRoomList[i]);
					            }
					        }
							//req.body.bookedRooms = bookedRooms;
							req.body.bookedRooms = distinctBookedRoomList;
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
								// scheduleObject.currentAval =  _.extend(scheduleObject.currentAval, scheduleCurrentAvailableObj.currentAvail);
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
                                ERRCODE: 1001
                            });
                        }
                        else{
                        	req.body.guestUser=guest._id;
                        	done(null, guest, bookingList);
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
                    	
                    	// Rooms name that where booked for a Hot Desk
                    	BookingModel.load(booking._id, function (err, bookingObj) {
                            if (err) return next(err);
                            if (!booking) return next(new Error('Failed to load booking ' + bookingObj._id));
                        
                            bookingObj.relatedBookedRooms = [];
                            bookingObj.relatedBookedRooms = bookingObj.bookedRooms;
                            /*bookingObj.relatedBookedRooms = [];
	                    	for(var i = 0; i < bookingObj.bookedRooms.length; i++){
								var relatedBookedRoom = {
									_id : bookingObj.bookedRooms[i]._id,
									name : bookingObj.bookedRooms[i].name
								};
								bookingObj.relatedBookedRooms.push(relatedBookedRoom);
							}*/
	                    	done(null, user, bookingObj);
                    	});
                    });
                    
                    // end of updating booking confirmation id
                });
                
            }, function (user, booking, done) {
            	
            	/*sendMailTemplate(user, room);
                sendMailTemplate(partner, room);*/
                var data;
                data = payumoney.getPayUMoneyPayload(booking,user);
                
                res.json(data);
                //done(null, data);
                
	        } ], function(err, result) {
				if(err) {
					return res.status(500).json({
						error: 'Error while booking Hot desk. ' + err
					});
				} 
				//res.json(result);
			});

		},
		
		createAndroid : function(req, res){
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
						//console.log("No operations to perform");
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
			var timeZoneOffset;
			if (req.body.timeZoneOffset) {    // Need to be implemented in app side, right now its for India only
				timeZoneOffset = parseInt(req.body.timeZoneOffset);
			} else {
				timeZoneOffset = -330;
			}
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
			var bookedRooms = [];
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
					roomType = 'H';
				var date = new Date();
				year = date.getFullYear();
				var bookingid = city.concat(roomType);
				bookingid = bookingid.concat(year);
				req.body.bookingConfirmationId = bookingid;
                   
            /*
			 * end of generating booking confirmation id
			 */
			
			async.waterfall([ function(done) {
	        	var scheduleTrainingLists = [];
	        	var scheduleTraining = scheduleTrainingList;
	        	for(var i=0; i < scheduleTraining.length; i++){
		            var isDistinct = false;
		            for(var j=0; j<i; j++){
		                if(JSON.stringify(scheduleTraining[i]) == JSON.stringify(scheduleTraining[j])){
		                    isDistinct = true;
		                    break;
		                }
		            }
		            if(!isDistinct){
		            	//console.log(scheduleTraining[i]);
		                scheduleTrainingLists.push(scheduleTraining[i]);
		            }
		        }
		        done(null, scheduleTrainingLists);
		        
	        }, function (scheduleTrainingList, done) {
				
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
				    	
				    	var bookingStart = stringToTimeStamp(startDateTime);
				    	var bookingEnd = stringToTimeStamp(endDateTime);
				    	
				    	// Adding 45Mins to booking end time and substracting 45mins from start time
			             
			               var bookingStartTimeSubstract = new Date(startDateTime);
			               var bookingStartTimeSubstractOne = new Date(bookingStartTimeSubstract);
			               var finalBookingStartTime = stringToTimeStamp(bookingStartTimeSubstractOne.setMinutes(bookingStartTimeSubstract.getMinutes()-45));
			               
			               //Adding 45Mins for end time
			               var bookingEndTimeAdd = new Date(endDateTime);
			               var bookingEndTimeAddOne = new Date(bookingEndTimeAdd);
			               var finalBookingEndTime = stringToTimeStamp(bookingEndTimeAddOne.setMinutes(bookingEndTimeAdd.getMinutes()+45));
			               
			            // End of Adding 45Mins to booking end time and substracting 45mins from start time
				    	
				    	//console.log(scheduler.customizeTimeAndDate(scheduleObjDate, bookingStartTime));
				    	
			            req.body.bookingStartTimeNumber = bookingStart;
			            req.body.bookingEndTimeNumber = bookingEnd;
			            
						var index = scheduler.findSlot(currentAvail, bookingStart, bookingEnd, scheduleObj.isAllday);
						console.log(index);
						
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
							
							bookedRooms.push(scheduleObj.room);
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
							return res.status(200).json({
			                	ERRBOOKING: 'Slot already booked',
			                	ERRCODE: 5001
			                });
						} else {
							//done(null, bookingList);
							/*for(var i = 0; i < bookedRooms.length; i++){
								console.log(bookedRooms[i].name);
							}*/
							var bookedRoomList = bookedRooms;
							var distinctBookedRoomList = [];
							var commonBookedRoomList = [];
							for(var i = 0; i < bookedRoomList.length; i++){
					            var isDistinct = false;
					            for(var j = 0; j < i; j++){
					                if(JSON.stringify(bookedRoomList[i]) === JSON.stringify(bookedRoomList[j])){
					                    isDistinct = true;
					                }
					            }
					            if(!isDistinct){
					            	distinctBookedRoomList.push(bookedRoomList[i]);
					            } else {
				                    commonBookedRoomList.push(bookedRoomList[i]);
					            }
					        }
							//req.body.bookedRooms = bookedRooms;
							req.body.bookedRooms = distinctBookedRoomList;
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
								// scheduleObject.currentAval =  _.extend(scheduleObject.currentAval, scheduleCurrentAvailableObj.currentAvail);
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
                                ERRCODE: 1001
                            });
                        }
                        else{
                        	req.body.guestUser=guest._id;
                        	done(null, guest, bookingList);
                        }
                    });
                }
                else {
                	UserModel.findOne({"_id" : req.body.user._id}).exec(function(err, userObj) {
                        if (err) {
                            return res.status(500).json({
                                error: 'Cannot list the userObj'
                            });
                        }
                    	var updatedUser = userObj;
                    	updatedUser = _.extend(updatedUser, req.body.user);
                    	updatedUser.save(function(err, updatedUserObj) {
                            if (err) {
                                return res.status(500).json({
                                    ERRBOOKING: 'Cannot save the user',
                                    ERRCODE:1001,
                                    ERRMSG : err
                                });
                            }
                            req.body.address = {
                                "address1" : updatedUser.address1, 
                                "address2" : updatedUser.address2, 
                                "city" : updatedUser.city, 
                                "state" : updatedUser.state, 
                                "pinCode" : updatedUser.pinCode, 
                                "country" : updatedUser.country
                            }, 
                        	req.body.user = updatedUserObj;
                            done(null, updatedUser, bookingList);
                        });
                	});
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

                 // Rooms name that where booked for a Hot Desk
                	BookingModel.load(booking._id, function (err, bookingObj) {
                        if (err) return next(err);
                        if (!bookingObj) return next(new Error('Failed to load booking ' + bookingObj._id));
                    
                        /*bookingObj.relatedBookedRooms = [];
                        bookingObj.relatedBookedRooms = bookingObj.bookedRooms;*/
                        bookingObj.relatedBookedRooms = [];
                    	for(var i = 0; i < bookingObj.bookedRooms.length; i++){
							var relatedBookedRoom = {
								_id : bookingObj.bookedRooms[i]._id,
								name : bookingObj.bookedRooms[i].name
							};
							bookingObj.relatedBookedRooms.push(relatedBookedRoom);
						}
                        
                        bookingObj.bookingConfirmationId = booking._id;
                        bookingObj.status = 'Pending';
                        bookingObj.save(function(err, bookingid){
	                    	if (err) {
	                            return res.status(500).json({
	                                ERRBOOKING: 'Cannot save the Booking',
	                                ERRCODE : 1001,
	                                ERRMSG : err
	                            });
	                        }	
	                    	
	                    	done(null, user, bookingObj);
	                    });
	                    // end of updating booking confirmation id
                	});
                });
            }, function (user, booking, done) {
            	/*sendMailTemplate(user, room);
                sendMailTemplate(partner, room);*/
            	
                var data;
                if(booking.price && booking.price == 0){
                	data = {
                		txnid : booking._id,
                		amount : booking.price
                	};
                } else {
                	data = payumoney.getPayUMoneyPayload(booking,user);
                	// data = booking;
                }
                
                res.json(data);
                //done(null, data);
                
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
		 * Booking Hot-Desk by Back Office.
		 */
		createBookingByBackOffice : function(req, res) {
			var user = req.user;
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
						//console.log("No operations to perform");
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
			var bookedRooms = [];
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
					roomType = 'H';
				var date = new Date();
				year = date.getFullYear();
				var bookingid = city.concat(roomType);
				bookingid = bookingid.concat(year);
				req.body.bookingConfirmationId = bookingid;
                   
            /*
			 * end of generating booking confirmation id
			 */
			
			async.waterfall([ function(done) {
	        	var scheduleTrainingLists = [];
	        	var scheduleTraining = scheduleTrainingList;
	        	for(var i=0; i < scheduleTraining.length; i++){
		            var isDistinct = false;
		            for(var j=0; j<i; j++){
		                if(JSON.stringify(scheduleTraining[i]) == JSON.stringify(scheduleTraining[j])){
		                    isDistinct = true;
		                    break;
		                }
		            }
		            if(!isDistinct){
		            	console.log(scheduleTraining[i]);
		                scheduleTrainingLists.push(scheduleTraining[i]);
		            }
		        }
		        done(null, scheduleTrainingLists);
		        
	        }, function (scheduleTrainingList, done) {
				
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
				    	
				    	var bookingStart = stringToTimeStamp(startDateTime);
				    	var bookingEnd = stringToTimeStamp(endDateTime);
				    	
				    	// Adding 45Mins to booking end time and substracting 45mins from start time
			             
			               var bookingStartTimeSubstract = new Date(startDateTime);
			               var bookingStartTimeSubstractOne = new Date(bookingStartTimeSubstract);
			               var finalBookingStartTime = stringToTimeStamp(bookingStartTimeSubstractOne.setMinutes(bookingStartTimeSubstract.getMinutes()-45));
			               
			               //Adding 45Mins for end time
			               var bookingEndTimeAdd = new Date(endDateTime);
			               var bookingEndTimeAddOne = new Date(bookingEndTimeAdd);
			               var finalBookingEndTime = stringToTimeStamp(bookingEndTimeAddOne.setMinutes(bookingEndTimeAdd.getMinutes()+45));
			               
			            // End of Adding 45Mins to booking end time and substracting 45mins from start time
				    	
				    	//console.log(scheduler.customizeTimeAndDate(scheduleObjDate, bookingStartTime));
				    	/*bookingStart = stringToTimeStamp(scheduler.customizeTimeAndDate(scheduleObjDate, bookingStartTime));
				    	bookingEnd = stringToTimeStamp(scheduler.customizeTimeAndDate(scheduleObjDate, bookingEndTime));*/
				    	
			            req.body.bookingStartTimeNumber = bookingStart;
			            req.body.bookingEndTimeNumber = bookingEnd;
			            
						var index = scheduler.findSlot(currentAvail, bookingStart, bookingEnd, scheduleObj.isAllday);
						console.log(index);
						
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
							
							bookedRooms.push(scheduleObj.room);
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
							var bookedRoomList = bookedRooms;
							var distinctBookedRoomList = [];
							var commonBookedRoomList = [];
							for(var i = 0; i < bookedRoomList.length; i++){
					            var isDistinct = false;
					            for(var j = 0; j < i; j++){
					                if(JSON.stringify(bookedRoomList[i]) === JSON.stringify(bookedRoomList[j])){
					                    isDistinct = true;
					                }
					            }
					            if(!isDistinct){
					            	distinctBookedRoomList.push(bookedRoomList[i]);
					            } else {
				                    commonBookedRoomList.push(bookedRoomList[i]);
					            }
					        }
							//req.body.bookedRooms = bookedRooms;
							req.body.bookedRooms = distinctBookedRoomList;
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
								// scheduleObject.currentAval =  _.extend(scheduleObject.currentAval, scheduleCurrentAvailableObj.currentAvail);
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
                    sendMailTemplate(partner, room);*/
                    
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
                    if(starttimehrs  < 12){
                        var bookingsstartTime = starttimehrs + ':' + starttimemins + 'AM';
                    } else if(starttimehrs == 12){
                    	var bookingsstartTime =  starttimehrs + ':' + starttimemins + 'PM';
                    } else{
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
                    if(endtimehrs < 12){
                        var bookingsendTime = endtimehrs + ':' + endtimemins + 'AM';
                    } else if(endtimehrs == 12){
                    	var bookingsendTime =  endtimehrs + ':' + endtimemins + 'PM';
                    }else{
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
	                    if(!booking.user){
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
	 			          console.log(booking.space.teams);
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
		                        	  } else {
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
	       			               } else {
	       			            	 async.eachSeries(adminRoleUser, function(userAdminRole, callbackuserAdminRoles) {
	       			            		 if(!booking.user){
	       			            			var emailadmin = templates.booking_email_guest(userAdminRole, booking.room,booking.space,booking,bookingsstartTime,bookingsendTime,roomTypeRequired)
	           	                 			mail.mailService(emailadmin,userAdminRole.email)
	       			            		 } else {
	       			            			var emailadmin = templates.booking_email(userAdminRole, booking.room,booking.space,booking,bookingsstartTime,bookingsendTime,roomTypeRequired)
	           	                 			mail.mailService(emailadmin,userAdminRole.email)
	       			            		 }
	       		                         callbackuserAdminRoles();
	       		                     }, function(err) {
	       		                    	 console.log(err);
	       		                     });
	       			            	  
	       			               }
	       			               
	       			           });
	       	               }
	       	               
	       	           });
	                    
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
             ]}).populate('room', '_id name').exec(function (err, bookingAvailabilitySchedules) {
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
        
        cancelBooking : function(req, res){
            BookingModel.load(req.body.bookedId, function(err, booking) {
                if (err) return next(err);
                booking.status = 'Cancelled';
                booking.reason = req.body.reason;
                booking.reasondescription = req.body.reasondescription;
                booking.initiatedBy = req.body.initiatedBy;
	     		booking.cancelledBy = req.body.cancelledBy;
                booking.save(function(err, bookedItem) {
                    if (err) {
                        return res.status(500).json({
                            status: 'Failed',
                            error: 'Cannot save the Booking'
                        });
                    }
                    async.waterfall([ function(done) {
                    	var scheduleTraining = booking.scheduleTraining;
                    	var scheduleTrainingList = [];
                    	for(var i=0; i<scheduleTraining.length; i++){
            	            var isDistinct = false;
            	            for(var j=0; j<i; j++){
            	                if(JSON.stringify(scheduleTraining[i]) == JSON.stringify(scheduleTraining[j])){
            	                    isDistinct = true;
            	                    break;
            	                }
            	            }
            	            if(!isDistinct){
            	                scheduleTrainingList.push(scheduleTraining[i]);
            	            }
            	        }
            	        done(null, scheduleTrainingList);
                    }, function (uniqueScheduleList, done) {
                    	console.log(uniqueScheduleList);
                    	async.eachSeries(uniqueScheduleList, function(scheduleObj, callback1) {
	                    	ScheduleModel.load(scheduleObj, function(err, schedule) {
	                    		if(err) {
	                                return res.status(500).json({
	                                    status: 'Failed',
	                                    error: 'Cannot load the Schedule',
	                                    err: err
	                                });
	                    		}
		                        var newtimeobj = {};
		                        var currentAvail = schedule.currentAval;
		                        
	    				    	//var scheduleObjDate = new Date(scheduleObj.date);
	    				    	var scheduleObjDate = new Date(currentAvail[0].startTime);
	    				    	scheduleObjDate = scheduleObjDate.setMinutes(scheduleObjDate.getMinutes() - booking.timeZoneOffset);
	    				    	scheduleObjDate = new Date(scheduleObjDate);

	    				    	// Using 'scheduler' 'customizeTimeForDate'
	    				    	var offsetStartTime = new Date(scheduler.customizeTimeForDate(scheduleObjDate, booking.startTime));
	    				    	var bookingsStartTime = offsetStartTime;
	    				    	offsetStartTime = offsetStartTime.setMinutes(offsetStartTime.getMinutes() + booking.timeZoneOffset);
	    				    	var startDateTime = new Date(offsetStartTime);
	    				    	
	    				    	var offsetEndTime = new Date(scheduler.customizeTimeForDate(scheduleObjDate, booking.endTime));
	    				    	offsetEndTime = offsetEndTime.setMinutes(offsetEndTime.getMinutes() + booking.timeZoneOffset);
	    				    	var endDateTime = new Date(offsetEndTime);
	    				    	
	    				    	var bookingStart = stringToTimeStamp(startDateTime);
	    				    	var bookingEnd = stringToTimeStamp(endDateTime);
	    				    	
		                        // Adding 45Mins to booking end time and substracting 45mins from start time
		             
					               var bookingStartTimeSubstract = new Date(bookingStart);
					               var bookingStartTimeSubstractOne = new Date(bookingStartTimeSubstract);
					               var finalBookingStartTime = stringToTimeStamp(bookingStartTimeSubstractOne.setMinutes(bookingStartTimeSubstract.getMinutes()-45));
					               
					               //Adding 45Mins for end time
					               var bookingEndTimeAdd = new Date(bookingEnd);
					               var bookingEndTimeAddOne = new Date(bookingEndTimeAdd);
					               var finalBookingEndTime = stringToTimeStamp(bookingEndTimeAddOne.setMinutes(bookingEndTimeAdd.getMinutes()+45));
					               
					            // End of Adding 45Mins to booking end time and substracting 45mins from start time
		                
		                        newtimeobj.startTime = new Date(finalBookingStartTime);
		                        newtimeobj.endTime = new Date(finalBookingEndTime);
		                        newtimeobj.isBlocked = true;
		                        schedule.currentAval.push(newtimeobj);
		                        schedule.currentAval.sort(function(a, b) {
		                            return new Date(a.startTime) - new Date(b.startTime);
		                        });
		                        var schedule = schedule;
		                        schedule = _.extend(schedule, schedule);
		                        schedule.save(function(err) {
		                            if (err) {
		                                return res.status(500).json({
		                                	status: 'Failed',
		                                    error: 'Cannot update the feature'
		                                });
		                            }
		                            var currentAvail = schedule.currentAval;
		                            var index = scheduler.findBlockedSlot(currentAvail, bookingsStartTime, newtimeobj.endTime);
			                        console.log(index);
		                            currentAvail[index].isBlocked = false;
		                            currentAvail = scheduler.mergeAllSlot(currentAvail);
		                            schedule.currentAval = currentAvail;
		                            RoleModel.findOne({"name":"Admin"},function(err,role){
		                                if(err) {
		                                	logger.log('error', 'GET '+req._parsedUrl.pathname+'Checking for admin login'+err+''); 
		                                } else {
		                                    UserModel.find({
		                                         role : { "$in" : [role._id] }
		                                    }, function(err, users) {
			                                	  async.each(users, function (user, callback) {
			                                		  notify.addNotificationURL('Cancelled',booking.bookingConfirmationId +'     '+ ' has been cancelled.Click here for more details', user,'/admin/bookings');
			                                		  callback();
			                                	  });
		                                    });
		                                }
		                           });
		                              
		                           notify.addNotificationURL('Cancelled',booking.bookingConfirmationId +'		'+ ' has been cancelled.Click here for more details', booking.user,'/bookings/mybookings');
		                           notify.addNotificationURL('Cancelled',booking.bookingConfirmationId +'		'+ ' has been cancelled.Click here for more details', booking.partner,'/admin/bookings');
		                           schedule.save(function(err) {
		                                if (err) {
		                                    return res.status(500).json({
		                                    	status: 'Failed',
		                                        error: 'Cannot update the schedule'
		                                    });
		                                }

			                            var starttime = booking.bookingStartTime;
			                            logger.log('info', 'GET '+req._parsedUrl.pathname+' bookingStartTime' + starttime );
			                            var starttimeiso = starttime;
			                            starttimeiso.setMinutes(starttimeiso.getMinutes() - (config.zoneOffset.indiaOffset)); 
			
			                            starttimeiso = new Date(starttimeiso);
			                           
			                            var starttimehrs = starttimeiso.getHours();
			                            var starttimemins = starttimeiso.getMinutes();
			
			                            if(starttimemins == 0){
			                                starttimemins = starttimemins + '0';
			                            }
			                            
			                            if(starttimehrs  < 12) {
			                                var bookingsstartTime = starttimehrs + ':' + starttimemins + 'AM';
			                            } else if(starttimehrs == 12) {
			                            	var bookingsstartTime =  starttimehrs + ':' + starttimemins + 'PM';
			                            } else{
			                            	starttimehrs = starttimehrs - 12;
			                                var bookingsstartTime =  starttimehrs + ':' + starttimemins + 'PM';
			                            }
			
			                            var endtime = booking.bookingEndTime;
			                            logger.log('info', 'GET '+req._parsedUrl.pathname+' bookingEndTime' + endtime );
			                            var endtimeiso  = endtime;
			
			                            endtimeiso.setMinutes(endtimeiso.getMinutes() - (config.zoneOffset.indiaOffset)); 
			                            endtimeiso = new Date(endtimeiso);
			
			                            var endtimehrs = endtimeiso.getHours();
			                            var endtimemins = endtimeiso.getMinutes();
			
			                            if(endtimemins == 0){
			                                endtimemins = endtimemins + '0';
			                            }
			                            
			                            if(endtimehrs < 12){
			                                var bookingsendTime = endtimehrs + ':' + endtimemins + 'AM';
			                            } else if(endtimehrs == 12) {
			                            	var bookingsendTime =  endtimehrs + ':' + endtimemins + 'PM';
			                        	} else{
			                        		endtimehrs=endtimehrs-12;
			                                var bookingsendTime =  endtimehrs + ':' + endtimemins + 'PM';
			                            }
			                            			                            
			                            var guestUser = booking.guestUser;
				 						var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	                                    var bookingNewDate = new Date(booking.bookingDate);
	                                    var bookingMonth = months[bookingNewDate.getMonth()];
	                                    var bookingDate = bookingNewDate.getDate();
	                                    var bookingYear = bookingNewDate.getFullYear();

			                            if(!booking.user){
			                            	var emailGuest = templates.booking_cancellation_guest(guestUser, req,booking,bookingsstartTime,bookingsendTime, bookingMonth, bookingDate , bookingYear);
				                 			mail.mailService(emailGuest,guestUser.email);
				                 			var partnerEmailGuest = templates.booking_cancellation_partner_mail(booking.user, req,booking,bookingsstartTime,bookingsendTime, bookingMonth, bookingDate , bookingYear);
		                 					mail.mailService(partnerEmailGuest,booking.partner.email);
		                 					if(booking.bookingConfirmationId.length > 13){
                                               	sms.send(guestUser.phone, 'Your booking has been cancelled. An email has been forwarded to your registered email id.', function(status) {
			                                    	logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New booking SMS sent [' + guestUser.phone + ']: ' + status);
			                                	});
                                            }
                                            else {         
					                 			sms.send(guestUser.phone, 'Your booking id (' + booking.bookingConfirmationId + ') has been cancelled. An email has been forwarded to your registered email id.', function(status) {
				                                    logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New booking SMS sent [' + guestUser.phone + ']: ' + status);
				                                });
				                 			}
			                            } else {
			                                var email = templates.booking_cancellation(booking.user, req,booking,bookingsstartTime,bookingsendTime, bookingMonth, bookingDate , bookingYear);
				                 			mail.mailService(email,booking.user.email);
				                 			var partnerEmail = templates.booking_cancellation_partner_mail(booking.user, req,booking,bookingsstartTime,bookingsendTime, bookingMonth, bookingDate , bookingYear);
		                 					mail.mailService(partnerEmail,booking.partner.email);
				                 			var user = booking.user;


				                 			if(booking.bookingConfirmationId.length > 13){
                                               	sms.send(user.phone, 'Your booking has been cancelled. An email has been forwarded to your registered email id.', function(status) {
													logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New booking SMS sent [' + user.phone + ']: ' + status);
												});
                                            }
                                            else {
                                               		
				                 			sms.send(user.phone, 'Your booking id (' + booking.bookingConfirmationId + ') has been cancelled. An email has been forwarded to your registered email id.', function(status) {
			                                    logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New booking SMS sent [' + user.phone + ']: ' + status);
			                                });
				                 		}
			                            }
			                 			/*res.status(200).json({
			                            	status: 'Success'
			                            });*/
			                            callback1();
		                            });
		                        });
		                    });
                    	}, function(err) {
        					if(err) {
        						return res.status(500).json({
        							error: 'Error for outer loop. ' + err
        						});
        					} 
        					//done(null, data);
        					res.status(200).json({
                            	status: 'Success'
                            });
        				});
                    	
                    } ], function(err, result) {
        				if(err) {
        					return res.status(500).json({
        						error: 'Error while booking Hot desk. ' + err
        					});
        				} 
        				//res.json(result);
        			});
                    
                });
            });
        }
        
        
        
    };
}