'use strict';
/**
 * Module dependencies.
 */
require('../../../../core/users/server/models/user.js');
require('../../../rooms/server/models/rooms.js');
require('../../../search/server/models/search.js');
require('../../../notification/server/models/notification.js');
require('../../../role/server/models/role.js');
require('../../../space/server/models/space.js');
require('../../../promo_code/server/models/promoCode.js');

//var notify = require('../../../notification/server/controllers/notify.js');
var mongoose = require('mongoose'),
    BookingModel = mongoose.model('Booking'),
    UserModel = mongoose.model('User'),
    RoomsSchemaModel = mongoose.model('Rooms'),
    ScheduleModel = mongoose.model('Schedule'),
    NotificationModel = mongoose.model('Notification'),
    nodemailer = require('nodemailer'),
    templates = require('../template'),
    config = require('meanio').loadConfig(),
    async = require('async'),
    SpaceModel = mongoose.model('Space'),
    _ = require('lodash'),
    payumoney = require('./payumoney.js'),
    scheduler = require('./scheduler.js'),
    Mailgen = require('mailgen'),
	PromoCodeModel = mongoose.model('PromoCode'),
    mail = require('../../../../core/system/server/services/mailService.js'),
    GuestModel = mongoose.model('Guest'),
    randtoken = require('rand-token'),
    cancelBookingReasonModel = mongoose.model('CancelBookingReasons'),
    partnerCancelBookingReasonModel = mongoose.model('PartnerCancelBookingReason');

var config = require('meanio').loadConfig();
var RoleModel = mongoose.model("Role");
var notify = require('../../../notification/server/controllers/notify.js');
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
 string to time conversion
 */
