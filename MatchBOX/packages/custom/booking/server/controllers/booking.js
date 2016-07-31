'use strict';

/**
 * Module dependencies.
 */
require('../../../../core/users/server/models/user.js');
require('../../../rooms/server/models/rooms.js');
require('../../../search/server/models/search.js');
//var notify = require('../../../notification/server/controllers/notify.js');

var mongoose = require('mongoose'),
    BookingModel = mongoose.model('Booking'),
    UserModel = mongoose.model('User'),
    RoomsSchemaModel = mongoose.model('Rooms'),
    ScheduleModel = mongoose.model('Schedule'),
    nodemailer = require('nodemailer'),
    templates = require('../template'),
    config = require('meanio').loadConfig(),
    async = require('async'),
    _ = require('lodash'),
    payumoney=require('./payumoney.js'),
    scheduler=require('./scheduler.js');

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

function sendMailTemplate(actor, room,space) {
    var mailOptions = {
        to: [actor.email],
        from: config.emailFrom
    };
    mailOptions = templates.booking_email(actor, room,space, mailOptions);
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


module.exports = function (Booking) {

    return {

        /**
         * Find Booking by id
         */
        booking: function (req, res, next, id) {
            BookingModel.load(id, function (err, booking) {
                if (err) return next(err);
                if (!booking) return next(new Error('Failed to load booking ' + id));
                req.booking = booking;
                next();
            });
        },
        user: function (req, res, next, id) {
            UserModel.findOne({
                _id: id
            }).exec(function (err, user) {
                if (err) return next(err);
                if (!user) return next(new Error('Failed to load User ' + id));
                req.user = user;
                next();
            });
        },
        room: function (req, res, next, id) {
            RoomsSchemaModel.load(id, function (err, room) {
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
        schedule: function (req, res, next, id) {
            ScheduleModel.load(id, function (err, schedule) {
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

        create: function (req, res) {
            var user = req.user;
            var room = req.body.room;
            var partner = req.body.room.spaceId.partner;
            var schedule = req.body.schedule;
            var currentAvail = schedule.currentAval;
            var bookingStart = stringToTimeStamp(req.body.bookingStartTime);
            var bookingEnd = stringToTimeStamp(req.body.bookingEndTime);
            req.body.bookingStartTimeNumber = bookingStart;
            req.body.bookingEndTimeNumber = bookingEnd;
            req.body.day = req.body.schedule.day;
            var index = scheduler.findSlot(currentAvail, bookingStart, bookingEnd, schedule.isAllday);
            if (index >= 0) {
            	var bookingEndHour=new Date(bookingEnd);
                var bookingEndHourTwo= new Date(bookingEndHour);
                bookingEndHourTwo.setMinutes ( bookingEndHour.getMinutes() + 60 );
                var bookingEndTimeFinal =stringToTimeStamp(bookingEndHourTwo);
                 var splittedSlot = scheduler.splitSlot(currentAvail[index], bookingStart, bookingEndTimeFinal);
                currentAvail.splice(index, 1);
                for (var i = splittedSlot.length - 1; i >= 0; i--) {
                    currentAvail.splice(index, 0, splittedSlot[i])
                }
                var scheduleOne = req.schedule;
                scheduleOne.currentAval = currentAvail;
                scheduleOne.save(function (err) {
                    if (err) {
                        return res.status(500).json({
                            error: 'Cannot update the schedule'
                        });
                    }
                });


                //saving guest user and booking creating user object
                async.waterfall([
                    function (done) {
                        if (user == undefined) {
                            req.body.guest.isGuest = true;
                            var guestUser = new UserModel(req.body.guest);
                            guestUser.save(function (err, userGuest) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    done(null, userGuest);
                                }
                            });

                        }
                        else {
                            done(null, user);
                        }

                    },
                    function (user, done) {
                        req.body.user = user;
                        var booking = new BookingModel(req.body);
                        booking.save(function (err, bookedItem) {
                            if (err) {
                                return res.status(500).json({
                                    error: 'Cannot save the Booking'
                                });
                            }
                            //res.json(bookedItem);
                            var data =payumoney.getPayUMoneyPayload(booking,user);
                            
                            //notify.addNotificationForBooking('Room is Booked', 'Booking done with Id : '+ booking._id, booking);
                            res.json(data);
                            done();
                        });
                    }
                ], function (err) {
                	console.log(err);
                });

            } else {
                return res.status(500).json({
                    error: 'Slot already booked'
                });
            }

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
        	console.log(req.body);
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

        loadSchedule: function (req, res) {
        	console.log(req.query);
            var roomId = req.query.roomId;
            var selecteddate = new Date(req.query.selectdate);
            var str = selecteddate.toISOString().substr(0, 10);
            str = str + "T00:00:00.000Z";
            var str1 = str.replace(/00:00:00.000/, '23:59:59.000');
            ScheduleModel.findOne({$and: [
                {"room": roomId},
                {"date": {$gte: new Date(str)}},
                {"date": {$lte: new Date(str1)}}
            ]}).exec(function (err, bookingAvailabilitySchedules) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the bookingAvailabilitySchedules'
                    });
                }
                else {

                    res.send(bookingAvailabilitySchedules);
                }
            });
        },

        loadPartnerBookings: function (req, res) {
            var user = req.query.partner;
            BookingModel.find({"partner": user}).populate('user').populate('space').populate('partner').populate('room').exec(function (err, partnerBookings) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the partnerBookings'
                    });
                }
                res.json(partnerBookings);
            });
        },
        
        loadUserBookings: function (req, res) {
            var user = req.query.user;
            BookingModel.find({"user": user}).populate('user').populate('space').populate('partner').populate('room').exec(function (err, userBookings) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the userBookings'
                    });
                }
                res.json(userBookings);
            });
        },
        loadBookedSchedules:function(req,res){
            if(req.query.bookedRoom){
                var bookedRoom = req.query.bookedRoom;
             }else{
                  var bookedRoom = 'undefined';
             }
            BookingModel.find({room : req.query.bookedRoom}).populate("room").populate("space").exec(function (err, bookedRooms) {
                 if (err) {
                     return res.status(500).json({
                         error: 'Cannot list the bookedRoom'
                     });
                 }
                 res.json(bookedRooms);
             });
        	
        },
        loadRequiredRoomType:function (req, res) {
            var roomType = req.query.RoomType;
            var user =req.query.logUserPartner;
            var myresult=[];
            UserModel.findOne({"_id": user}).exec(function (err, userobject) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the  RoomTypes'
                    });
                }
                else
                	{
                	var userCommission=userobject.commissionPercentage;
                	async.each(userCommission, function(commisionobject, callbackroomTypes) {
                        if(commisionobject._id == roomType)
                        	{
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
        loadRequiredUser:function(req,res){
             var user =req.query.userId;
             UserModel.findOne({"email": user}).exec(function (err, requireduserobject) {
                 if (err) {
                     return res.status(500).json({
                         error: 'Cannot list the  RoomTypes'
                     });
                 }
                 else
                 	{
                 	res.send(requireduserobject);
                 	}
                 
                
             });
        },
        
        //Back Office booking
        backOfficeBookingCreate:function(req,res){
        	  var user = req.body.user;
              var room = req.body.room;
              var space=req.body.space;
             var partner = req.body.partner;
              var schedule = req.body.schedule;
              var currentAvail = schedule.currentAval;
              var bookingStart = stringToTimeStamp(req.body.bookingStartTime);
              var bookingEnd = stringToTimeStamp(req.body.bookingEndTime);
              req.body.bookingStartTimeNumber = bookingStart;
              req.body.bookingEndTimeNumber = bookingEnd;
              req.body.day = req.body.schedule.day;
           //   req.body.user=user;
              var index = scheduler.findSlot(currentAvail, bookingStart, bookingEnd, schedule.isAllday);
              if (index >= 0) {
              	var bookingEndHour=new Date(bookingEnd);
                  var bookingEndHourTwo= new Date(bookingEndHour);
                  bookingEndHourTwo.setMinutes ( bookingEndHour.getMinutes() + 60 );
                  var bookingEndTimeFinal =stringToTimeStamp(bookingEndHourTwo);
                   var splittedSlot = scheduler.splitSlot(currentAvail[index], bookingStart, bookingEndTimeFinal);
                  currentAvail.splice(index, 1);
                  for (var i = splittedSlot.length - 1; i >= 0; i--) {
                      currentAvail.splice(index, 0, splittedSlot[i])
                  }
                  var scheduleOne = req.schedule;
                  scheduleOne.currentAval = currentAvail;
                  scheduleOne.save(function (err) {
                      if (err) {
                          return res.status(500).json({
                              error: 'Cannot update the schedule'
                          });
                      }
                  });
                  var indexOne=scheduler.findBlockedSlot(currentAvail, bookingStart, bookingEnd);
                  currentAvail.splice(indexOne,1);
                  scheduleOne.currentAval=currentAvail;
                scheduleOne.save(function (err) {
                    if (err) {
                        return res.status(500).json({
                            error: 'Cannot update the schedule'
                        });
                    }
                });
                //saving guest user and booking creating user object
                async.waterfall([
                    function (done) {
                        if (user == undefined) {
                            req.body.guest.isGuest = true;
                            var guestUser = new UserModel(req.body.guest);
                            guestUser.save(function (err, userGuest) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    done(null, userGuest);
                                }
                            });

                        }
                        else {
                            done(null, user);
                        }

                    },
                    function (user, done) {
                        req.body.user = user;
                        var booking = new BookingModel(req.body);
                        booking.save(function (err, bookedItem) {
                            if (err) {
                                return res.status(500).json({
                                    error: 'Cannot save the Booking'
                                });
                            }
                            res.json(bookedItem);
                            sendMailTemplate(user, room,space);
                           // var data =payumoney.getPayUMoneyPayload(booking,user);
                            //res.json(data);
                            done();
                        });
                    }
                ], function (err) {
                });
                  
              } else {
                  return res.status(500).json({
                      error: 'Slot already booked please select another'
                  });
              }
        },
        
        
        //load closed schedules
        loadClosedSchedule:function(req,res){
        	ScheduleModel.find({isClosed:'True'}).exec(function (err, schedules) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the schedules'
                    });
                }
                res.json(schedules);
            });
        }
        
        
        

    };
}