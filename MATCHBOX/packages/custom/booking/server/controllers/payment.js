'use strict';

/**
 * Module dependencies.
 */

var notify = require('../../../notification/server/controllers/notify.js');
require('../../../role/server/models/role.js');
require('../../../../core/users/server/models/user.js');
require('../../../rooms/server/models/roomtypes.js');
require('../../../space/server/models/space.js');

var mongoose = require('mongoose'),
    config = require('meanio').loadConfig(),
    async = require('async'),
    BookingModel = mongoose.model('Booking'),
    ScheduleModel = mongoose.model('Schedule'),
    _ = require('lodash'),
    scheduler=require('./scheduler.js'),
    nodemailer = require('nodemailer'),
    templates = require('../template'),
    async = require('async'),
    RoleModel = mongoose.model('Role'),
    UserModel = mongoose.model('User'),
    RoomtypeModel = mongoose.model('Roomstype'),
    Mailgen = require('mailgen'),
    mail = require('../../../../core/system/server/services/mailService.js'),
    mailbooking = require('../../../booking/server/services/bookingMailservice.js'),
    //notify=require('../../../notification/server/controllers/notify.js'),
    SpaceModel = mongoose.model('Space'),
    config = require('meanio').loadConfig();

var logger = require('../../../../core/system/server/controllers/logs.js');
var sms = require('../../../../core/system/server/controllers/sms.js');

/**
 * Send email to booked user
 */