function stringToTimeStamp(dateString) {
    var dateTime = dateString;
    var date = new Date(dateTime);
    return date.getTime();
}
module.exports = function(Booking) {
    return {
        /**
         * Find Booking by id
         */
        booking: function(req, res, next, id) {
            BookingModel.load(id, function(err, booking) {
                if (err) return next(err);
                if (!booking) return next(new Error('Failed to load booking ' + id));
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
        space: function(req, res, next, id){
            SpaceModel.load(id, function (err, space) {
                    if (err) { return next(err); }
                    if (!space) { return next(new Error('Failed to load space ' + id)); }
                    req.space = space;
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
        create: function(req, res) {
            var user = req.body.user;
            RoomsSchemaModel.findOne({"_id": req.body.room}).populate("spaceId").populate("partner").populate('roomtype').exec(function (err, roomObj) {
                   if (err) {
                         return res.status(500).json({
                         error: 'Cannot list the roomObj'
                  });
             }
            req.body.roomPrice={};      
            var room = roomObj;
            var offsetTimeFromObject=config.zoneOffset.indiaOffset;
            var bookingDate=new Date(req.body.bookingStartTime);
            bookingDate=bookingDate.setMinutes(bookingDate.getMinutes() - offsetTimeFromObject );
            req.body.bookingDate=bookingDate;
            req.body.roomPrice.pricePerHour=room.pricePerhour;
            req.body.roomPrice.pricePerHalfday=room.pricePerhalfday;
            req.body.roomPrice.pricePerFullday=room.pricePerfullday;
            var partner = room.partner;
            

            if(partner.commissionPercentage && (partner.commissionPercentage.length > 0)){
	            for(var i=0 ;i<partner.commissionPercentage.length;i++){
	            	if(partner.commissionPercentage[i]._id.toString() == room.roomtype._id.toString()){
	            		var commission=partner.commissionPercentage[i].commission;
	            		var finalCommissionValue=req.body.price *(commission/100);
			    	     var PartnerFinalPrice=req.body.price-finalCommissionValue;
			    	     req.body.partnerAmount=PartnerFinalPrice;
			    	     req.body.adminAmount=finalCommissionValue;
	            	}
	            	else{
	            		console.log("No operations to perform");
	            	}
	            }
            } else {
            	return res.status(500).json({
                	ERRBOOKING: 'Partner doesnt have Commission Percentage',
                	ERRCODE: 1100
                });
            }
            var schedule = req.body.schedule;
            var currentAvail = schedule.currentAval;
            var bookingStart = stringToTimeStamp(req.body.bookingStartTime);
            var bookingEnd = stringToTimeStamp(req.body.bookingEndTime);
            /*
             * Adding 45Mins to booking end time and substracting 45mins from start time
             * 
             */
               var bookingStartTimeSubstract=new Date(req.body.bookingStartTime);
               var bookingStartTimeSubstractOne=new Date(bookingStartTimeSubstract);
               var finalBookingStartTime=stringToTimeStamp(bookingStartTimeSubstractOne.setMinutes(bookingStartTimeSubstract.getMinutes()-45));

               console.log(finalBookingStartTime);
               //Adding 45Mins for end time
               var bookingEndTimeAdd=new Date(req.body.bookingEndTime);
               var bookingEndTimeAddOne=new Date(bookingEndTimeAdd);
               var finalBookingEndTime=stringToTimeStamp(bookingEndTimeAddOne.setMinutes(bookingEndTimeAdd.getMinutes()+45));
               
              /*
               * End of Adding 45Mins to booking end time and substracting 45mins from start time
               * 
               */ 
              
            var bookingStartOne = new Date(req.body.bookingStartTime);
            var starttimehours = bookingStartOne.getHours();
            var starttimeminutes = bookingStartOne.getMinutes();
            var bookingStartTimeNumber = starttimehours * 60 + starttimeminutes;
            var bookingEndOne = new Date(req.body.bookingEndTime);
            var endtimehours = bookingEndOne.getHours();
            var endtimeminutes = bookingEndOne.getMinutes();
            var bookingEndTimeNumber = endtimehours * 60 + endtimeminutes;
            var bookingEndHour = new Date(bookingEnd);
            var bookingEndHourTwo = new Date(bookingEndHour);
            bookingEndHourTwo.setMinutes(bookingEndHour.getMinutes() + 60);
            var bookingEndTimeFinal = stringToTimeStamp(bookingEndHourTwo);
            var bookinStartOne=new Date(req.body.bookingStartTime);
            var bookinStartTwo=new Date(bookinStartOne);
            bookinStartTwo.setMinutes(bookinStartOne.getMinutes() - 60);
            var bookingStartTimeFinal= stringToTimeStamp(bookinStartTwo);
            // req.body.bookingEndTime=bookingEndTimeFinal;
            req.body.day = req.body.schedule.day;
		            /*
		             * generating booking confirmation id
		             * 
		             */
                           var city='';
                           var year ='';
                           var roomType ='';
                           if(room.spaceId.city.match(RegExp('^Bangalore$', "i"))){
                        	   city='BNG';
                           }else if(room.spaceId.city.match(RegExp('^Pune$', "i"))){
                        	   city='PUN';
                           }else{
                        	   city='MUM';
                           }
                           
                           if(room.roomtype.name == 'Meeting Room'){
                        	   roomType='M';
                           } else{
                        	   roomType='B';
                           }
                           var date=new Date();
                           year= date.getFullYear();
                           var bookingid=city.concat(roomType);
                           bookingid=bookingid.concat(year);
                           req.body.bookingConfirmationId=bookingid;
                           
		            /*
		             * end of generating booking confirmation id
		             * 
		             */

             
          var index = scheduler.findSlot(currentAvail, bookingStart, bookingEnd, schedule.isAllday);
        if (index >= 0) {
                var splittedSlot = scheduler.splitSlot(currentAvail[index], finalBookingStartTime, finalBookingEndTime);
                currentAvail.splice(index, 1);
                for (var i = splittedSlot.length - 1; i >= 0; i--) {
                    currentAvail.splice(index, 0, splittedSlot[i])
                }
                var scheduleOne = req.schedule;
                scheduleOne.currentAval = currentAvail;
                scheduleOne.save(function(err) {
                    if (err) {
                        return res.status(500).json({
                            error: 'Cannot update the schedule'
                        });
                    }
                });
                //saving guest user and booking creating user object
                async.waterfall([
                    function(done) {
                        if (user == undefined) {
                            /*UserModel.findOne({
                                "email": req.body.guest.email
                            }).exec(function(err, requireduserobject) {
                                if (err) {
                                    return res.status(500).json({
                                        error: 'Cannot list the  users'
                                    });
                                } else if (requireduserobject == undefined) {
                                    req.body.guest.isGuest = true;
                                    var guestUser = new UserModel(req.body.guest);
                                    guestUser.isPasswordUpdate = true;
                                    guestUser.isUserConfirmed = true;
                                    var token = randtoken.generate(8);
                                    guestUser.password = token;
                                    guestUser.save(function(err, userGuest) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            var email = templates.confirmation_email_guest(req,userGuest,token);
                                  			mail.mailService(email,userGuest.email);
                                            
                                            done(null, userGuest);
                                        }
                                    });
                                } else {
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
                        } else {
                        	req.body.user = user;
                            done(null, user);
                        }
                    },
                    function(user, done) {
                        //req.body.user = user;
                        var booking = new BookingModel(req.body);
                        booking.save(function(err, bookedItem) {
                            if (err) {
                                return res.status(500).json({
                                    ERRBOOKING: 'Cannot save the Booking',
                                    ERRCODE:1001
                                });
                            }

                            /**
                             * updating booking confirmation id
                             */
                            var s = booking.sequenceNumber.toString();
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
                                        ERRCODE:1001
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
                            });
                            /**
                             * end of updating booking confirmation id
                             */
                             var data = payumoney.getPayUMoneyPayload(booking,user);
                            res.json(data);
                            done();
                        });
                    }
                ], function(err) {
                    console.log(err);
                });
            } else {
                return res.status(500).json({
                	ERRBOOKING: 'Slot already booked',
                	ERRCODE:5001
                });
            }
            });
        },
        
        createAndroid : function(req, res) {
            var user = req.body.user;
            
        	RoomsSchemaModel.findOne({"_id": req.body.room}).populate("spaceId").populate("partner", "").populate('roomtype').exec(function (err, roomObj) {
        		if (err) {
        			return res.status(500).json({
                        error: 'Cannot list the roomObj'
        			});
        		}
	            req.body.roomPrice={};      
	            var room = roomObj;
	            var offsetTimeFromObject=config.zoneOffset.indiaOffset;
	            var bookingDate=new Date(req.body.bookingStartTime);
	            bookingDate=bookingDate.setMinutes(bookingDate.getMinutes() - offsetTimeFromObject );
	            req.body.bookingDate=bookingDate;
	            req.body.roomPrice.pricePerHour=room.pricePerhour;
	            req.body.roomPrice.pricePerHalfday=room.pricePerhalfday;
	            req.body.roomPrice.pricePerFullday=room.pricePerfullday;
	            var partner;
	            if(room.partner){
	            	partner = room.partner;
	            } else {
	            	// Failed to load partner or partner has been deleted.
	            	return res.status(500).json({
	                	ERRBOOKING: 'Failed to load partner.',
	                	ERRCODE: 1100
        			});
	            }
	            
	            if(partner.commissionPercentage && (partner.commissionPercentage.length > 0)){
		            for(var i=0 ;i<partner.commissionPercentage.length;i++){
		            	if(partner.commissionPercentage[i]._id.toString() == room.roomtype._id.toString()){
		            		var commission=partner.commissionPercentage[i].commission;
		            		var finalCommissionValue=req.body.price *(commission/100);
				    	     var PartnerFinalPrice=req.body.price-finalCommissionValue;
				    	     req.body.partnerAmount=PartnerFinalPrice;
				    	     req.body.adminAmount=finalCommissionValue;
		            	}
		            	else{
		            		console.log("No operations to perform");
		            	}
		            }
	            } else {
	            	return res.status(500).json({
	                	ERRBOOKING: 'Partner doesnt have Commission Percentage',
	                	ERRCODE: 1100
	                });
	            }
	            var schedule = req.body.schedule;
	            var currentAvail = schedule.currentAval;
	            var bookingStart = stringToTimeStamp(req.body.bookingStartTime);
	            var bookingEnd = stringToTimeStamp(req.body.bookingEndTime);
	            /*
	             * Adding 45Mins to booking end time and substracting 45mins from start time
	             * 
	             */
	               var bookingStartTimeSubstract=new Date(req.body.bookingStartTime);
	               var bookingStartTimeSubstractOne=new Date(bookingStartTimeSubstract);
	               var finalBookingStartTime=stringToTimeStamp(bookingStartTimeSubstractOne.setMinutes(bookingStartTimeSubstract.getMinutes()-45));
	
	               console.log(finalBookingStartTime);
	               //Adding 45Mins for end time
	               var bookingEndTimeAdd=new Date(req.body.bookingEndTime);
	               var bookingEndTimeAddOne=new Date(bookingEndTimeAdd);
	               var finalBookingEndTime=stringToTimeStamp(bookingEndTimeAddOne.setMinutes(bookingEndTimeAdd.getMinutes()+45));
	               
	              /*
	               * End of Adding 45Mins to booking end time and substracting 45mins from start time
	               * 
	               */ 
	              
	            var bookingStartOne = new Date(req.body.bookingStartTime);
	            var starttimehours = bookingStartOne.getHours();
	            var starttimeminutes = bookingStartOne.getMinutes();
	            var bookingStartTimeNumber = starttimehours * 60 + starttimeminutes;
	            var bookingEndOne = new Date(req.body.bookingEndTime);
	            var endtimehours = bookingEndOne.getHours();
	            var endtimeminutes = bookingEndOne.getMinutes();
	            var bookingEndTimeNumber = endtimehours * 60 + endtimeminutes;
	            var bookingEndHour = new Date(bookingEnd);
	            var bookingEndHourTwo = new Date(bookingEndHour);
	            bookingEndHourTwo.setMinutes(bookingEndHour.getMinutes() + 60);
	            var bookingEndTimeFinal = stringToTimeStamp(bookingEndHourTwo);
	            var bookinStartOne=new Date(req.body.bookingStartTime);
	            var bookinStartTwo=new Date(bookinStartOne);
	            bookinStartTwo.setMinutes(bookinStartOne.getMinutes() - 60);
	            var bookingStartTimeFinal= stringToTimeStamp(bookinStartTwo);
	            // req.body.bookingEndTime=bookingEndTimeFinal;
	            req.body.day = req.body.schedule.day;
			            /*
			             * generating booking confirmation id
			             * 
			             */
	                           var city='';
	                           var year ='';
	                           var roomType ='';
	                           if(room.spaceId.city.match(RegExp('^Bangalore$', "i"))){
	                        	   city='BNG';
	                           }else if(room.spaceId.city.match(RegExp('^Pune$', "i"))){
	                        	   city='PUN';
	                           }else{
	                        	   city='MUM';
	                           }
	                           
	                           if(room.roomtype.name == 'Meeting Room'){
	                        	   roomType='M';
	                           } else{
	                        	   roomType='B';
	                           }
	                           var date=new Date();
	                           year= date.getFullYear();
	                           var bookingid=city.concat(roomType);
	                           bookingid=bookingid.concat(year);
	                           req.body.bookingConfirmationId=bookingid;
	                           
			            /*
			             * end of generating booking confirmation id
			             * 
			             */
	
	             
	          var index = scheduler.findSlot(currentAvail, bookingStart, bookingEnd, schedule.isAllday);
	          if (index >= 0) {
	                var splittedSlot = scheduler.splitSlot(currentAvail[index], finalBookingStartTime, finalBookingEndTime);
	                currentAvail.splice(index, 1);
	                for (var i = splittedSlot.length - 1; i >= 0; i--) {
	                    currentAvail.splice(index, 0, splittedSlot[i])
	                }
	                var scheduleOne = req.schedule;
	                scheduleOne.currentAval = currentAvail;
	                scheduleOne.save(function(err) {
	                    if (err) {
	                        return res.status(500).json({
	                            error: 'Cannot update the schedule'
	                        });
	                    }
	                });
	                //saving guest user and booking creating user object
	                async.waterfall([
	                    function(done) {
	                        if (user == undefined) {
	                            /*UserModel.findOne({
	                                "email": req.body.guest.email
	                            }).exec(function(err, requireduserobject) {
	                                if (err) {
	                                    return res.status(500).json({
	                                        error: 'Cannot list the  users'
	                                    });
	                                } else if (requireduserobject == undefined) {
	                                    req.body.guest.isGuest = true;
	                                    var guestUser = new UserModel(req.body.guest);
	                                    guestUser.isPasswordUpdate = true;
	                                    guestUser.isUserConfirmed = true;
	                                    var token = randtoken.generate(8);
	                                    guestUser.password = token;
	                                    guestUser.save(function(err, userGuest) {
	                                        if (err) {
	                                            console.log(err);
	                                        } else {
	                                            var email = templates.confirmation_email_guest(req,userGuest,token);
	                                  			mail.mailService(email,userGuest.email);
	                                            
	                                            done(null, userGuest);
	                                        }
	                                    });
	                                } else {
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
	                        } else {
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
		                                done(null, updatedUser);
		                            });
	                        	});
	                        }
	                    },
	                    function(user, done) {
	                        //req.body.user = user;
	                        var booking = new BookingModel(req.body);
	                        booking.save(function(err, bookedItem) {
	                            if (err) {
	                                return res.status(500).json({
	                                    ERRBOOKING: 'Cannot save the Booking',
	                                    ERRCODE:1001
	                                });
	                            }
	
	                            /**
	                             * updating booking confirmation id
	                             */
	                            var s = booking.sequenceNumber.toString();
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
	                                        ERRCODE:1001
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
	                            });
	                            /**
	                             * end of updating booking confirmation id
	                             */
	                            
	                             var data;
	                             if(booking.price && booking.price == 0){
	                             	data = {
	                                	txnid : booking._id,
	                            		amount : booking.price
	                            	};
	                             } else {
	                            	 data = payumoney.getPayUMoneyPayload(booking,user);
	                             }
	                             
	                            res.json(data);
	                            done();
	                        });
	                    }
	                ], function(err) {
	                    console.log(err);
	                });
	            } else {
	                return res.status(200).json({
	                	ERRBOOKING: 'Slot already booked',
	                	ERRCODE:5001
	                });
	            }
        	});
        },
        
        /**
         * Update an Booking
         */
        update: function(req, res) {
            var booking = req.booking;
            booking = _.extend(booking, req.body);
            booking.save(function(err) {
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
        destroy: function(req, res) {
            var booking = req.booking;
            booking.remove(function(err) {
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
        show: function(req, res) {
        	
            res.json(req.booking);
        },
        /**
         * List of holiday
         */
        all: function(req, res) {
            BookingModel.find().populate('user').populate('space').populate('partner').populate('room').deepPopulate('room.roomtype').sort( { bookingDate: -1 } ).exec(function(err, bookings) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the bookings'
                    });
                }
                res.json(bookings);
            });
        },
        loadSchedule: function(req, res) {
            var roomId = req.query.roomId;
           var offsetTimeFromObject=config.zoneOffset.indiaOffset;
            var selecteddate = new Date(req.query.selectdate);
            selecteddate=new Date(selecteddate.setMinutes(selecteddate.getMinutes() - offsetTimeFromObject ));
            var str = selecteddate.toISOString().substr(0, 10);
            str = str + "T00:00:00.000Z";
            var str1 = str.replace(/00:00:00.000/, '23:59:59.000');
            ScheduleModel.findOne({
                $and: [{
                    "room": roomId
                }, {
                    "date": {
                        $gte: new Date(str)
                    }
                }, {
                    "date": {
                        $lte: new Date(str1)
                    }
                }]
            }).exec(function(err, bookingAvailabilitySchedules) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the bookingAvailabilitySchedules'
                    });
                } else {
                    res.send(bookingAvailabilitySchedules);
                }
            });
        },
        loadPartnerBookings: function(req, res) {
        	var roleReq=req.query.roleRequired;
            var user = req.query.partner;
            if(roleReq == 'BackOffice' || roleReq == 'FrontOffice'){
            	UserModel.findOne({"_id" : user}).exec(function(err, userObj) {
                    if (err) {
                        return res.status(500).json({
                            error: 'Cannot list the userObj'
                        });
                    } else {
                    	var userSpacesReq=userObj.Spaces;
                    	async.each(userSpacesReq, function(requiredSpace, callbackSpaces) {
                   		 BookingModel.find({
                                "space" : requiredSpace
                            }).populate('user').populate('space').populate('partner').populate('room').deepPopulate('room.roomtype').sort( { bookingDate: -1 } ).exec(function(err, partnerBookings) {
                                if (err) {
                                    return res.status(500).json({
                                        error: 'Cannot list the partnerBookings'
                                    });
                                }
                                res.json(partnerBookings);
                                
                            });
                 		   callbackSpaces();
                        }, function(err) {
                            //res.send(myresult);
                        });
                    }
                });
            	 
            	
            }else{
            	BookingModel.find({
                    "partner": user
                }).populate('user').populate('space').populate('partner').populate('room').deepPopulate('room.roomtype').exec(function(err, partnerBookings) {
                    if (err) {
                        return res.status(500).json({
                            error: 'Cannot list the partnerBookings'
                        });
                    }
                    else{
                    	 res.json(partnerBookings);
                    		
                    }
                    
                });
            }
            
        },
        
        loadUserBookings: function(req, res) {
            var user = req.query.user;
            BookingModel.find({
                "user": user
            }).populate('user').populate('space').populate('partner').populate('room').deepPopulate('room.roomtype').sort( { bookingDate: -1 } ).exec(function(err, userBookings) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the userBookings'
                    });
                }
                async.eachSeries(userBookings, function(userBooking, callback) {
                	var currentTime = new Date();
                	var bookingEndTime, bookingDate;
                	if(userBooking.status === 'Confirmed'){
						if((userBooking.room.roomtype.name === 'Hot Desk') || (userBooking.room.roomtype.name === 'Training Room')){
							bookingEndTime = new Date(userBooking.endDate + ' ' + userBooking.endTime);
							if(bookingEndTime < currentTime){
								userBooking.reviewBooking = true;
							} else {
								userBooking.reviewBooking = false;
							}
							callback();
						} else {
							bookingDate = new Date(userBooking.bookingDate);
							bookingEndTime = new Date(userBooking.bookingEndTime);

							var month = bookingDate.getMonth() + 1; //months from 1-12
							var day = bookingDate.getDate();
							var year = bookingDate.getFullYear();

							var bookedDate = year + "/" + month + "/" + day;
							var bookedTime = bookingEndTime.getHours() + ':' + bookingEndTime.getMinutes();
							
							var bookingEndTime = new Date(bookedDate  + " " + bookedTime);

							if(bookingEndTime < currentTime){
								userBooking.reviewBooking = true;
							} else {
								userBooking.reviewBooking = false;
							}
							callback();
						}
                	} else {
                		userBooking.reviewBooking = false;
						callback();
                	}
					
				}, function(err) {
					if(err) {
						return res.status(500).json({
							error: err
						});
					} else {
		                res.json(userBookings);
					}
				});
            });
        },
        
        loadBookedSchedules: function(req, res) {
            if (req.query.bookedRoom) {
                var bookedRoom = req.query.bookedRoom;
            } else {
                var bookedRoom = 'undefined';
            }
            BookingModel.find({
                        $and: [{
                        	room: req.query.bookedRoom
                        }, {
                            status: 'Confirmed'
                        }]
                    }).populate("room").populate("space").exec(function(err, bookedRooms) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the bookedRoom'
                    });
                }
                res.json(bookedRooms);
            });
        },
        loadRequiredRoomType: function(req, res) {
            var roomType = req.query.RoomType;
            var user = req.query.logUserPartner;
            var myresult = [];
            UserModel.findOne({
                "_id": user
            }).exec(function(err, userobject) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the  RoomTypes'
                    });
                } else {
                    var userCommission = userobject.commissionPercentage;
                    async.each(userCommission, function(commisionobject, callbackroomTypes) {
                        if (commisionobject._id == roomType) {
                            myresult.push(commisionobject);
                        }
                        callbackroomTypes();
                    }, function(err) {
                        res.send(myresult);
                    });
                }
            });
        },
        //Loading user based on email id
        loadRequiredUser: function(req, res) {
            var user = req.query.userId;
            UserModel.findOne({
                "email": user
            }).exec(function(err, requireduserobject) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the  RoomTypes'
                    });
                } else {
                    res.send(requireduserobject);
                }
            });
        },
        
      //Loading user based on email id for Modbile
        loadRequiredUserMobile: function(req, res) {
            var user = req.query.userId;
            UserModel.findOne({
                "email": user
            }).exec(function(err, requireduserobject) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the  RoomTypes'
                    });
                } else {
                	if(requireduserobject){
                		return res.status(200).json({
                        	ERRUSER: 'Email id already exists please login to continue',
                        	ERRCODE:1010
                        });
                	}else{
                		return res.status(200).json({
                        	ERRUSER: '',
                        	ERRCODE:0
                        });
                	}
                    
                }
            });
        },
        //Back Office booking
        backOfficeBookingCreate: function(req, res) {
        	console.log(req.body);
            RoomsSchemaModel.findOne({"_id": req.body.room}).populate("spaceId").populate("partner").populate("roomtype").exec(function (err, roomObj) {
                if (err) {
                      return res.status(500).json({
                      error: 'Cannot list the roomObj'
               });
          }
                UserModel.findOne({"_id": req.body.user}).exec(function (err, userObj) {
                    if (err) {
                          return res.status(500).json({
                          error: 'Cannot list the userObj'
                   });
              }
                    SpaceModel.findOne({"_id": req.body.space}).populate("partner").populate("teams").exec(function (err, spaceObj) {
                        if (err) {
                              return res.status(500).json({
                              error: 'Cannot list the userObj'
                       });
                  }
                    var user = userObj;
                    var room = roomObj;
                    var space = spaceObj;
                    var partner = spaceObj.partner;
                    
                    if(partner.commissionPercentage && (partner.commissionPercentage.length > 0)){
	                    for(var i=0 ;i<partner.commissionPercentage.length;i++){
	                    	if(partner.commissionPercentage[i]._id.toString() == room.roomtype._id.toString()){
	                    		var commission=partner.commissionPercentage[i].commission;
	                    		var finalCommissionValue=req.body.price *(commission/100);
	        		    	     var PartnerFinalPrice=req.body.price-finalCommissionValue;
	        		    	     req.body.partnerAmount=PartnerFinalPrice;
	        		    	     req.body.adminAmount=finalCommissionValue;
	                    	}
	                    	else{
	                    		console.log("No operations to perform");
	                    	}
	                    }
                    } else {
                    	return res.status(500).json({
                        	ERRBOOKING: 'Partner doesnt have Commission Percentage',
                        	ERRCODE: 1100
                        });
                    }
                    req.body.roomPrice={};
                    req.body.roomPrice.pricePerHour=room.pricePerhour;
                    req.body.roomPrice.pricePerHalfday=room.pricePerhalfday;
                    req.body.roomPrice.pricePerFullday=room.pricePerfullday;
                    req.body.capacity=room.capacity;
                    var schedule = req.body.schedule;
                    var currentAvail = schedule.currentAval;
                    var bookingStart = stringToTimeStamp(req.body.bookingStartTime);
                    var bookingEnd = stringToTimeStamp(req.body.bookingEndTime);
                    /*
                     * Adding 45Mins to booking end time and substracting 45mins from start time
                     * 
                     */
                       var bookingStartTimeSubstract=new Date(req.body.bookingStartTime);
                       var bookingStartTimeSubstractOne=new Date(bookingStartTimeSubstract);
                       var finalBookingStartTime=stringToTimeStamp(bookingStartTimeSubstractOne.setMinutes(bookingStartTimeSubstract.getMinutes()-45));
                       
                       //Adding 45Mins for end time
                       var bookingEndTimeAdd=new Date(req.body.bookingEndTime);
                       var bookingEndTimeAddOne=new Date(bookingEndTimeAdd);
                       var finalBookingEndTime=stringToTimeStamp(bookingEndTimeAddOne.setMinutes(bookingEndTimeAdd.getMinutes()+45));
                       
                      /*
                       * End of Adding 45Mins to booking end time and substracting 45mins from start time
                       * 
                       */ 
                    var bookingEndHour = new Date(bookingEnd);
                    var bookingEndHourTwo = new Date(bookingEndHour);
                    bookingEndHourTwo.setMinutes(bookingEndHour.getMinutes() + 60);
                    var bookingEndTimeFinal = stringToTimeStamp(bookingEndHourTwo);
                  //  req.body.bookingEndTime = bookingEndTimeFinal;
                    req.body.bookingStartTimeNumber = bookingStart;
                    req.body.bookingEndTimeNumber = bookingEnd;
                    req.body.day = req.body.schedule.day;
                    var roomTypeRequired = room.roomtype.name;
                    
                    /*
		             * generating booking confirmation id
		             * 
		             */
                           var city='';
                           var year ='';
                           var roomType ='';
                           if(space.city.match(RegExp('^Bangalore$', "i"))){
                        	   city='BNG';
                           }else if(space.city.match(RegExp('^Pune$', "i"))){
                        	   city='PUN';
                           }else{
                        	   city='MUM';
                           }
                           
                           if(room.roomtype.name == 'Meeting Room'){
                        	   roomType='M';
                           } else{
                        	   roomType='B';
                           }
                           var date=new Date();
                           year= date.getFullYear();
                           var bookingid=city.concat(roomType);
                           bookingid=bookingid.concat(year);
                           req.body.bookingConfirmationId=bookingid;
                           
		            /*
		             * end of generating booking confirmation id
		             * 
		             */

                    var index = scheduler.findSlot(currentAvail, bookingStart, bookingEnd, schedule.isAllday);
                    if (index >= 0) {
                    	console.log("after indexxxx");
                        var splittedSlot = scheduler.splitSlot(currentAvail[index], finalBookingStartTime, finalBookingEndTime);
                        currentAvail.splice(index, 1);
                        for (var i = splittedSlot.length - 1; i >= 0; i--) {
                            currentAvail.splice(index, 0, splittedSlot[i])
                        }
                        var scheduleOne = req.schedule;
                        scheduleOne.currentAval = currentAvail;
                        scheduleOne.save(function(err) {
                            if (err) {
                                return res.status(500).json({
                                    error: 'Cannot update the schedule'
                                });
                            }
                        });
                        var indexOne = scheduler.findBlockedSlot(currentAvail, finalBookingStartTime, finalBookingEndTime);
                        currentAvail.splice(indexOne, 1);
                        scheduleOne.currentAval = currentAvail;
                        scheduleOne.save(function(err) {
                            if (err) {
                                return res.status(500).json({
                                    error: 'Cannot update the schedule'
                                });
                            }
                        });
                        //saving guest user and booking creating user object
                        async.waterfall([
                            function(done) {
                                if (user == undefined) {
                                    /*req.body.guest.isGuest = true;
                                    var guestUser = new UserModel(req.body.guest);
                                    guestUser.save(function(err, userGuest) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            done(null, userGuest);
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
                                } else {
                                	req.body.user = user;
                                    done(null, user);
                                }
                            },
                            function(user, done) {
                            	req.body.isWalkin=true;
                                var booking = new BookingModel(req.body);
                                booking.save(function(err, booking) {
                                    if (err) {
                                        return res.status(500).json({
                                            error: 'Cannot save the Booking'
                                        });
                                    }
                                    /**
                                     * updating booking confirmation id
                                     */
                                    var s=booking.sequenceNumber.toString();
                                    s = s.replace(/\d+/g, function(m){
                                    	  return "0000".substr(m.length - 1) + m;
                                    	});
                                    booking.bookingConfirmationId=booking.bookingConfirmationId.concat(s);
                                    booking.save(function(err,bookingid){
                                    	if (err) {
                                            return res.status(500).json({
                                                ERRBOOKING: 'Cannot save the Booking',
                                                ERRCODE:1001
                                            });
                                        }	
                                    });
                                    
                                    /**
                                     * end of updating booking confirmation id
                                     */
                                    BookingModel.findOne({_id: booking._id}).populate('room').populate('space').exec(function (err, booking) {
  			                          if(err) {
  			                        	  return res.json(err);
  			                          }
  			                          res.json(booking);
  			                      });
                                    //res.json(booking);
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
                                    var guestUser=booking.guestUser;
                                    if(!booking.user){
                                    	GuestModel.findOne({_id: guestUser}).exec(function (err, guestUser) {
        			                          if(err) {
        			                        	  return res.json(err);
        			                          }
                                    	var email = templates.booking_email_guest(guestUser, room,space,booking,bookingsstartTime,bookingsendTime,roomTypeRequired);
                             			mail.mailService(email,guestUser.email);
                             			sms.send(guestUser.phone, 'Thank you for using mymatchbox! Your booking id (' + booking.bookingConfirmationId + ') is confirmed. An email has been forwarded to your registered email id.', function(status) {
                                            logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New booking SMS sent [' + guestUser.phone + ']: ' + status);
                             			});
                                            var emailpartner = templates.booking_email_guest(partner, room,space,booking,bookingsstartTime,bookingsendTime,roomTypeRequired)
                                 			mail.mailService(emailpartner,partner.email)   
                                    	});		
                                    }else{
                                    	var email = templates.booking_email(user, room,space,booking,bookingsstartTime,bookingsendTime,roomTypeRequired);
                             			mail.mailService(email,user.email);
                                        sms.send(user.phone, 'Thank you for using mymatchbox! Your booking id (' + booking.bookingConfirmationId + ') is confirmed. An email has been forwarded to your registered email id.', function(status) {
                                            logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New booking SMS sent [' + user.phone + ']: ' + status);
                                        });	
                                        var emailpartner = templates.booking_email(partner, room,space,booking,bookingsstartTime,bookingsendTime,roomTypeRequired)
                             			mail.mailService(emailpartner,partner.email)
                                    }
                                    
                         			 /*
                 			          *  Sending Booking mail to Back office and Front Office 
                 			         */
				                      async.eachSeries(space.teams, function(teamObj, callback1) {
					                      UserModel.findOne({_id: teamObj._id}).exec(function (err, teamUser) {
					                          if(err) {
					                        	  return res.json(err);	
					                          }
					                          else{
					                        	  if(!booking.user){
					                        		  var emailTeam = templates.booking_email_guest(teamUser, room,space,booking,bookingsstartTime,bookingsendTime,roomType)
							                   			mail.mailService(emailTeam,teamUser.email)
							                   			 sms.send(teamUser.phone, 'A new  booking(' + booking.bookingConfirmationId + ') has been done in your Space. Kindly login to the site to check for details.', function(status) {
		                                                 logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New booking SMS sent [' + teamUser.phone + ']: ' + status);
		                                                   });
					                        	  }else{
					                        		  var emailTeam = templates.booking_email(teamUser, room,space,booking,bookingsstartTime,bookingsendTime,roomType)
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
    	               			            			var emailadmin = templates.booking_email_guest(userAdminRole, room,space,booking,bookingsstartTime,bookingsendTime,roomTypeRequired)
        	               	                 			mail.mailService(emailadmin,userAdminRole.email)
    	               			            		 }else{
    	               			            			var emailadmin = templates.booking_email(userAdminRole, room,space,booking,bookingsstartTime,bookingsendTime,roomTypeRequired)
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
                                    done();
                                });
                            }
                        ], function(err) {});
                    } else {
                        return res.status(500).json({
                            error: 'Slot already booked'
                        });
                    }
                
                });
            });
            });
           
        },
        //load closed schedules
        loadClosedSchedule: function(req, res) {
            ScheduleModel.find({
                isClosed: 'True'
            }).exec(function(err, schedules) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the schedules'
                    });
                }
                res.json(schedules);
            });
        },
        /**
         * Check if any bookings are happening in the past, if so, create a notification to the user to submit review.
         */
        notifyUserReviews: function(req, res) {
            BookingModel.find({
                $and: [{
                    user: req.user._id
                }, {
                    bookingDate: {
                        $lt: Date.now()
                    }
                }, {
                    status: 'Confirmed'
                }, {
                	requestReview: false
                }]
            }).populate("room").populate("space").exec(function(err, bookedRooms) {
                if (err) {
                    console.log('Cannot list the bookedRoom');
                }
                 //console.log(bookedRooms);
                // res.json(bookedRooms);
                async.each(bookedRooms, function(bookedRoom, callback) {
                    if (!bookedRoom.reviewed) {
                        var notify = new NotificationModel({
                            user: req.user._id,
                            title: 'Submit a review for ' + bookedRoom.room.name,
                            description: 'Thank you for using mymatchbox! Please take a moment to review your experience at "' + bookedRoom.room.name + '" (Booking Date: ' + bookedRoom.bookingDate.toISOString().substr(0, 10) + ').',
                            url: '/booking/review/' + bookedRoom._id
                        });
                        notify.save(function(err) {
                            if (err) {
                                console.log('Unable to create notification for booking: ' + bookedRoom._id);
                            }
                            bookedRoom.requestReview = true;
                            bookedRoom.save(function(err) {
                                if (err) {
                                    console.log('Unable to update the booking : ' + bookedRoom);
                                }
                            });
                            callback();
                        });
                    } else {
                        callback();
                    }
                }, function(err) {
                    console.log("done");
                });
            });
            //Send OK response. The notifications will be generated asynchronously.
            res.json({
                status: "Notification processing started!"
            });
        },
        /**
         * Cancelation of Payment
         */
        cancelBooking: function(req, res) {
 
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
                    //notify.addNotificationForBooking('Room is Booked', 'Booking done with Id : '+ booking._id, booking , '/admin/bookings');
                    ScheduleModel.load(booking.schedule, function(err, schedule) {
                        var newtimeobj = {};
                         /*
             * Adding 45Mins to booking end time and substracting 45mins from start time
             * 
             */
               var bookingStartTimeSubstract=new Date(booking.bookingStartTime);
               var bookingStartTimeSubstractOne=new Date(bookingStartTimeSubstract);
               var finalBookingStartTime=stringToTimeStamp(bookingStartTimeSubstractOne.setMinutes(bookingStartTimeSubstract.getMinutes()-45));
               //Adding 45Mins for end time
               var bookingEndTimeAdd=new Date(booking.bookingEndTime);
               var bookingEndTimeAddOne=new Date(bookingEndTimeAdd);
               var finalBookingEndTime=stringToTimeStamp(bookingEndTimeAddOne.setMinutes(bookingEndTimeAdd.getMinutes()+45));
               
              /*
               * End of Adding 45Mins to booking end time and substracting 45mins from start time
               * 
               */ 
            
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
                            var index = scheduler.findBlockedSlot(currentAvail, booking.bookingStartTime, newtimeobj.endTime);
                            currentAvail[index].isBlocked = false;
                            currentAvail = scheduler.mergeAllSlot(currentAvail);
                            schedule.currentAval = currentAvail;
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
                                                   notify.addNotificationURL('Cancelled',booking.bookingConfirmationId +'     '+ ' has been cancelled.Click here for more details', user,'/admin/bookings');
                                                  callback();
                                                });
                                            });
                                }
                              });

                              
                           notify.addNotificationURL('Cancelled',booking.bookingConfirmationId +'		'+ ' has been cancelled.Click here for more details', booking.user,'/bookings/mybookings');
                           notify.addNotificationURL('Cancelled',booking.bookingConfirmationId +'		'+ 'has been cancelled.Click here for more details', booking.partner,'/admin/bookings');
                           schedule.save(function(err) {
                                if (err) {
                                    return res.status(500).json({
                                    	status: 'Failed',
                                        error: 'Cannot update the schedule'
                                    });
                                }

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
	                            var guestUser=booking.guestUser;
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
	                            }else{
                                    var email = templates.booking_cancellation(booking.user, req,booking,bookingsstartTime,bookingsendTime, bookingMonth, bookingDate , bookingYear);
                                    mail.mailService(email,booking.user.email);
	                            	var partnerEmail = templates.booking_cancellation_partner_mail(booking.user, req,booking,bookingsstartTime,bookingsendTime, bookingMonth, bookingDate , bookingYear);
		                 			mail.mailService(partnerEmail,booking.partner.email);
                                    if(booking.bookingConfirmationId.length > 13){
                                        sms.send(booking.user.phone, 'Your booking has been cancelled. An email has been forwarded to your registered email id.', function(status) {
                                            logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New booking SMS sent [' + guestUser.phone + ']: ' + status);
                                        });
                                    }
                                    else {
    		                 			sms.send(booking.user.phone, 'Your booking id (' + booking.bookingConfirmationId + ') has been cancelled. An email has been forwarded to your registered email id.', function(status) {
    	                                    logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New booking SMS sent [' + booking.user.phone + ']: ' + status);
    	                                });
                                    }		                 			
		                 			 var emailConfig = config.email_config('cancelledBooking');
		                 			 if(emailConfig.length > 0 ){
		                 			     var confirmedBooking = emailConfig;
		                 			     var emails;
		                 			     for(var i = 0; i < confirmedBooking.length; i++){
		                 			    	if(confirmedBooking[i].city === 'All'){
			                 			    	emails = confirmedBooking[i].emails;
			                 			    /*} else if(confirmedBooking[i].city === 'Bangalore'){
			                 			    	emails = confirmedBooking[i].emails;
			                 			    } else if(confirmedBooking[i].city === 'Mumbai' || confirmedBooking[i].city === 'Pune'){
				                 			    emails = confirmedBooking[i].emails;*/
			                 			    } else {
			                 			    	console.log('No such Object.');
			                 			    }
		                 			     }
		                 			     async.eachSeries(emails, function(email, callback1) {
 		                 			    	var user_name = email.name;
		        							var user_email = email.email_addr;
		                                    if (!booking.user) {
		                                        var emailadmin = templates.booking_cancellation_admin({first_name: 'Admin'}, req,booking,bookingsstartTime,bookingsendTime, bookingMonth, bookingDate , bookingYear);
		                                        //mailbooking.mailService(emailadmin, 'bookings@mymatchbox.in')
		                                        mail.mailService(emailadmin, user_email);
		                                    } else {
		                                        var emailadmin = templates.booking_cancellation_admin({first_name: 'Admin'}, req,booking,bookingsstartTime,bookingsendTime, bookingMonth, bookingDate , bookingYear);
		                                        //mailbooking.mailService(emailadmin, 'bookings@mymatchbox.in')
		                                        mail.mailService(emailadmin, user_email);
		                                    }
		                                    callback1();
		                 			    }, function(err) {
		                					if(err) {
		                						return res.status(500).json({
		                							error: 'Error while booking. ' + err
		                						});
		                					} 
		                				});
		                 			 } else {
		                 				 console.log('Email Config didnot loaded');
		                 			 }
	                            }
	                            res.status(200).json({
	                            	status: 'Success'
	                            });
                            });
                        });
                    });
                });
            });
        },
        
        /*
         * Loading booked schedule
         * 
         */
         bookedSchedule:function(req,res){
        	var requiredId=req.query.bookingId;
        	BookingModel.findOne({"_id":requiredId}).populate('user').populate('guestUser').populate('space').populate('partner').populate('room').exec(function(err, bookings) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the bookings'
                    });
                }
                res.json(bookings);
            });
         },
         
         /*
          * API for sending email for the users whoses booking are in pending state
          * Refs #25956 unsuccessful transactions
          */
         bookingFailure:function(req,res){
        	 //fetching all the pending bookings
        	BookingModel.find({"status":'Pending'}).populate('guest').populate('user').populate('space').populate('partner').populate('room').deepPopulate('room.roomtype').exec(function(err, bookingfailures) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the bookingfailures'
                    });
                }
                else{
                	//async for considering each booking and sending mail to pending booking users
                	async.eachSeries(bookingfailures, function(bookingfailure, callbackbooking) {
                		console.log("++++++++++++");
                		console.log(bookingfailure._id);
                		console.log(bookingfailure.bookingStartTime);
                		console.log(bookingfailure.bookingEndTime);
                		console.log("++++++++++++");
                		var starttime = bookingfailure.bookingStartTime;
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

                        var endtime = bookingfailure.bookingEndTime;
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
                        var roomTypeRequired = bookingfailure.room.roomtype.name;
                        //calculating the difference between booking initiated time and current time
                        var retryBooking =true;
                        var date= new Date();
                		var diff = Math.abs(new Date(bookingfailure.createdAt) - new Date(date));
                		console.log(diff);
                		var minutes = Math.floor((diff/1000)/60);
                		console.log(minutes);
                		var timeout=false;
                		/*
                		 * if difference between booking initiated time and current time is greater than or equal to 15,
                		 * change status to TimedOut and merge the slot and update booking and schedule
                		 * 
                		 */
                		console.log(config.retryPaymentTimeout);
                		console.log(minutes >= config.retryPaymentTimeout);
                		if(minutes >= config.retryPaymentTimeout){
                			timeout=true;
                			console.log("in ifffffffff");
                			console.log(timeout);
                			console.log(roomTypeRequired);
                			if(roomTypeRequired == 'Training Room' || roomTypeRequired == 'Hot Desk'){
                		         BookingModel.load(bookingfailure._id, function(err, booking) {
                		                if (err) return next(err);
                		                booking.status = 'TimedOut';
                		                booking.save(function(err, bookedItem) {
                		                    if (err) {
                		                        return res.status(500).json({
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
                			                    
                		                    	async.eachSeries(uniqueScheduleList, function(scheduleObj, callback1) {
                			                    	ScheduleModel.load(scheduleObj, function(err, schedule) {
                				                        var newtimeobj = {};
                				                        var currentAvail = schedule.currentAval;
                				                        
                			    				    	//var scheduleObjDate = new Date(scheduleObj.date);
                			    				    	var scheduleObjDate = new Date(currentAvail[0].startTime);
                			    				    	scheduleObjDate = scheduleObjDate.setMinutes(scheduleObjDate.getMinutes() - booking.timeZoneOffset);
                			    				    	scheduleObjDate = new Date(scheduleObjDate);
                			    				    	
                			    				    	console.log(scheduleObjDate);
                			    				    	
                			    				    	// Using 'scheduler' 'customizeTimeForDate'
                			    				    	var offsetStartTime = new Date(scheduler.customizeTimeForDate(scheduleObjDate, booking.startTime));
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
                				                                    error: 'Cannot update the feature'
                				                                });
                				                            }
                				                            var currentAvail = schedule.currentAval;
                				                            var index = scheduler.findBlockedSlot(currentAvail, booking.bookingStartTime, newtimeobj.endTime);
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
                					                            
                				                                var email = templates.booking_cancellation(booking.user, req,booking,bookingsstartTime,bookingsendTime);
                					                 			mail.mailService(email,booking.user.email);
                					                 			var user = booking.user;
                                                                if(booking.bookingConfirmationId.length > 13){
                                                                    sms.send(user.phone, 'Your booking has been cancelled. An email has been forwarded to your registered email id.', function(status) {
                                                                        logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New booking SMS sent [' + guestUser.phone + ']: ' + status);
                                                                    });
                                                                }
                                                                else {
                    					                 			sms.send(user.phone, 'Your booking id (' + booking.bookingConfirmationId + ') has been cancelled. An email has been forwarded to your registered email id.', function(status) {
                    				                                    logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New booking SMS sent [' + user.phone + ']: ' + status);
                    				                                });
                					                 			}
                				                            });
                				                        });
                				                    });
                		                    	}, function(err) {
                		        					if(err) {
                		        						return res.status(500).json({
                		        							error: 'Error for outer loop. ' + err
                		        						});
                		        					} 
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
                			}else{
                				 BookingModel.load(bookingfailure._id, function(err, booking) {
                	                 if (err) return next(err);
                	                 booking.status = 'TimedOut';
                	                 booking.save(function(err, bookedItem) {
                	                     if (err) {
                	                         return res.status(500).json({
                	                             error: 'Cannot save the Booking'
                	                         });
                	                     }
                	                     ScheduleModel.load(booking.schedule, function(err, schedule) {
                	                         var newtimeobj = {};
                	                          /*
                	              * Adding 45Mins to booking end time and substracting 45mins from start time
                	              * 
                	              */
                	                var bookingStartTimeSubstract=new Date(booking.bookingStartTime);
                	                var bookingStartTimeSubstractOne=new Date(bookingStartTimeSubstract);
                	                var finalBookingStartTime=stringToTimeStamp(bookingStartTimeSubstractOne.setMinutes(bookingStartTimeSubstract.getMinutes()-45));
                	                //Adding 45Mins for end time
                	                var bookingEndTimeAdd=new Date(booking.bookingEndTime);
                	                var bookingEndTimeAddOne=new Date(bookingEndTimeAdd);
                	                var finalBookingEndTime=stringToTimeStamp(bookingEndTimeAddOne.setMinutes(bookingEndTimeAdd.getMinutes()+45));
                	                
                	               /*
                	                * End of Adding 45Mins to booking end time and substracting 45mins from start time
                	                * 
                	                */ 
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
                	                                     error: 'Cannot update the feature'
                	                                 });
                	                             }
                	                             var currentAvail = schedule.currentAval;
                	                             var index = scheduler.findBlockedSlot(currentAvail, booking.bookingStartTime, newtimeobj.endTime);
                	                             currentAvail[index].isBlocked = false;
                	                             currentAvail = scheduler.mergeAllSlot(currentAvail);
                	                             schedule.currentAval = currentAvail;
                	                            schedule.save(function(err) {
                	                                 if (err) {
                	                                     return res.status(500).json({
                	                                         error: 'Cannot update the schedule'
                	                                     });
                	                                 }
                	                                 console.log("after schedule update................");
                	                                 var guestUser=booking.guestUser;
                	                                 if(!booking.user){
                	                                 	var emailGuest = templates.booking_cancellation_guest(guestUser, req,booking,bookingsstartTime,bookingsendTime);
                	     	                 			mail.mailService(emailGuest,guestUser.email);
                	                                 }else{
                	                                 	var email = templates.booking_cancellation(booking.user, req,booking,bookingsstartTime,bookingsendTime);
                	     	                 			mail.mailService(email,booking.user.email);
                	                                 }
                	                                 console.log("after mailllllllll");
                	                             });
                	                         });
                	                     });
                	                 });
                	             });
                			}
                		      
                		}
                		/*
                		 * if time is less than 15mins  check for isMerged(default value is false,it is set true once email is sent
                		 * to the user which avoids sending email to the same user all the time)and send email
                		 */
                		else{
                			timeout=false;
                			console.log("in ifffffffff elseeeeeeeee");
                			console.log(timeout);
                			var url='';
                			// '?search_lon=' + $scope.searchElements.lon +'&search_lat=' + $scope.searchElements.lat + '&capacitymin='+$scope.searchElements.capacity.min+ '&capacitymax='+$scope.searchElements.capacity.max+ '&start_time='+$scope.searchElements.stime+ '&end_time='+$scope.searchElements.etime +'&roomType='+$scope.searchElements.roomType+'&place='+$scope.searchElements.place+'&from_date='+$scope.searchElements.fromDate+'&end_date='+$scope.searchElements.endDate+
                			// '&timeType='+$rootScope.dateObj.timeType+'&dateselc='+$rootScope.dateObj.date+'&pageNo='+$scope.pageNo
                			if(!bookingfailure.isMerged){
                				if(roomTypeRequired == 'Training Room'){
                					url='/training/room/'+bookingfailure.room._id +'/bookings'+'?search_lon=' + bookingfailure.space.loc[0] +'&search_lat=' + bookingfailure.space.loc[1] + '&capacitymin='+bookingfailure.capacity+ '&capacitymax='+bookingfailure.room.capacity+ '&start_time='+bookingfailure.startTime+ '&end_time='+bookingfailure.endTime +'&roomType='+bookingfailure.room.roomtype.name+'&place='+'&from_date='+bookingfailure.fromDate+'&end_date='+bookingfailure.endDate+'&timeType='+'&dateselc='+'&pageNo='+'&retry='+retryBooking+'&booking='+bookingfailure._id+'&timeout='+timeout;
                				}else if(roomTypeRequired == 'Hot Desk'){
                					url='/hot-desk/room/'+bookingfailure.room._id +'/bookings'+'?search_lon=' + bookingfailure.space.loc[0] +'&search_lat=' + bookingfailure.space.loc[1] + '&capacitymin='+bookingfailure.capacity+ '&capacitymax='+bookingfailure.room.capacity+ '&start_time='+bookingfailure.startTime+ '&end_time='+bookingfailure.endTime +'&roomType='+bookingfailure.room.roomtype.name+'&place='+'&from_date='+bookingfailure.fromDate+'&end_date='+bookingfailure.endDate+'&timeType='+'&dateselc='+'&pageNo='+'&retry='+retryBooking+'&booking='+bookingfailure._id+'&timeout='+timeout;
                				}else{
                					console.log("in urllllllll");
                					url='/room/'+bookingfailure.room._id +'/bookings'+'?search_lon=' + bookingfailure.space.loc[0] +'&search_lat=' + bookingfailure.space.loc[1] + '&capacitymin='+bookingfailure.capacity+ '&capacitymax='+bookingfailure.room.capacity+ '&start_time='+bookingfailure.bookingStartTime+ '&end_time='+bookingfailure.bookingEndTime +'&roomType='+bookingfailure.room.roomtype.name+'&place='+'&from_date='+'&end_date='+'&timeType='+'&dateselc='+bookingfailure.bookingDate+'&pageNo='+'&retry='+retryBooking+'&booking='+bookingfailure._id+'&timeout='+timeout;
                					console.log(url);
                				}
                				if(!bookingfailure.user){
                        			GuestModel.findOne({_id: bookingfailure.guestUser}).exec(function (err, guestUser) {
        		                          if(err) {
        		                        	  return res.json(err);
        		                          }
                        			var email = templates.booking_unsuccessful_guest(guestUser, bookingfailure.room,bookingfailure.space,bookingfailure,bookingsstartTime,bookingsendTime,roomTypeRequired,retryBooking,timeout,url);
                         			mail.mailService(email,guestUser.email);
                        			});
                        		}else{
                        			var email = templates.booking_unsuccessful(bookingfailure.user, bookingfailure.room,bookingfailure.space,bookingfailure,bookingsstartTime,bookingsendTime,roomTypeRequired,retryBooking,timeout,url);
                         			mail.mailService(email,bookingfailure.user.email);
                        		}
                			}else{
                				console.log("no operations");
                			}
                			//updating booking after sending the email
                			bookingfailure.isMerged=true;
                			bookingfailure.save(function(err,bookingfailure){
                            	if (err) {
                                    return res.status(500).json({
                                        ERRBOOKING: 'Cannot save the Booking',
                                        ERRCODE:1001
                                    });
                                }	
                            });
                			
                		}
                        callbackbooking();
                    }, function(err) {
                    });
                	res.send(200);
                }
            });
         },

        loadReasonForCancelBooking:function(req,res){

            cancelBookingReasonModel.find({},function(err,docs){
                if(err){
                  res.status(500).json({"error":"Failed to fetch reason"});
                }
                else
                {
                    res.send(docs);
                }
            });

         },

        addCancelBookingReasons:function(req,res){

           var cancelreason = new cancelBookingReasonModel(req.body);
               cancelreason.save(function(err,doc){
                if(err){
                     res.status(500).json({"error":"Failed to create a cancel reason"});
                }
                else{
                   res.send(doc);
                }
               });

         },

        addAdminCancelBookingReason:function(req,res){

           var cancelreason = new partnerCancelBookingReasonModel(req.body);
               cancelreason.save(function(err,doc){
                if(err){
                     res.status(500).json({"error":"Failed to create a cancel reason"});
                }
                else{
                   res.send(doc);
                }
               });

         },
        loadAdminReasonForCancelBooking:function(req,res){

            partnerCancelBookingReasonModel.find({},function(err,docs){
                if(err){
                  res.status(500).json({"error":"Failed to fetch reason"});
                }
                else
                {
                    res.send(docs);
                }
            });

         },

        /*dashboardBookings: function(req, res) {
            var queryValid = true;
            if (req.user) {
                var userRole = req.user.role[0].name;
                var bookingQuery = {};
                // Bookings table for Admin
                if (userRole == 'Admin') {
                    bookingQuery = {};
                } else {
                    //Bookings table for BackOffice and FrontOffice
                    if (userRole == 'BackOffice' || userRole == 'FrontOffice') {
                        //Hard coded because each backoffice/frontoffice user will be associated with one Space only.
                        bookingQuery = {
                            'space': req.user.Spaces[0]
                        };
                    } else {
                        if (userRole == 'Partner') {
                            //Bookings for partner
                            bookingQuery = {
                                'partner': req.user
                            };
                        } else {
                            //Do not allow access for normal users
                            queryValid = false;
                        }
                    }
                }
            } else {
                //Do not allow access to unauthorized users
                queryValid = false;
            }
            if (queryValid) {
                BookingModel.find(bookingQuery).populate({
                    path: 'user',
                    select: 'first_name -_id'
                }).populate({
                    path: 'space',
                    select: 'name city -_id'
                }).populate({
                    path: 'partner',
                    select: 'first_name -_id'
                }).populate({
                    path: 'room',
                    select: 'name roomtype -_id'
                }).populate({
                    path: 'guestUser',
                    select: 'first_name _id'
                }).deepPopulate('room.roomtype', {
                    populate: {
                        'room.roomtype': {
                            select: 'name _id'
                        }
                    }
                }).sort({
                    bookingDate: -1
                }).exec(function(err, bookings) {
                    if (err) {
                        return res.status(500).json({
                            error: 'Cannot list the bookings'
                        });
                    }
                    res.json(bookings);
                });
            } else {
                res.status(403).send('Unauthorized');
            }
        },*/
         
         dashboardBookings: function(req, res) {
             var queryValid = true;
             if (req.user) {
                 var userRole = req.user.role[0].name;
                 var bookingQuery = {};
                 bookingQuery = {
                	$and : [ { 
                		status: { 
                			$in: [ 'Confirmed', 'Cancelled' ] 
                		} 
        			}, {
        				$where: "this.bookingConfirmationId.length = 13"
                	} ]
                 }
                 // Bookings table for Admin
                 if (userRole == 'Admin') {
                     //bookingQuery = {};
                 } else {
                     //Bookings table for BackOffice and FrontOffice
                     if (userRole == 'BackOffice' || userRole == 'FrontOffice') {
                         //Hard coded because each backoffice/frontoffice user will be associated with one Space only.
                         bookingQuery.space = req.user.Spaces[0];
                     } else {
                         if (userRole == 'Partner') {
                             //Bookings for partner
                             bookingQuery.partner = req.user;
                         } else {
                             //Do not allow access for normal users
                             queryValid = false;
                         }
                     }
                 }
             } else {
                 //Do not allow access to unauthorized users
                 queryValid = false;
             }
             if (queryValid) {
                 BookingModel.find(bookingQuery).populate({
                     path: 'user',
                     select: 'first_name -_id'
                 }).populate({
                     path: 'space',
                     select: 'name city -_id'
                 }).populate({
                     path: 'partner',
                     select: 'first_name -_id'
                 }).populate({
                     path: 'room',
                     select: 'name roomtype -_id'
                 }).populate({
                     path: 'guestUser',
                     select: 'first_name _id'
                 }).deepPopulate('room.roomtype', {
                     populate: {
                         'room.roomtype': {
                             select: 'name _id'
                         }
                     }
                 }).sort({
                     bookingDate: -1
                 }).exec(function(err, bookings) {
                     if (err) {
                         return res.status(500).json({
                             error: 'Cannot list the bookings'
                         });
                     }
                     res.json(bookings);
                 });
             } else {
                 res.status(403).send('Unauthorized');
             }
         },
         
         /*
          * Retry payment
          */
         retryPayment:function(req,res){
        	 var bookingId= req.query.bookingId;
        	 BookingModel.findOne({_id:bookingId}).populate('guest').populate('user').populate('space').populate('partner').populate('room').deepPopulate('room.roomtype').exec(function(err, booking) {
                 if (err) {
                     return res.status(500).json({
                         error: 'Cannot list the bookingfailures'
                     });
                 }
        	 
        	 else{
        		 var data = payumoney.getPayUMoneyPayload(booking,booking.user);
                 res.json(data);	 
        	 }
        	 });
         },
         
         /**
          * Cancelation of Booking at the time of retry payment
          */
         cancelBookingRetry: function(req, res) {
        	 BookingModel.findOne({_id:req.body.bookedId}).populate('guest').populate('user').populate('space').populate('partner').populate('room').deepPopulate('room.roomtype').exec(function(err, booking) {
                 if (err) {
                     return res.status(500).json({
                         error: 'Cannot list the bookingfailures'
                     });
                 }
                 var roomTypeRequired= booking.room.roomtype.name;
     		if(roomTypeRequired == 'Training Room' || roomTypeRequired == 'Hot Desk'){
		         BookingModel.load(req.body.bookedId, function(err, booking) {
		                if (err) return next(err);
		                booking.status = 'TimedOut';
		                booking.save(function(err, bookedItem) {
		                    if (err) {
		                        return res.status(500).json({
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
			                    
		                    	async.eachSeries(uniqueScheduleList, function(scheduleObj, callback1) {
			                    	ScheduleModel.load(scheduleObj, function(err, schedule) {
				                        var newtimeobj = {};
				                        var currentAvail = schedule.currentAval;
				                        
			    				    	//var scheduleObjDate = new Date(scheduleObj.date);
			    				    	var scheduleObjDate = new Date(currentAvail[0].startTime);
			    				    	scheduleObjDate = scheduleObjDate.setMinutes(scheduleObjDate.getMinutes() - booking.timeZoneOffset);
			    				    	scheduleObjDate = new Date(scheduleObjDate);
			    				    	
			    				    	console.log(scheduleObjDate);
			    				    	
			    				    	// Using 'scheduler' 'customizeTimeForDate'
			    				    	var offsetStartTime = new Date(scheduler.customizeTimeForDate(scheduleObjDate, booking.startTime));
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
				                                    error: 'Cannot update the feature'
				                                });
				                            }
				                            var currentAvail = schedule.currentAval;
				                            var index = scheduler.findBlockedSlot(currentAvail, booking.bookingStartTime, newtimeobj.endTime);
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
				                           schedule.save(function(err) {
				                                if (err) {
				                                    return res.status(500).json({
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
					                            
				                                var email = templates.booking_cancellation(booking.user, req,booking,bookingsstartTime,bookingsendTime);
					                 			mail.mailService(email,booking.user.email);
					                 			var user = booking.user;
                                                if(booking.bookingConfirmationId.length > 13){
                                                    sms.send(user.phone, 'Your booking has been cancelled. An email has been forwarded to your registered email id.', function(status) {
                                                        logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New booking SMS sent [' + guestUser.phone + ']: ' + status);
                                                    });
                                                }
                                                else {
    					                 			sms.send(user.phone, 'Your booking id (' + booking.bookingConfirmationId + ') has been cancelled. An email has been forwarded to your registered email id.', function(status) {
    				                                    logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New booking SMS sent [' + user.phone + ']: ' + status);
    				                                });
                                                }
					                 			
				                            });
				                        });
				                    });
		                    	}, function(err) {
		        					if(err) {
		        						return res.status(500).json({
		        							error: 'Error for outer loop. ' + err
		        						});
		        					} 
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
			}else{
				 BookingModel.load(req.body.bookedId, function(err, booking) {
	                 if (err) return next(err);
	                 booking.status = 'TimedOut';
	                 booking.save(function(err, bookedItem) {
	                     if (err) {
	                         return res.status(500).json({
	                             error: 'Cannot save the Booking'
	                         });
	                     }
	                     ScheduleModel.load(booking.schedule, function(err, schedule) {
	                         var newtimeobj = {};
	                          /*
	              * Adding 45Mins to booking end time and substracting 45mins from start time
	              * 
	              */
	                var bookingStartTimeSubstract=new Date(booking.bookingStartTime);
	                var bookingStartTimeSubstractOne=new Date(bookingStartTimeSubstract);
	                var finalBookingStartTime=stringToTimeStamp(bookingStartTimeSubstractOne.setMinutes(bookingStartTimeSubstract.getMinutes()-45));
	                //Adding 45Mins for end time
	                var bookingEndTimeAdd=new Date(booking.bookingEndTime);
	                var bookingEndTimeAddOne=new Date(bookingEndTimeAdd);
	                var finalBookingEndTime=stringToTimeStamp(bookingEndTimeAddOne.setMinutes(bookingEndTimeAdd.getMinutes()+45));
	                
	               /*
	                * End of Adding 45Mins to booking end time and substracting 45mins from start time
	                * 
	                */ 
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
	                                     error: 'Cannot update the feature'
	                                 });
	                             }
	                             var currentAvail = schedule.currentAval;
	                             var index = scheduler.findBlockedSlot(currentAvail, booking.bookingStartTime, newtimeobj.endTime);
	                             currentAvail[index].isBlocked = false;
	                             currentAvail = scheduler.mergeAllSlot(currentAvail);
	                             schedule.currentAval = currentAvail;
	                            schedule.save(function(err) {
	                                 if (err) {
	                                     return res.status(500).json({
	                                         error: 'Cannot update the schedule'
	                                     });
	                                 }
	                                 console.log("after schedule update................");
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
	                                 var guestUser=booking.guestUser;
	                                 if(!booking.user){
	                                 	var emailGuest = templates.booking_cancellation_guest(guestUser, req,booking,bookingsstartTime,bookingsendTime);
	     	                 			mail.mailService(emailGuest,guestUser.email);
	                                 }else{
	                                 	var email = templates.booking_cancellation(booking.user, req,booking,bookingsstartTime,bookingsendTime);
	     	                 			mail.mailService(email,booking.user.email);
	                                 }
	                                 console.log("after mailllllllll");
	                             });
	                         });
	                     });
	                 });
	             });
			}
     		res.send(200);
        	 });
         },
         
          bookingFailureCron:function(){
             //fetching all the pending bookings
              console.log('-----------------------BOOKING FAILURE CRON :: Function started-----------------------');
              // config.retryPaymentTimeout = 15;
              var req = {};
            BookingModel.find({"status":'Pending'}).populate('guest').populate('user').populate('space').populate('partner').populate('room').deepPopulate('room.roomtype').exec(function(err, bookingfailures) {
                if (err) {
                    // return res.status(500).json({
                    //     error: 'Cannot list the bookingfailures'
                    // });
                    console.log('BOOKING FAILURE CRON :: Cannot list the bookingfailures');
                }
                else{
                    //async for considering each booking and sending mail to pending booking users
                    async.eachSeries(bookingfailures, function(bookingfailure, callbackbooking) {
                        // console.log(bookingfailure.sequenceNumber);
                        // console.log(config.retryPaymentTimeout);
                        var starttime = bookingfailure.bookingStartTime;
                        
                        // logger.log('info', 'GET '+req._parsedUrl.pathname+' bookingStartTime' + starttime );

                        console.log('BOOKING FAILURE CRON :: Booking ID in queue - '+bookingfailure.bookingConfirmationId);
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

                        var endtime = bookingfailure.bookingEndTime;

                        // logger.log('info', 'GET '+req._parsedUrl.pathname+' bookingEndTime' + endtime );s

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
                        var roomTypeRequired = bookingfailure.room.roomtype.name;
                        //calculating the difference between booking initiated time and current time
                        var retryBooking =true;
                        var date= new Date();
                        var diff = Math.abs(new Date(bookingfailure.createdAt) - new Date(date));
                            // console.log(diff);
                        var minutes = Math.floor((diff/1000)/60);
                            // console.log(minutes);
                        var timeout=false;
                        /*
                         * if difference between booking initiated time and current time is greater than or equal to 15,
                         * change status to TimedOut and merge the slot and update booking and schedule
                         * 
                         */
                            // console.log(config.retryPaymentTimeout);
                            // console.log(minutes >= config.retryPaymentTimeout);
                        if(minutes >= config.retryPaymentTimeout){ 
                            timeout=true;
                            
                            if(roomTypeRequired == 'Training Room' || roomTypeRequired == 'Hot Desk'){
                                 BookingModel.load(bookingfailure._id, function(err, booking) {
                                        if (err){
                                            // return next(err);
                                            console.log('BOOKING FAILURE CRON :: '+err);
                                        }
                                        booking.status = 'TimedOut';
                                        booking.save(function(err, bookedItem) {
                                            if (err) {
                                                // return res.status(500).json({
                                                //     error: 'Cannot save the Booking'
                                                // });
                                                console.log('BOOKING FAILURE CRON :: Cannot save the Booking');
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
                                                
                                                async.eachSeries(uniqueScheduleList, function(scheduleObj, callback1) {
                                                    ScheduleModel.load(scheduleObj, function(err, schedule) {
                                                        var newtimeobj = {};
                                                        var currentAvail = schedule.currentAval;
                                                        
                                                        //var scheduleObjDate = new Date(scheduleObj.date);
                                                        var scheduleObjDate = new Date(currentAvail[0].startTime);
                                                        scheduleObjDate = scheduleObjDate.setMinutes(scheduleObjDate.getMinutes() - booking.timeZoneOffset);
                                                        scheduleObjDate = new Date(scheduleObjDate);
                                                        
                                                            // console.log(scheduleObjDate);
                                                        
                                                        // Using 'scheduler' 'customizeTimeForDate'
                                                        var offsetStartTime = new Date(scheduler.customizeTimeForDate(scheduleObjDate, booking.startTime));
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
                                                                // return res.status(500).json({
                                                                //     error: 'Cannot update the feature'
                                                                // });
                                                                console.log('BOOKING FAILURE CRON :: Cannot update the feature');
                                                            }
                                                            var currentAvail = schedule.currentAval;
                                                            var index = scheduler.findBlockedSlot(currentAvail, booking.bookingStartTime, newtimeobj.endTime);
                                                            currentAvail[index].isBlocked = false;
                                                            currentAvail = scheduler.mergeAllSlot(currentAvail);
                                                            schedule.currentAval = currentAvail;
                                                            RoleModel.findOne({"name":"Admin"},function(err,role){
                                                                if(err) {
                                                                    // logger.log('error', 'GET '+req._parsedUrl.pathname+'Checking for admin login'+err+''); 
                                                                    console.log('BOOKING FAILURE CRON :: Checking for admin login '+err);
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
                                                              
                                                           notify.addNotificationURL('Cancelled',booking.bookingConfirmationId +'     '+ ' has been cancelled.Click here for more details', booking.user,'/bookings/mybookings');
                                                           notify.addNotificationURL('Cancelled',booking.bookingConfirmationId +'     '+ ' has been cancelled.Click here for more details', booking.partner,'/admin/bookings');
                                                           schedule.save(function(err) {
                                                                if (err) {
                                                                    // return res.status(500).json({
                                                                    //     error: 'Cannot update the schedule'
                                                                    // });
                                                                    console.log('BOOKING FAILURE CRON :: Cannot update the schedule');
                                                                }
                                
                                                                var starttime = booking.bookingStartTime;
                                                                    // logger.log('info', 'GET '+req._parsedUrl.pathname+' bookingStartTime' + starttime );
                                                                    console.log('BOOKING FAILURE CRON :: Logged');
                                                                var starttimeiso = starttime;
                                                                starttimeiso.setMinutes(starttimeiso.getMinutes() - (config.zoneOffset.indiaOffset)); 
                                    
                                                                starttimeiso = new Date(starttimeiso);
                                                               
                                                                var starttimehrs = starttimeiso.getHours();
                                                                var starttimemins = starttimeiso.getMinutes();
                                    
                                                                if(starttimemins == 0){
                                                                    starttimemins = starttimemins + '0';
                                                                }
                                                                
                                                                if(starttimehrs  < 12) {
                                                                    var bookingsstartTime = starttimehrs + ':' + starttimemins + ' AM';
                                                                } else if(starttimehrs == 12) {
                                                                    var bookingsstartTime =  starttimehrs + ':' + starttimemins + ' PM';
                                                                } else{
                                                                    starttimehrs = starttimehrs - 12;
                                                                    var bookingsstartTime =  starttimehrs + ':' + starttimemins + ' PM';
                                                                }
                                    
                                                                var endtime = booking.bookingEndTime;
                                                                    // logger.log('info', 'GET '+req._parsedUrl.pathname+' bookingEndTime' + endtime );
                                                                    console.log('BOOKING FAILURE CRON :: Logged');
                                                                var endtimeiso  = endtime;
                                    
                                                                endtimeiso.setMinutes(endtimeiso.getMinutes() - (config.zoneOffset.indiaOffset)); 
                                                                endtimeiso = new Date(endtimeiso);
                                    
                                                                var endtimehrs = endtimeiso.getHours();
                                                                var endtimemins = endtimeiso.getMinutes();
                                    
                                                                if(endtimemins == 0){
                                                                    endtimemins = endtimemins + '0';
                                                                }
                                                                
                                                                if(endtimehrs < 12){
                                                                    var bookingsendTime = endtimehrs + ':' + endtimemins + ' AM';
                                                                } else if(endtimehrs == 12) {
                                                                    var bookingsendTime =  endtimehrs + ':' + endtimemins + ' PM';
                                                                } else{
                                                                    endtimehrs=endtimehrs-12;
                                                                    var bookingsendTime =  endtimehrs + ':' + endtimemins + ' PM';
                                                                }
                                                                
                                                                var loggedUser;
                                                                if(!booking.user){
                                                                    loggedUser = booking.guestUser;
                                                                    var emailGuest = templates.booking_cancellation_guest(loggedUser, req,booking,bookingsstartTime,bookingsendTime);
                                                                    mail.mailService(emailGuest,loggedUser.email);
                                                                } else {
                                                                    loggedUser = booking.user;
                                                                    var email = templates.booking_cancellation(booking.user, req,booking,bookingsstartTime,bookingsendTime);
                                                                    mail.mailService(email,booking.user.email);
                                                                }
                                                                if(booking.bookingConfirmationId.length > 13){
                                                                    sms.send(loggedUser.phone, 'Your booking has been cancelled. An email has been forwarded to your registered email id.', function(status) {
                                                                        logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New booking SMS sent [' + guestUser.phone + ']: ' + status);
                                                                    });
                                                                }
                                                                else {
                                                                    sms.send(loggedUser.phone, 'Your booking id (' + booking.bookingConfirmationId + ') has been cancelled. An email has been forwarded to your registered email id.', function(status) {
                                                                        // logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New booking SMS sent [' + user.phone + ']: ' + status);
                                                                        console.log('BOOKING FAILURE CRON :: New booking SMS sent - '+loggedUser.phone+'Status'+status);
                                                                    });
                                                                }
                                                                
                                                            });
                                                        });
                                                    });
                                                }, function(err) {
                                                    if(err) {
                                                        // return res.status(500).json({
                                                        //     error: 'Error for outer loop. ' + err
                                                        // });
                                                        console.log('BOOKING FAILURE CRON :: Error for outer loop '+err);
                                                    } 
                                                });
                                                
                                            } ], function(err, result) {
                                                if(err) {
                                                    // return res.status(500).json({
                                                    //     error: 'Error while booking Hot desk. ' + err
                                                    // });
                                                    console.log('BOOKING FAILURE CRON :: Error while booking Hot desk '+err);
                                                } 
                                                //res.json(result);
                                            });
                                            
                                        });
                                    });
                            }else{
                                 BookingModel.load(bookingfailure._id, function(err, booking) {
                                     if (err){
                                        // return next(err);
                                        console.log('BOOKING FAILURE CRON :: '+err);
                                    }
                                     booking.status = 'TimedOut';
                                     booking.save(function(err, bookedItem) {
                                         if (err) {
                                             // return res.status(500).json({
                                             //     error: 'Cannot save the Booking'
                                             // });
                                             console.log('BOOKING FAILURE CRON :: Cannot save the Booking');
                                         }
                                         ScheduleModel.load(booking.schedule, function(err, schedule) {
                                             var newtimeobj = {};
                                              /*
                                  * Adding 45Mins to booking end time and substracting 45mins from start time
                                  * 
                                  */
                                    var bookingStartTimeSubstract=new Date(booking.bookingStartTime);
                                    var bookingStartTimeSubstractOne=new Date(bookingStartTimeSubstract);
                                    var finalBookingStartTime=stringToTimeStamp(bookingStartTimeSubstractOne.setMinutes(bookingStartTimeSubstract.getMinutes()-45));
                                    //Adding 45Mins for end time
                                    var bookingEndTimeAdd=new Date(booking.bookingEndTime);
                                    var bookingEndTimeAddOne=new Date(bookingEndTimeAdd);
                                    var finalBookingEndTime=stringToTimeStamp(bookingEndTimeAddOne.setMinutes(bookingEndTimeAdd.getMinutes()+45));
                                    
                                   /*
                                    * End of Adding 45Mins to booking end time and substracting 45mins from start time
                                    * 
                                    */ 
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
                                                     // return res.status(500).json({
                                                     //     error: 'Cannot update the feature'
                                                     // });
                                                      console.log('BOOKING FAILURE CRON :: Cannot update the feature');
                                                 }
                                                 var currentAvail = schedule.currentAval;
                                                 var index = scheduler.findBlockedSlot(currentAvail, booking.bookingStartTime, newtimeobj.endTime);
                                                 currentAvail[index].isBlocked = false;
                                                 currentAvail = scheduler.mergeAllSlot(currentAvail);
                                                 schedule.currentAval = currentAvail;
                                                schedule.save(function(err) {
                                                     if (err) {
                                                         // return res.status(500).json({
                                                         //     error: 'Cannot update the schedule'
                                                         // });
                                                         console.log('BOOKING FAILURE CRON :: Cannot update the schedule');
                                                     }
                                                        // console.log("after schedule update................");
                                                     var guestUser=booking.guestUser;
                                                     var userSMSObj;
                                                     if(!booking.user){
                                                        userSMSObj = guestUser;
                                                        var emailGuest = templates.booking_cancellation_guest(guestUser, req,booking,bookingsstartTime,bookingsendTime);
                                                        mail.mailService(emailGuest,guestUser.email);
                                                     }else{
                                                        userSMSObj = booking.user;
                                                        var email = templates.booking_cancellation(booking.user, req,booking,bookingsstartTime,bookingsendTime);
                                                        mail.mailService(email,booking.user.email);
                                                     }
                                                    
                                                    if(booking.bookingConfirmationId.length > 13){
                                                        sms.send(userSMSObj.phone, 'Your booking has been cancelled. An email has been forwarded to your registered email id.', function(status) {
                                                            // logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New booking SMS sent [' + userSMSObj.phone + ']: ' + status);
                                                            console.log('BOOKING FAILURE CRON :: New booking SMS sent - '+userSMSObj.phone+'Status'+status);
                                                        });
                                                    }
                                                    else {
                                                        sms.send(userSMSObj.phone, 'Your booking id (' + booking.bookingConfirmationId + ') has been cancelled. An email has been forwarded to your registered email id.', function(status) {
                                                            // logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New booking SMS sent [' + user.phone + ']: ' + status);
                                                            console.log('BOOKING FAILURE CRON :: New booking SMS sent - '+userSMSObj.phone+'Status'+status);
                                                        });
                                                    }
                                                     
                                                     // Email to Admins
                                                     var emailConfig = config.email_config('cancelledBooking');
                		                 			 if(emailConfig.length > 0 ){
                		                 			     var confirmedBooking = emailConfig;
                		                 			     var emails;
                		                 			     for(var i = 0; i < confirmedBooking.length; i++){
                		                 			    	if(confirmedBooking[i].city === 'All'){
                			                 			    	emails = confirmedBooking[i].emails;
                			                 			    /*} else if(confirmedBooking[i].city === 'Bangalore'){
                			                 			    	emails = confirmedBooking[i].emails;
                			                 			    } else if(confirmedBooking[i].city === 'Mumbai' || confirmedBooking[i].city === 'Pune'){
                				                 			    emails = confirmedBooking[i].emails;*/
                			                 			    } else {
                			                 			    	console.log('No such Object.');
                			                 			    }
                		                 			     }
                		                 			     async.eachSeries(emails, function(email, callback1) {
                		                 			    	var user_name = email.name;
                		        							var user_email = email.email_addr;
                		                                    if (!booking.user) {
                		                                        var emailadmin = templates.booking_cancellation_admin({first_name: 'Admin'}, req,booking,bookingsstartTime,bookingsendTime);
                		                                        //mailbooking.mailService(emailadmin, 'bookings@mymatchbox.in')
                		                                        mail.mailService(emailadmin, user_email);
                		                                    } else {
                		                                        var emailadmin = templates.booking_cancellation_admin({first_name: 'Admin'}, req,booking,bookingsstartTime,bookingsendTime);
                		                                        //mailbooking.mailService(emailadmin, 'bookings@mymatchbox.in')
                		                                        mail.mailService(emailadmin, user_email);
                		                                    }
                		                                    callback1();
                		                 			    }, function(err) {
                		                					if(err) {
                		                						return res.status(500).json({
                		                							error: 'Error while booking. ' + err
                		                						});
                		                					} 
                		                				});
                		                 			 } else {
                		                 				 console.log('Email Config didnot loaded');
                		                 			 }
                                                        // console.log("after mailllllllll");
                                                 });
                                             });
                                         });
                                     });
                                 });
                            }
                              
                        }
                        /*
                         * if time is less than 15mins  check for isMerged(default value is false,it is set true once email is sent
                         * to the user which avoids sending email to the same user all the time)and send email
                         */
                        
                        else if((config.retryPaymentLowerLimit <= minutes) && (minutes < config.retryPaymentUpperLimit)){
                            timeout=false;
                                // console.log(timeout);
                            var url='';
                            // '?search_lon=' + $scope.searchElements.lon +'&search_lat=' + $scope.searchElements.lat + '&capacitymin='+$scope.searchElements.capacity.min+ '&capacitymax='+$scope.searchElements.capacity.max+ '&start_time='+$scope.searchElements.stime+ '&end_time='+$scope.searchElements.etime +'&roomType='+$scope.searchElements.roomType+'&place='+$scope.searchElements.place+'&from_date='+$scope.searchElements.fromDate+'&end_date='+$scope.searchElements.endDate+
                            // '&timeType='+$rootScope.dateObj.timeType+'&dateselc='+$rootScope.dateObj.date+'&pageNo='+$scope.pageNo
                            if(!bookingfailure.isMerged){
                                if(roomTypeRequired == 'Training Room'){
                                    url='/training/room/'+bookingfailure.room._id +'/bookings'+'?search_lon=' + bookingfailure.space.loc[0] +'&search_lat=' + bookingfailure.space.loc[1] + '&capacitymin='+bookingfailure.capacity+ '&capacitymax='+bookingfailure.room.capacity+ '&start_time='+bookingfailure.startTime+ '&end_time='+bookingfailure.endTime +'&roomType='+bookingfailure.room.roomtype.name+'&place='+'&from_date='+bookingfailure.fromDate+'&end_date='+bookingfailure.endDate+'&timeType='+'&dateselc='+'&pageNo='+'&retry='+retryBooking+'&booking='+bookingfailure._id+'&timeout='+timeout;
                                }else if(roomTypeRequired == 'Hot Desk'){
                                    url='/hot-desk/room/'+bookingfailure.room._id +'/bookings'+'?search_lon=' + bookingfailure.space.loc[0] +'&search_lat=' + bookingfailure.space.loc[1] + '&capacitymin='+bookingfailure.capacity+ '&capacitymax='+bookingfailure.room.capacity+ '&start_time='+bookingfailure.startTime+ '&end_time='+bookingfailure.endTime +'&roomType='+bookingfailure.room.roomtype.name+'&place='+'&from_date='+bookingfailure.fromDate+'&end_date='+bookingfailure.endDate+'&timeType='+'&dateselc='+'&pageNo='+'&retry='+retryBooking+'&booking='+bookingfailure._id+'&timeout='+timeout;
                                }else{
                                
                                var newStartDate = new Date(bookingfailure.bookingStartTime);
                                newStartDate = newStartDate.setMinutes(newStartDate.getMinutes() - 330);
                                newStartDate = new Date(newStartDate);

                                bookingfailure.bookingStartTime = newStartDate;
                                
                                bookingsstartTime = newStartDate;

                                var cancelStarttime  = new Date(bookingsstartTime);

                                cancelStarttime.setMinutes(cancelStarttime.getMinutes()); 
                                cancelStarttime = new Date(cancelStarttime.setMinutes(newStartDate.getMinutes() + 330));

                                var startTimeHr = cancelStarttime.getHours();
                                var startTimeMin = cancelStarttime.getMinutes();

                                if(startTimeMin == 0){
                                startTimeMin = startTimeMin + '0';
                                }

                                if(startTimeHr < 12){
                                var newBookingStartTimeAMPM = startTimeHr + ':' + startTimeMin + ' AM';
                                } else if(startTimeHr == 12) {
                                var newBookingStartTimeAMPM =  startTimeHr + ':' + startTimeMin + ' PM';
                                } else{
                                startTimeHr=startTimeHr-12;
                                var newBookingStartTimeAMPM =  startTimeHr + ':' + startTimeMin + ' PM';
                                }
                                
                                
                                // console.log(newBookingStartTimeAMPM);
                                bookingsstartTime = newBookingStartTimeAMPM;


                                var newEndDate = new Date(bookingfailure.bookingEndTime);
                                newEndDate = newEndDate.setMinutes(newEndDate.getMinutes() - 330);
                                newEndDate = new Date(newEndDate);

                                bookingfailure.bookingEndTime = newEndDate;


                                bookingsendTime = newEndDate; 

                                
                                var cancelEndtime  = new Date(bookingsendTime);

                                cancelEndtime.setMinutes(cancelEndtime.getMinutes()); 
                                cancelEndtime = new Date(cancelEndtime.setMinutes(newEndDate.getMinutes() + 330));

                                var endTimeHr = cancelEndtime.getHours();
                                var endTimeMin = cancelEndtime.getMinutes();

                                if(endTimeMin == 0){
                                endTimeMin = endTimeMin + '0';
                                }

                                if(endTimeHr < 12){
                                var newBookingEndTimeAMPM = endTimeHr + ':' + endTimeMin + ' AM';
                                } else if(endTimeHr == 12) {
                                var newBookingEndTimeAMPM =  endTimeHr + ':' + endTimeMin + ' PM';
                                } else{
                                endTimeHr=endTimeHr-12;
                                var newBookingEndTimeAMPM =  endTimeHr + ':' + endTimeMin + ' PM';
                                }
                                
                                
                                // console.log(newBookingEndTimeAMPM);
                                bookingsendTime = newBookingEndTimeAMPM;


                                    url='/room/'+bookingfailure.room._id +'/bookings'+'?search_lon=' + bookingfailure.space.loc[0] +'&search_lat=' + bookingfailure.space.loc[1] + '&capacitymin='+bookingfailure.capacity+ '&capacitymax='+bookingfailure.room.capacity+ '&start_time='+bookingfailure.bookingStartTime+ '&end_time='+bookingfailure.bookingEndTime +'&roomType='+bookingfailure.room.roomtype.name+'&place='+'&from_date='+'&end_date='+'&timeType='+'&dateselc='+bookingfailure.bookingDate+'&pageNo='+'&retry='+retryBooking+'&booking='+bookingfailure._id+'&timeout='+timeout;
                                        // console.log(url);
                                }
                                if(!bookingfailure.user){
                                    GuestModel.findOne({_id: bookingfailure.guestUser}).exec(function (err, guestUser) {
                                        if(err) {
                                            // return res.json(err);
                                            console.log('BOOKING FAILURE CRON :: '+err);
                                        }
	                                    var email = templates.booking_unsuccessful_guest(guestUser, bookingfailure.room,bookingfailure.space,bookingfailure,bookingsstartTime,bookingsendTime,roomTypeRequired,retryBooking,timeout,url);
	                                    mail.mailService(email,guestUser.email);
                                    });
                                }else{
                                    var email = templates.booking_unsuccessful(bookingfailure.user, bookingfailure.room,bookingfailure.space,bookingfailure,bookingsstartTime,bookingsendTime,roomTypeRequired,retryBooking,timeout,url);
                                    mail.mailService(email,bookingfailure.user.email);
                                }
                            }else{
                                // console.log("no operations");
                                 console.log('BOOKING FAILURE CRON :: No operation.');
                            }
                            //updating booking after sending the email
                            bookingfailure.isMerged=true;
                            bookingfailure.save(function(err,bookingfailure){
                                if (err) {
                                    console.log('BOOKING FAILURE CRON :: Cannot save the Booking.'+'ERRCODE'+'1001');
                                }   
                            });
                            
                        } else {
                            console.log('CRON is in else');
                        }
                        callbackbooking();
                    }, function(err) {
                    });
                    // res.send(200);
                }
            });
            console.log('-----------------------BOOKING FAILURE CRON :: Function ended.------------------------');
         },
         
         
         /**
          * CRON to update a boolean flag for Confirmed and Completed
          * Bookings so as to Review.
          */
         bookingReviewCron : function(){
        	 console.log('Booking Review Cron');
        	 var query = {
        		 status : 'Confirmed'
        	 };
        	 BookingModel.find(query)
        	 	.deepPopulate(['room','room.roomtype'])
        	 	.populate('room').populate('bookedRooms')
        	 	.exec( function(err, bookings) {
        	 		
	                 if (err) console.log(err);
	                 if (!bookings) console.log(new Error('Failed to load bookings'));
	                 
	                 async.each(bookings, function(booking, callback) {
	                	 var bookingEndTime;
	                	 var currentTime;
	                	 if((booking.room.roomtype.name === 'Hot Desk') && (booking.room.roomtype.name === 'Training Room')){
	                		 bookingEndTime = new Date(booking.endDate + ' ' + booking.endTime);
		                	 currentTime = new Date();
		                	 if(bookingEndTime < currentTime){
				                 booking.isReviewed = true;
				                 booking.save(function(err, booking){
		                             if (err) {
		                            	 console.log(err);
		                             }   
		                             callback();
		                         });
			                 } else {
			                	 callback();
			                 }
	                	 } else {
	                		 bookingEndTime = new Date(booking.bookingEndTime);
		                	 currentTime = new Date();
		                	 if(bookingEndTime < currentTime){
				                 booking.isReviewed = true;
				                 booking.save(function(err, booking){
		                             if (err) {
		                            	 console.log(err);
		                             }   
		                             callback();
		                         });
			                 } else {
			                	 callback();
			                 }
	                	 }
		                 
	                 }, function(err) {
	                	 if (err) console.log(err);
	                 });
             });
         },
         
    };

}