function sendMail(mailOptions) {
    var transport = nodemailer.createTransport(config.mailer);
    transport.sendMail(mailOptions, function (err, response) {
        if (err) return err;
        return response;
    });
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

module.exports = function (Payment) {
	
    /**
     * Success of Payment
     */
    return {
    	
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
        
        space: function(req, res, next, id){
            SpaceModel.load(id, function (err, space) {
                    if (err) { return next(err); }
                    if (!space) { return next(new Error('Failed to load space ' + id)); }

                    req.space = space;
                    next();
                });
          },

        successPayUMoney: function (req, res) {
            BookingModel.load(req.body.txnid, function (err, booking) {
                if (err) return next(err);
                var user = booking.user;
                booking.status='Confirmed';
                booking.payUMoneyId=req.body.payuMoneyId;
                
                // Fetch the list of Bookings for bookingId based on city, roomtype and year
                var bIDcity = '';
                var bIDroomType = '';
                if(booking.space.city.match(RegExp('^Bangalore$', "i"))){
                	bIDcity = 'BNG';
                } else if (booking.space.city.match(RegExp('^Pune$', "i"))){
                	bIDcity = 'PUN';
                } else {
                	bIDcity = 'MUM';
                }
                var bIDPattern = bIDcity;
                
                if(booking.room.roomtype.name == 'Meeting Room'){
                	bIDroomType = 'M';
                } else if(booking.room.roomtype.name == 'Board Room'){
                	bIDroomType = 'B';
                } else if(booking.room.roomtype.name == 'Hot Desk'){
                	bIDroomType = 'H'
                } else if(booking.room.roomtype.name == 'Training Room'){
                	bIDroomType = 'T'
                } else {
                	console.log('NO ROOMTYPE');
                }
                bIDPattern = bIDPattern.concat(bIDroomType);
                
                var date = new Date();
                var year = date.getFullYear();
                bIDPattern = bIDPattern.concat(year);
                bIDPattern = bIDPattern.toString();

                var query = {
                	bookingConfirmationId :  { $regex: bIDPattern }
                }
                
                BookingModel.find(query).sort({bookingConfirmationId : -1}).exec(function(err, bookingList){
                	if (err) {
                          return res.status(500).json({
                              error: 'Cannot find the bookingObject'
                           });
                	}
                	if(!bookingList){
                		console.log(bookingList.length);
                	}
                	
                	var bookingObject, lastFiveDigit, lastFiveDigitString;
                	bookingObject = bookingList[0];
                	console.log(bookingObject);
                	if(bookingObject){
                    	lastFiveDigit = bookingObject.bookingConfirmationId.slice(-5);
                    	lastFiveDigit = parseInt(lastFiveDigit) + 1;
                	} else {
                		lastFiveDigit = '1';
                    	lastFiveDigit = parseInt(lastFiveDigit);
                	}
                	lastFiveDigitString = lastFiveDigit.toString();
                	lastFiveDigitString = lastFiveDigitString.replace(/\d+/g, function(m){
                     	 return "0000".substr(m.length - 1) + m;
                    });
                	 
                	booking.bookingConfirmationId = bIDPattern.concat(lastFiveDigitString);
                	 
                
	                booking.save(function (err, bookedItem) {
	                    if (err) {
	                        return res.status(500).json({
	                            error: 'Cannot save the Booking'
	                        });
	                    }
	                    notify.addNotificationForBooking('Room is Booked', 'New'+ '		' + booking.room.roomtype.name + '	 ' + 'booked with'+'	'+ booking.bookingConfirmationId + '. '+'Click for details', booking , '/admin/bookings');
	                    
	                    if(booking.schedule){
		                    ScheduleModel.load(booking.schedule, function (err, schedule) {
		                        var currentAvail=schedule.currentAval;
		                        var index = scheduler.findBlockedSlot(currentAvail, booking.bookingStartTime, booking.bookingEndTime);
		                        currentAvail.splice(index, 1);
		                        schedule.currentAval = currentAvail;
		                        schedule.save(function (err) {
		                            if (err) {
		                                return res.status(500).json({
		                                    error: 'Cannot update the schedule'
		                                });
		                            }
		                            var user=booking.user;
		                            var room =booking.room;
		                            var partner =booking.partner;
		                            var space =booking.space;
		                            
			                        RoomtypeModel.findOne({"_id": booking.room.roomtype}).exec(function (err, roomtypeObj) {
			                                if (err) {
			                                      return res.status(500).json({
			                                      error: 'Cannot list the roomtypeObj'
			                               });
			                          }

			                            var roomType=roomtypeObj.name;
			                            res.redirect("/booking/success?booking_id="+booking._id +"&nord");
			                            
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
			                            if(!user){
			                            	 sms.send(guestUser.phone, 'Thank you for using mymatchbox! Your booking id (' + booking.bookingConfirmationId + ') is confirmed. An email has been forwarded to your registered email id.', function(status) {
			                                     logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New booking SMS sent [' + guestUser.phone + ']: ' + status);
			                                 });
			                            	 var emailGuest = templates.booking_email_guest(guestUser, room,space,booking,bookingsstartTime,bookingsendTime,roomType)
			                      			mailbooking.mailService(emailGuest,guestUser.email)
			                      			

			                      			var emailpartner = templates.booking_email_partner_mail_guestUser(partner, room,space,booking,bookingsstartTime,bookingsendTime,roomType)
			                 				mailbooking.mailService(emailpartner,partner.email)
			                            


			                            }else{
			                            	 sms.send(user.phone, 'Thank you for using mymatchbox! Your booking id (' + booking.bookingConfirmationId + ') is confirmed. An email has been forwarded to your registered email id.', function(status) {
			                                     logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New booking SMS sent [' + user.phone + ']: ' + status);
			                                 });
			                            	 var email = templates.booking_email(user, room,space,booking,bookingsstartTime,bookingsendTime,roomType)
			                      			mailbooking.mailService(email,user.email)
			                      			

			                      			var emailpartner = templates.booking_email_partner_mail(partner, room,space,booking,bookingsstartTime,bookingsendTime,roomType)
			                 				mailbooking.mailService(emailpartner,partner.email)
			                            }

		                 			
		                 			   /*
		                 			    *  Sending Booking mail to Back office and Front Office 
		                 			    */
		                 			      SpaceModel.findOne({_id: space._id}).populate('teams').exec(function (err, space) {
					                          if(err) {
					                        	  return res.json(err);
					                          }
						                      async.eachSeries(space.teams, function(teamObj, callback1) {
							                      UserModel.findOne({_id: teamObj._id}).exec(function (err, teamUser) {
							                          if(err) {
							                        	  return res.json(err);	
							                          }
							                          else{
							                        	  if(!user){
							                        		  var emailTeam = templates.booking_email_partner_mail_guestUser(teamUser, room,space,booking,bookingsstartTime,bookingsendTime,roomType)
									                   			mailbooking.mailService(emailTeam,teamUser.email)
							                        	  }else{
							                        		  var emailTeam = templates.booking_email_partner_mail(teamUser, room,space,booking,bookingsstartTime,bookingsendTime,roomType)
									                   			mailbooking.mailService(emailTeam,teamUser.email)
							                        	  }
							                        	  sms.send(teamUser.phone, 'A new  booking(' + booking.bookingConfirmationId + ') has been done in your Space. Kindly login to the site to check for details.', function(status) {
				                                                 logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New booking SMS sent [' + teamUser.phone + ']: ' + status);
				                                                   });
							                        	  
							                        	  callback1();
							                          }
							                      }); 
						                      });
						                      
					                      });  
		                 			      
		                 			    /*
		                 			     * End of Sending Booking mail to Back office and Front Office
		                 			     * 
		                 			     */
		                 			
			                            /*
			                             * Sending booking mail to the bookings ID
			                             * 
			                             */
		                 			     var emailConfig = config.email_config('confirmedBooking');
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
			                                    if (user) {
			                                        var emailadmin = templates.booking_email_admin({first_name: 'Admin'}, room, space, booking, bookingsstartTime, bookingsendTime, roomType);
			                                        //mailbooking.mailService(emailadmin, 'bookings@mymatchbox.in')
			                                        mailbooking.mailService(emailadmin, user_email);
			                                    } else {
			                                        var emailadmin = templates.booking_email_admin_guestUser({first_name: 'Admin'}, room, space, booking, bookingsstartTime, bookingsendTime, roomType);
			                                        //mailbooking.mailService(emailadmin, 'bookings@mymatchbox.in')
			                                        mailbooking.mailService(emailadmin, user_email);
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
			                             /*
			                              * End of sending booking mails to bookings ID
			                              * 
			                              */
			                        });
		                        });
		                    });
	                    } else if(booking.scheduleTraining){
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
			                    		
			                    		ScheduleModel.load(scheduleObj, function (err, schedule) {
			    	                        var currentAvail = schedule.currentAval;
					                        
				    				    	//var scheduleObjDate = new Date(scheduleObj.date);
				    				    	var scheduleObjDate = new Date(currentAvail[0].startTime);
				    				    	scheduleObjDate = scheduleObjDate.setMinutes(scheduleObjDate.getMinutes() - booking.timeZoneOffset);
				    				    	scheduleObjDate = new Date(scheduleObjDate);
				    				    	console.log(scheduleObjDate);
			
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
								               
								            var bookingsEndTime = new Date(finalBookingEndTime);
			    	                        
			    	                        var index = scheduler.findBlockedSlot(currentAvail, bookingsStartTime, bookingsEndTime);
			    	                        currentAvail.splice(index, 1);
			    	                        schedule.currentAval = currentAvail;
			    	                        schedule.save(function (err) {
			    	                            if (err) {
			    	                                return res.status(500).json({
			    	                                    error: 'Cannot update the schedule'
			    	                                });
			    	                            }
					                    		callback1();
			    	                        });
			    	                    });
			                    	}, function(err) {
			        					if(err) {
			        						return res.status(500).json({
			        							error: 'Error for success payment. ' + err
			        						});
			        					} 
			        					done(null, booking);
			        				});
			                    	
	                         }, function(booking, done){
	                        	 
	                        	 	var user = booking.user;
		                            var room = booking.room;
		                            var partner =booking.partner;
		                            var space = booking.space;
		                            RoomtypeModel.findOne({"_id": booking.room.roomtype}).exec(function (err, roomtypeObj) {
		                                if (err) {
		                                      return res.status(500).json({
		                                    	  error: 'Cannot list the roomtypeObj'
		                                      });
		                                }
		                                var roomType=roomtypeObj.name;
		                                res.redirect("/booking/success/trainingRoom?booking_id="+booking._id +"&nord");
		                            
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
		                             if(!user){
		                             	 sms.send(guestUser.phone, 'Thank you for using mymatchbox! Your booking id (' + booking.bookingConfirmationId + ') is confirmed. An email has been forwarded to your registered email id.', function(status) {
		                                      logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New booking SMS sent [' + guestUser.phone + ']: ' + status);
		                                  });
		                             	 var emailGuest = templates.booking_email_guest(guestUser, room,space,booking,bookingsstartTime,bookingsendTime,roomType)
		                       			 mailbooking.mailService(emailGuest,guestUser.email)
		                       			 var emailpartner = templates.booking_email_admin_guestUser(partner, room,space,booking,bookingsstartTime,bookingsendTime,roomType)
		                       			 mailbooking.mailService(emailpartner,partner.email)
		                             }else{
		                             	 sms.send(user.phone, 'Thank you for using mymatchbox! Your booking id (' + booking.bookingConfirmationId + ') is confirmed. An email has been forwarded to your registered email id.', function(status) {
		                                      logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New booking SMS sent [' + user.phone + ']: ' + status);
		                                  });
		                             	 var email = templates.booking_email(user, room,space,booking,bookingsstartTime,bookingsendTime,roomType)
		                       			 mailbooking.mailService(email,user.email)
		                       			 var emailpartner = templates.booking_email_admin(partner, room,space,booking,bookingsstartTime,bookingsendTime,roomType)
		                       			 mailbooking.mailService(emailpartner,partner.email)
		                             }
		                            
		                  			 /*
		                  			  *  Sending Booking mail to Back office and Front Office 
		                  			  */
		              			      SpaceModel.findOne({_id: space._id}).populate('teams').exec(function (err, space) {
				                          if(err) {
				                        	  return res.json(err);
				                          }
					                      async.eachSeries(space.teams, function(teamObj, callback2) {
						                      UserModel.findOne({_id: teamObj._id}).exec(function (err, teamUser) {
						                          if(err) {
						                        	  return res.json(err);	
						                          }
						                          else{
						                        	  if(user){
						                        		  var emailTeam = templates.booking_email_admin(teamUser, room,space,booking,bookingsstartTime,bookingsendTime,roomType)
								                   			mailbooking.mailService(emailTeam,teamUser.email)
						                        	  }else{
						                        		  var emailTeam = templates.booking_email_admin_guestUser(teamUser, room,space,booking,bookingsstartTime,bookingsendTime,roomType)
								                   			mailbooking.mailService(emailTeam,teamUser.email)
						                        	  }
						                   			 sms.send(teamUser.phone, 'A new  booking(' + booking.bookingConfirmationId + ') has been done in your Space. Kindly login to the site to check for details.', function(status) {
	                                              logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New booking SMS sent [' + teamUser.phone + ']: ' + status);
	                                                });
						                        	  callback2();
						                          }
						                      }); 
					                      }, function(err) {
					        					if(err) {
					        						return res.status(500).json({
					        							error: 'Error for space teams. ' + err
					        						});
					        					} 
					        			  });
					                      
				                      });  
	              			    
	                                 /*if (!user) {
	                                     var emailadmin = templates.booking_email_guest({first_name: 'Admin'}, room, space, booking, bookingsstartTime, bookingsendTime, roomType)
	                                     mailbooking.mailService(emailadmin, 'bookings@mymatchbox.in')
	                                 } else {
	                                     var emailadmin = templates.booking_email({first_name: 'Admin'}, room, space, booking, bookingsstartTime, bookingsendTime, roomType)
	                                     mailbooking.mailService(emailadmin, 'bookings@mymatchbox.in')
	                                 }*/
		              			    var emailConfig = config.email_config('confirmedBooking');
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
		                                    if (user) {
		                                        var emailadmin = templates.booking_email_admin({first_name: 'Admin'}, room, space, booking, bookingsstartTime, bookingsendTime, roomType);
		                                        //mailbooking.mailService(emailadmin, 'bookings@mymatchbox.in')
		                                        mailbooking.mailService(emailadmin, user_email);
		                                    } else {
		                                        var emailadmin = templates.booking_email_admin_guestUser({first_name: 'Admin'}, room, space, booking, bookingsstartTime, bookingsendTime, roomType);
		                                        //mailbooking.mailService(emailadmin, 'bookings@mymatchbox.in')
		                                        mailbooking.mailService(emailadmin, user_email);
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
	 	                            
	 	                        });
	                         } ], function(err, result) {
	             				if(err) {
	             					return res.status(500).json({
	             						error: 'Error while paying Hot desk. ' + err
	             					});
	             				} 
	             				//res.json(result);
	             			});
	                    }
	               }); // End of booking save
                });
            });
          },
        
          successPayUMoneyMobile: function (req, res) {
              BookingModel.load(req.body.txnid, function (err, booking) {
                  if (err) return next(err);
                  var user = booking.user;
                  booking.status='Confirmed';
                  booking.payUMoneyId=req.body.payuMoneyId;
                  
                  // Fetch the list of Bookings for bookingId based on city, roomtype and year
                  var bIDcity = '';
                  var bIDroomType = '';
                  if(booking.space.city.match(RegExp('^Bangalore$', "i"))){
                  	bIDcity = 'BNG';
                  } else if (booking.space.city.match(RegExp('^Pune$', "i"))){
                  	bIDcity = 'PUN';
                  } else {
                  	bIDcity = 'MUM';
                  }
                  var bIDPattern = bIDcity;
                  
                  if(booking.room.roomtype.name == 'Meeting Room'){
                  	bIDroomType = 'M';
                  } else if(booking.room.roomtype.name == 'Board Room'){
                  	bIDroomType = 'B';
                  } else if(booking.room.roomtype.name == 'Hot Desk'){
                  	bIDroomType = 'H'
                  } else if(booking.room.roomtype.name == 'Training Room'){
                  	bIDroomType = 'T'
                  } else {
                  	console.log('NO ROOMTYPE');
                  }
                  bIDPattern = bIDPattern.concat(bIDroomType);
                  
                  var date = new Date();
                  var year = date.getFullYear();
                  bIDPattern = bIDPattern.concat(year);
                  bIDPattern = bIDPattern.toString();

                  var query = {
                  	bookingConfirmationId :  { $regex: bIDPattern }
                  }
                  
                  BookingModel.find(query).sort({bookingConfirmationId : -1}).exec(function(err, bookingList){
                  	if (err) {
                            return res.status(500).json({
                                error: 'Cannot find the bookingObject'
                             });
                  	}
                  	if(!bookingList){
                  		console.log(bookingList.length);
                  	}
                  	
                  	/*var bookingObject = bookingList[0];
                  	var lastFiveDigit = bookingObject.bookingConfirmationId.slice(-5);
                  	lastFiveDigit = parseInt(lastFiveDigit) + 1;
                  	var lastFiveDigitString = lastFiveDigit.toString();
                  	lastFiveDigitString = lastFiveDigitString.replace(/\d+/g, function(m){
                       	return "0000".substr(m.length - 1) + m;
                    });*/
                  	
                  	var bookingObject, lastFiveDigit, lastFiveDigitString;
                	bookingObject = bookingList[0];
                	if(bookingObject){
                    	lastFiveDigit = bookingObject.bookingConfirmationId.slice(-5);
                    	lastFiveDigit = parseInt(lastFiveDigit) + 1;
                	} else {
                		lastFiveDigit = '1';
                    	lastFiveDigit = parseInt(lastFiveDigit);
                	}
                	lastFiveDigitString = lastFiveDigit.toString();
                	lastFiveDigitString = lastFiveDigitString.replace(/\d+/g, function(m){
                     	 return "0000".substr(m.length - 1) + m;
                    });
                  	 
                  	booking.bookingConfirmationId = bIDPattern.concat(lastFiveDigitString);
                  	 
                  
  	                booking.save(function (err, bookedItem) {
  	                    if (err) {
  	                        return res.status(500).json({
  	                            error: 'Cannot save the Booking'
  	                        });
  	                    }
  	                    notify.addNotificationForBooking('Room is Booked', 'New'+ '		' + booking.room.roomtype.name + '	 ' + 'booked with'+'	'+ booking.bookingConfirmationId + '. '+'Click for details', booking , '/admin/bookings');
  	                    
  	                    if(booking.schedule){
  		                    ScheduleModel.load(booking.schedule, function (err, schedule) {
  		                        var currentAvail=schedule.currentAval;
  		                        var index = scheduler.findBlockedSlot(currentAvail, booking.bookingStartTime, booking.bookingEndTime);
  		                        currentAvail.splice(index, 1);
  		                        schedule.currentAval = currentAvail;
  		                        schedule.save(function (err) {
  		                            if (err) {
  		                                return res.status(500).json({
  		                                    error: 'Cannot update the schedule'
  		                                });
  		                            }
  		                            var user=booking.user;
  		                            var room =booking.room;
  		                            var partner =booking.partner;
  		                            var space =booking.space;
  		                            
  			                        RoomtypeModel.findOne({"_id": booking.room.roomtype}).exec(function (err, roomtypeObj) {
  			                                if (err) {
  			                                      return res.status(500).json({
  			                                      error: 'Cannot list the roomtypeObj'
  			                               });
  			                          }

  			                            var roomType=roomtypeObj.name;
  			                            res.json({
  			                            	_id : bookedItem._id,
  			                            	bookingConfirmationId : bookedItem.bookingConfirmationId
  			                            });
  			                            
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
  			                            if(!user){
  			                            	 sms.send(guestUser.phone, 'Thank you for using mymatchbox! Your booking id (' + booking.bookingConfirmationId + ') is confirmed. An email has been forwarded to your registered email id.', function(status) {
  			                                     logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New booking SMS sent [' + guestUser.phone + ']: ' + status);
  			                                 });
  			                            	 var emailGuest = templates.booking_email_guest(guestUser, room,space,booking,bookingsstartTime,bookingsendTime,roomType)
  			                      			mailbooking.mailService(emailGuest,guestUser.email)
  			                      			var emailpartner = templates.booking_email_guest(partner, room,space,booking,bookingsstartTime,bookingsendTime,roomType)
  			                 			mailbooking.mailService(emailpartner,partner.email)
  			                            }else{
  			                            	 sms.send(user.phone, 'Thank you for using mymatchbox! Your booking id (' + booking.bookingConfirmationId + ') is confirmed. An email has been forwarded to your registered email id.', function(status) {
  			                                     logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New booking SMS sent [' + user.phone + ']: ' + status);
  			                                 });
  			                            	 var email = templates.booking_email(user, room,space,booking,bookingsstartTime,bookingsendTime,roomType)
  			                      			mailbooking.mailService(email,user.email)
  			                      			var emailpartner = templates.booking_email(partner, room,space,booking,bookingsstartTime,bookingsendTime,roomType)
  			                 			mailbooking.mailService(emailpartner,partner.email)
  			                            }

  		                 			
  		                 			   /*
  		                 			    *  Sending Booking mail to Back office and Front Office 
  		                 			    */
  		                 			      SpaceModel.findOne({_id: space._id}).populate('teams').exec(function (err, space) {
  					                          if(err) {
  					                        	  return res.json(err);
  					                          }
  						                      async.eachSeries(space.teams, function(teamObj, callback1) {
  							                      UserModel.findOne({_id: teamObj._id}).exec(function (err, teamUser) {
  							                          if(err) {
  							                        	  return res.json(err);	
  							                          }
  							                          else{
  							                        	  if(!user){
  							                        		  var emailTeam = templates.booking_email_guest(teamUser, room,space,booking,bookingsstartTime,bookingsendTime,roomType)
  									                   			mailbooking.mailService(emailTeam,teamUser.email)
  							                        	  }else{
  							                        		  var emailTeam = templates.booking_email(teamUser, room,space,booking,bookingsstartTime,bookingsendTime,roomType)
  									                   			mailbooking.mailService(emailTeam,teamUser.email)
  							                        	  }
  							                        	  sms.send(teamUser.phone, 'A new  booking(' + booking.bookingConfirmationId + ') has been done in your Space. Kindly login to the site to check for details.', function(status) {
  				                                                 logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New booking SMS sent [' + teamUser.phone + ']: ' + status);
  				                                                   });
  							                        	  
  							                        	  callback1();
  							                          }
  							                      }); 
  						                      });
  						                      
  					                      });  
  		                 			      
  		                 			    /*
  		                 			     * End of Sending Booking mail to Back office and Front Office
  		                 			     * 
  		                 			     */
  		                 			
  			                            /*
  			                             * Sending booking mail to the bookings ID
  			                             * 
  			                             */
  		                 			     var emailConfig = config.email_config('confirmedBooking');
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
  			                                    if (user) {
  			                                        var emailadmin = templates.booking_email_admin({first_name: 'Admin'}, room, space, booking, bookingsstartTime, bookingsendTime, roomType);
  			                                        //mailbooking.mailService(emailadmin, 'bookings@mymatchbox.in')
  			                                        mailbooking.mailService(emailadmin, user_email);
  			                                    } else {
  			                                        var emailadmin = templates.booking_email_admin_guestUser({first_name: 'Admin'}, room, space, booking, bookingsstartTime, bookingsendTime, roomType);
  			                                        //mailbooking.mailService(emailadmin, 'bookings@mymatchbox.in')
  			                                        mailbooking.mailService(emailadmin, user_email);
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
  			                             /*
  			                              * End of sending booking mails to bookings ID
  			                              * 
  			                              */
  			                        });
  		                        });
  		                    });
  	                    } else if(booking.scheduleTraining){
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
  			                    		
  			                    		ScheduleModel.load(scheduleObj, function (err, schedule) {
  			    	                        var currentAvail = schedule.currentAval;
  					                        
  				    				    	//var scheduleObjDate = new Date(scheduleObj.date);
  				    				    	var scheduleObjDate = new Date(currentAvail[0].startTime);
  				    				    	scheduleObjDate = scheduleObjDate.setMinutes(scheduleObjDate.getMinutes() - booking.timeZoneOffset);
  				    				    	scheduleObjDate = new Date(scheduleObjDate);
  				    				    	console.log(scheduleObjDate);
  			
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
  								               
  								            var bookingsEndTime = new Date(finalBookingEndTime);
  			    	                        
  			    	                        var index = scheduler.findBlockedSlot(currentAvail, bookingsStartTime, bookingsEndTime);
  			    	                        currentAvail.splice(index, 1);
  			    	                        schedule.currentAval = currentAvail;
  			    	                        schedule.save(function (err) {
  			    	                            if (err) {
  			    	                                return res.status(500).json({
  			    	                                    error: 'Cannot update the schedule'
  			    	                                });
  			    	                            }
  					                    		callback1();
  			    	                        });
  			    	                    });
  			                    	}, function(err) {
  			        					if(err) {
  			        						return res.status(500).json({
  			        							error: 'Error for success payment. ' + err
  			        						});
  			        					} 
  			        					done(null, booking);
  			        				});
  			                    	
  	                         }, function(booking, done){
  	                        	 
  	                        	 	var user = booking.user;
  		                            var room = booking.room;
  		                            var partner =booking.partner;
  		                            var space = booking.space;
  		                            RoomtypeModel.findOne({"_id": booking.room.roomtype}).exec(function (err, roomtypeObj) {
  		                                if (err) {
  		                                      return res.status(500).json({
  		                                    	  error: 'Cannot list the roomtypeObj'
  		                                      });
  		                                }
  		                                var roomType=roomtypeObj.name;
  		                                //res.redirect("/booking/success/trainingRoom?booking_id="+booking._id +"&nord");
  		                              res.json({
			                            	_id : bookedItem._id,
			                            	bookingConfirmationId : bookedItem.bookingConfirmationId
			                            });
  		                            
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
  		                             if(!user){
  		                             	 sms.send(guestUser.phone, 'Thank you for using mymatchbox! Your booking id (' + booking.bookingConfirmationId + ') is confirmed. An email has been forwarded to your registered email id.', function(status) {
  		                                      logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New booking SMS sent [' + guestUser.phone + ']: ' + status);
  		                                  });
  		                             	 var emailGuest = templates.booking_email_guest(guestUser, room,space,booking,bookingsstartTime,bookingsendTime,roomType)
  		                       			 mailbooking.mailService(emailGuest,guestUser.email)
  		                       			 var emailpartner = templates.booking_email_guest(partner, room,space,booking,bookingsstartTime,bookingsendTime,roomType)
  		                       			 mailbooking.mailService(emailpartner,partner.email)
  		                             }else{
  		                             	 sms.send(user.phone, 'Thank you for using mymatchbox! Your booking id (' + booking.bookingConfirmationId + ') is confirmed. An email has been forwarded to your registered email id.', function(status) {
  		                                      logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New booking SMS sent [' + user.phone + ']: ' + status);
  		                                  });
  		                             	 var email = templates.booking_email(user, room,space,booking,bookingsstartTime,bookingsendTime,roomType)
  		                       			 mailbooking.mailService(email,user.email)
  		                       			 var emailpartner = templates.booking_email(partner, room,space,booking,bookingsstartTime,bookingsendTime,roomType)
  		                       			 mailbooking.mailService(emailpartner,partner.email)
  		                             }
  		                            
  		                  			 /*
  		                  			  *  Sending Booking mail to Back office and Front Office 
  		                  			  */
  		              			      SpaceModel.findOne({_id: space._id}).populate('teams').exec(function (err, space) {
  				                          if(err) {
  				                        	  return res.json(err);
  				                          }
  					                      async.eachSeries(space.teams, function(teamObj, callback2) {
  						                      UserModel.findOne({_id: teamObj._id}).exec(function (err, teamUser) {
  						                          if(err) {
  						                        	  return res.json(err);	
  						                          }
  						                          else{
  						                        	  if(!user){
  						                        		  var emailTeam = templates.booking_email_guest(teamUser, room,space,booking,bookingsstartTime,bookingsendTime,roomType)
  								                   			mailbooking.mailService(emailTeam,teamUser.email)
  						                        	  }else{
  						                        		  var emailTeam = templates.booking_email(teamUser, room,space,booking,bookingsstartTime,bookingsendTime,roomType)
  								                   			mailbooking.mailService(emailTeam,teamUser.email)
  						                        	  }
  						                   			 sms.send(teamUser.phone, 'A new  booking(' + booking.bookingConfirmationId + ') has been done in your Space. Kindly login to the site to check for details.', function(status) {
  	                                              logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New booking SMS sent [' + teamUser.phone + ']: ' + status);
  	                                                });
  						                        	  callback2();
  						                          }
  						                      }); 
  					                      }, function(err) {
  					        					if(err) {
  					        						return res.status(500).json({
  					        							error: 'Error for space teams. ' + err
  					        						});
  					        					} 
  					        			  });
  					                      
  				                      });  
  	              			    
  	                                 /*if (!user) {
  	                                     var emailadmin = templates.booking_email_guest({first_name: 'Admin'}, room, space, booking, bookingsstartTime, bookingsendTime, roomType)
  	                                     mailbooking.mailService(emailadmin, 'bookings@mymatchbox.in')
  	                                 } else {
  	                                     var emailadmin = templates.booking_email({first_name: 'Admin'}, room, space, booking, bookingsstartTime, bookingsendTime, roomType)
  	                                     mailbooking.mailService(emailadmin, 'bookings@mymatchbox.in')
  	                                 }*/
  		              			    var emailConfig = config.email_config('confirmedBooking');
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
  		                                    if (user) {
  		                                        var emailadmin = templates.booking_email_admin({first_name: 'Admin'}, room, space, booking, bookingsstartTime, bookingsendTime, roomType);
  		                                        //mailbooking.mailService(emailadmin, 'bookings@mymatchbox.in')
  		                                        mailbooking.mailService(emailadmin, user_email);
  		                                    } else {
  		                                        var emailadmin = templates.booking_email_admin_guestUser({first_name: 'Admin'}, room, space, booking, bookingsstartTime, bookingsendTime, roomType);
  		                                        //mailbooking.mailService(emailadmin, 'bookings@mymatchbox.in')
  		                                        mailbooking.mailService(emailadmin, user_email);
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
  	 	                            
  	 	                        });
  	                         } ], function(err, result) {
  	             				if(err) {
  	             					return res.status(500).json({
  	             						error: 'Error while paying Hot desk. ' + err
  	             					});
  	             				} 
  	             				//res.json(result);
  	             			});
  	                    }
  	               }); // End of booking save
                  });
              });
            },


        /**
         * Failure of Payment
         */
      
        failurePayUMoney: function (req, res) {
            BookingModel.load(req.body.txnid, function (err, booking) {
                if (err) return next(err);
                var user = booking.user;
                booking.status='Failed';
                booking.isFaliedMerge= true;
                var counter = 0;
                booking.save(function (err, bookedItem) {
                    if (err) {
                        return res.status(500).json({
                            error: 'Cannot save the Booking'
                        });
                    }
                    var guestUser=booking.guestUser;
                    if(!user){

                    if(booking.bookingConfirmationId.length > 13){
						sms.send(guestUser.phone, 'Your booking has been cancelled. An email has been forwarded to your registered email id.', function(status) {
							logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New failure booking SMS sent [' + guestUser.phone + ']: ' + status);
                        });
					}

                   	 // sms.send(guestUser.phone, 'Thank you for using mymatchbox! Your booking id (' + booking.bookingConfirmationId + ') is confirmed. An email has been forwarded to your registered email id.', function(status) {
                     //        logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New booking SMS sent [' + guestUser.phone + ']: ' + status);
                     //    });
                   }
                   else{


                   	if(booking.bookingConfirmationId.length > 13){
						sms.send(user.phone, 'Your booking has been cancelled. An email has been forwarded to your registered email id.', function(status) {
							logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New failure booking SMS sent [' + user.phone + ']: ' + status);
                        });
					}
                   	 // sms.send(user.phone, 'Thank you for using mymatchbox! Your booking id (' + booking.bookingConfirmationId + ') is confirmed. An email has been forwarded to your registered email id.', function(status) {
                     //        logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New booking SMS sent [' + user.phone + ']: ' + status);
                     //    });
                   }
                    
                    notify.addNotificationForBooking('Payment Failed', 'Payment failed for: '+ booking.bookingConfirmationId + '.'  + 'Click here for more details', booking , '/admin/bookings');
	                    
                    if(booking.schedule){
                    	ScheduleModel.load(booking.schedule, function (err, schedule) {
	                        var currentAvail=schedule.currentAval;
	                        var index = scheduler.findBlockedSlot(currentAvail, booking.bookingStartTime, booking.bookingEndTime);
	                        currentAvail[index].isBlocked = false;
	                        currentAvail = scheduler.mergeAllSlot(currentAvail);
	                        schedule.currentAval = currentAvail;
	                        schedule.save(function (err) {
	                            if (err) {
	                                return res.status(500).json({
	                                    error: 'Cannot update the schedule'
	                                });
	                            }
	                            var guestUser=booking.guestUser;
	                            if(!user){
	                            	var emailGuest = templates.booking_failure_email_guest(guestUser,booking)
		                 			mailbooking.mailService(emailGuest,guestUser.email)
	                            }else{
	                            	var email = templates.booking_failure_email(user,booking)
		                 			mailbooking.mailService(email,user.email)
	                            }
	                            res.redirect("/booking/failed?booking_id="+booking._id +"&nord");
	                        });
	                    });
                    } else {
                      	async.eachSeries(booking.scheduleTraining, function(scheduleObj, callback1) {
                      		counter++;
                      		ScheduleModel.load(scheduleObj, function (err, schedule) {
    	                        var currentAvail=schedule.currentAval;
    	                        
    	                        var scheduleObjDate = new Date(currentAvail[0].startTime);
    					    	scheduleObjDate = scheduleObjDate.setMinutes(scheduleObjDate.getMinutes() - booking.timeZoneOffset);
    					    	scheduleObjDate = new Date(scheduleObjDate);
    					    	
    					    	// Using 'scheduler' 'customizeTimeForDate'
    					    	var offsetStartTime = new Date(scheduler.customizeTimeForDate(scheduleObjDate, booking.startTime));
    					    	offsetStartTime = offsetStartTime.setMinutes(offsetStartTime.getMinutes() + booking.timeZoneOffset);
    					    	var startDateTime = new Date(offsetStartTime);
    					    	
    					    	var offsetEndTime = new Date(scheduler.customizeTimeForDate(scheduleObjDate, booking.endTime));
    					    	offsetEndTime = offsetEndTime.setMinutes(offsetEndTime.getMinutes() + booking.timeZoneOffset);
    					    	var endDateTime = new Date(offsetEndTime);
    					    	
    					    	var bookingStart = stringToTimeStamp(startDateTime);
    					    	var bookingEnd = stringToTimeStamp(endDateTime);
    					    	
    	                        var index = scheduler.findBlockedSlot(currentAvail, bookingStart, bookingEnd);
    	                        
    	                        console.log(index);
    	                        if(index){
    	                        	currentAvail[index].isBlocked = false;    	                        	
    	                        }
    	                        currentAvail = scheduler.mergeAllSlot(currentAvail);
    	                        schedule.currentAval = currentAvail;
    	                        schedule.save(function (err) {
    	                            if (err) {
    	                                return res.status(500).json({
    	                                    error: 'Cannot update the schedule'
    	                                });
    	                            }
    	                            if(counter === booking.scheduleTraining.length){
    	                            	 var guestUser=booking.guestUser;
    	 	                            if(!user){
    	 	                            	var emailGuest = templates.booking_failure_email_guest(guestUser,booking)
    	 		                 			mailbooking.mailService(emailGuest,guestUser.email)
    	 	                            }else{
    	 	                            	var email = templates.booking_failure_email(user,booking)
    	 		                 			mailbooking.mailService(email,user.email)
    	 	                            }
	    	                            res.redirect("/booking/failed?booking_id="+booking._id +"&nord");
    	                            }
    	                            callback1();
    	                        });
    	                    });
                      	}, function(err) {
        					if(err) {
        						return res.status(500).json({
        							error: err
        						});
        					}
        					
        				});
                    }
                });
            });
        },
        
        failurePayUMoneyMobile: function (req, res) {
            BookingModel.load(req.body.txnid, function (err, booking) {
                if (err) return next(err);
                var user = booking.user;
                booking.status='Failed';
                booking.isFaliedMerge= true;
                var counter = 0;
                booking.save(function (err, bookedItem) {
                    if (err) {
                        return res.status(500).json({
                            error: 'Cannot save the Booking'
                        });
                    }
                    
                    var guestUser=booking.guestUser;
                   //  if(!user){
                   // 	 sms.send(guestUser.phone, 'Thank you for using mymatchbox! Your booking id (' + booking.bookingConfirmationId + ') is confirmed. An email has been forwarded to your registered email id.', function(status) {
                   //          logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New booking SMS sent [' + guestUser.phone + ']: ' + status);
                   //      });
                   // }else{
                   // 	 sms.send(user.phone, 'Thank you for using mymatchbox! Your booking id (' + booking.bookingConfirmationId + ') is confirmed. An email has been forwarded to your registered email id.', function(status) {
                   //          logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New booking SMS sent [' + user.phone + ']: ' + status);
                   //      });
                   // }

                   if(!user){

                    if(booking.bookingConfirmationId.length > 13){
						sms.send(guestUser.phone, 'Your booking has been cancelled. An email has been forwarded to your registered email id.', function(status) {
							logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New failure booking SMS sent [' + guestUser.phone + ']: ' + status);
                        });
					}
                   }
                   else{


                   	if(booking.bookingConfirmationId.length > 13){
						sms.send(user.phone, 'Your booking has been cancelled. An email has been forwarded to your registered email id.', function(status) {
							logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New failure booking SMS sent [' + user.phone + ']: ' + status);
                        });
					}
                   }
                    
                    notify.addNotificationForBooking('Payment Failed', 'Payment failed for: '+ booking.bookingConfirmationId + '.'  + 'Click here for more details', booking , '/admin/bookings');
	                    
                    if(booking.schedule){
                    	ScheduleModel.load(booking.schedule, function (err, schedule) {
	                        var currentAvail=schedule.currentAval;
	                        var index = scheduler.findBlockedSlot(currentAvail, booking.bookingStartTime, booking.bookingEndTime);
	                        currentAvail[index].isBlocked = false;
	                        currentAvail = scheduler.mergeAllSlot(currentAvail);
	                        schedule.currentAval = currentAvail;
	                        schedule.save(function (err) {
	                            if (err) {
	                                return res.status(500).json({
	                                    error: 'Cannot update the schedule'
	                                });
	                            }
	                            var guestUser=booking.guestUser;
	                            if(!user){
	                            	var emailGuest = templates.booking_failure_email_guest(guestUser,booking)
		                 			mailbooking.mailService(emailGuest,guestUser.email)
	                            }else{
	                            	var email = templates.booking_failure_email(user,booking)
		                 			mailbooking.mailService(email,user.email)
	                            }
	                            res.redirect("/booking/failed?booking_id="+booking._id +"&nord");
	                        });
	                    });
                    } else {
                      	async.eachSeries(booking.scheduleTraining, function(scheduleObj, callback1) {
                      		counter++;
                      		ScheduleModel.load(scheduleObj, function (err, schedule) {
    	                        var currentAvail=schedule.currentAval;
    	                        
    	                        var scheduleObjDate = new Date(currentAvail[0].startTime);
    					    	scheduleObjDate = scheduleObjDate.setMinutes(scheduleObjDate.getMinutes() - booking.timeZoneOffset);
    					    	scheduleObjDate = new Date(scheduleObjDate);
    					    	
    					    	// Using 'scheduler' 'customizeTimeForDate'
    					    	var offsetStartTime = new Date(scheduler.customizeTimeForDate(scheduleObjDate, booking.startTime));
    					    	offsetStartTime = offsetStartTime.setMinutes(offsetStartTime.getMinutes() + booking.timeZoneOffset);
    					    	var startDateTime = new Date(offsetStartTime);
    					    	
    					    	var offsetEndTime = new Date(scheduler.customizeTimeForDate(scheduleObjDate, booking.endTime));
    					    	offsetEndTime = offsetEndTime.setMinutes(offsetEndTime.getMinutes() + booking.timeZoneOffset);
    					    	var endDateTime = new Date(offsetEndTime);
    					    	
    					    	var bookingStart = stringToTimeStamp(startDateTime);
    					    	var bookingEnd = stringToTimeStamp(endDateTime);
    					    	
    	                        var index = scheduler.findBlockedSlot(currentAvail, bookingStart, bookingEnd);
    	                        
    	                        console.log(index);
    	                        if(index){
    	                        	currentAvail[index].isBlocked = false;    	                        	
    	                        }
    	                        currentAvail = scheduler.mergeAllSlot(currentAvail);
    	                        schedule.currentAval = currentAvail;
    	                        schedule.save(function (err) {
    	                            if (err) {
    	                                return res.status(500).json({
    	                                    error: 'Cannot update the schedule'
    	                                });
    	                            }
    	                            if(counter === booking.scheduleTraining.length){
    	                            	 var guestUser=booking.guestUser;
    	 	                            if(!user){
    	 	                            	var emailGuest = templates.booking_failure_email_guest(guestUser,booking)
    	 		                 			mailbooking.mailService(emailGuest,guestUser.email)
    	 	                            }else{
    	 	                            	var email = templates.booking_failure_email(user,booking)
    	 		                 			mailbooking.mailService(email,user.email)
    	 	                            }
	    	                            res.redirect("/booking/failed?booking_id="+booking._id +"&nord");
    	                            }
    	                            callback1();
    	                        });
    	                    });
                      	}, function(err) {
        					if(err) {
        						return res.status(500).json({
        							error: err
        						});
        					}
        					
        				});
                    }
                });
            });
        },

        /**
         * Cancel of Payment
         */
        cancelPayUMoney: function (req, res) {
            BookingModel.load(req.body.txnid, function (err, booking) {
                if (err) return next(err);
                booking.status='Cancelled';
                booking.save(function (err, bookedItem) {
                    if (err) {
                        return res.status(500).json({
                            error: 'Cannot save the Booking'
                        });
                    }
                    
                    var guestUser=booking.guestUser;
                   //  if(!user){
                   // 	 sms.send(guestUser.phone, 'Thank you for using mymatchbox! Your booking id (' + booking.bookingConfirmationId + ') is confirmed. An email has been forwarded to your registered email id.', function(status) {
                   //          logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New booking SMS sent [' + guestUser.phone + ']: ' + status);
                   //      });
                   // }else{
                   // 	 sms.send(user.phone, 'Thank you for using mymatchbox! Your booking id (' + booking.bookingConfirmationId + ') is confirmed. An email has been forwarded to your registered email id.', function(status) {
                   //          logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New booking SMS sent [' + user.phone + ']: ' + status);
                   //      });
                   // }

                   if(!user){

                    if(booking.bookingConfirmationId.length > 13){
						sms.send(guestUser.phone, 'Your booking has been cancelled. An email has been forwarded to your registered email id.', function(status) {
							logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New failure booking SMS sent [' + guestUser.phone + ']: ' + status);
                        });
					}
                   }
                   else{


                   	if(booking.bookingConfirmationId.length > 13){
						sms.send(user.phone, 'Your booking has been cancelled. An email has been forwarded to your registered email id.', function(status) {
							logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New failure booking SMS sent [' + user.phone + ']: ' + status);
                        });
					}
                   }
                    
                    notify.addNotificationForBooking('Room is Booked', 'Booking done with Id : '+ booking.bookingConfirmationId, booking ,'/iui');
                    ScheduleModel.load(booking.schedule, function (err, schedule) {
                        var currentAvail=schedule.currentAval;
                        var index = scheduler.findBlockedSlot(currentAvail, booking.bookingStartTime, booking.bookingEndTime);
                        currentAvail[index].isBlocked = false;
                        currentAvail = scheduler.mergeAllSlot(currentAvail);
                        schedule.currentAval = currentAvail;
                        schedule.save(function (err) {
                            if (err) {
                                return res.status(500).json({
                                    error: 'Cannot update the schedule'
                                });
                            }
                            res.redirect("/booking/failed?booking_id="+booking._id +"&nord");
                        });
                    });
                });
            });
        }

    };
}