'use strict';

/**
 * Module dependencies.
 */
 require('../../../booking/server/models/booking.js');
var mongoose = require('mongoose'),
    BookingModel = mongoose.model('Booking'),
    AttendeeModel= mongoose.model('Attendee'),
    nodemailer = require('nodemailer'), 
    templates = require('../template'), 
    async = require('async'),
    Mailgen = require('mailgen'),
    mail = require('../../../../core/system/server/services/mailService.js'),
    config = require('meanio').loadConfig(),
 	_ = require('lodash');

var logger = require('../../../../core/system/server/controllers/logs.js');
var sms = require('../../../../core/system/server/controllers/sms.js');

/**
 * Send email to attendees
 */
function sendMail(mailOptions) {
    var transport = nodemailer.createTransport(config.mailer);
    transport.sendMail(mailOptions, function(err, response) {
        if (err) return err;
        return response;
    });
}

 module.exports = function (Booking) {

    return {

        /**
         * Find Booking by id
         */
        booking: function (req, res, next, id) {
        	BookingModel.populate("room").load(id, function (err, booking) {
                if (err) return next(err);
                if (!booking) return next(new Error('Failed to load holiday ' + id));
                req.booking = booking;
                next();
            });
        },
         attendee: function(req, res, next, id) {
            AttendeeModel.findOne({
                _id: id
            }).exec(function(err, attendee) {
                if (err) return next(err);
                if (!attendee) return next(new Error('Failed to load attendee ' + id));
                req.attendee = attendee;
                next();
            });
        },
        /**
         * Create an attendee
         */
        /*create: function (req, res) {
    		//var booking = new BookingModel(req.body);
            var attendee=new AttendeeModel(req.body);
            attendee.save(function (err) {
                 if (err) {
                     return res.status(500).json({
                         error: 'Cannot save the attendee'
                     });
                 }
                 var mailOptions = {
                            to: attendee.email,
                            from: config.emailFrom
                        };
                          mailOptions = templates.attendee_email(attendee,req,room,space,booking,mailOptions);
                          sendMail(mailOptions);  
                 res.json(attendee);
             });
        },*/
        
        create: function (req, res) {
        	var attendees=req.body;
           // var attendee=new AttendeeModel(req.body);
        	async.each(attendees, function (attendee, callback) {

                var attendeePerson = {
                    name: attendee.name,
                    email: attendee.email,
                    phoneNumber:attendee.phoneNumber,
                    booking:attendee.booking,
                    isNew: true
                };
                var attendeeRequired=new AttendeeModel(attendeePerson);
                attendeeRequired.save(function (err) {
                    if (err) {
                        return res.status(500).json({
                            error: 'Cannot save the attendee'
                        });
                    }
                    else{
                    	
                    	BookingModel.findOne({"_id":attendeeRequired.booking}).populate("space").populate("room").populate("user").exec(function (err, bookingObj) {
                             if (err) {
                                   return res.status(500).json({
                                   error: 'Cannot list the booking'
                            });
                       }
                             var booking=bookingObj;
                             var room=bookingObj.room;
                             var space=bookingObj.space;
                          /*var mailOptions = {
                               to: attendeeRequired.email,
                               from: config.emailFrom
                           };
                             mailOptions = templates.attendee_email(attendeeRequired,req,room,space,booking,mailOptions);
                             sendMail(mailOptions);  */
                             console.log(attendeeRequired);
                             console.log(booking);
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
                             var email = templates.attendee_email(attendeeRequired,req,room,space,booking,bookingsstartTime,bookingsendTime);
                  			mail.mailService(email,attendeeRequired.email);

                            sms.send(attendeeRequired.phoneNumber, 'Hello ' + attendeeRequired.name + ', ' + booking.user.first_name + ' has invited you for a meeting. Please click on the link below for more details', function(status) {
                                logger.log('info', 'POST ' + req._parsedUrl.pathname + ' New booking SMS sent [' + attendeeRequired.phoneNumber + ']: ' + status);
                            });
                            
                    	 });
                    }
                             
                });
                res.send(attendeeRequired);
                
          });
            
        },
        
        
        /**
         * Update an attendee
         */
        update: function (req, res) {
            var attendee = req.attendee;
            attendee = _.extend(attendee, req.body);
            attendee.save(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot update the attendee'
                    });
                }

                res.json(attendee);
            });
        },
        
        /**
         * Delete a attendee
         */
        destroy: function (req, res) {
            var attendee = req.attendee;
            
            attendee.remove(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete the attendee'
                    });
                }

                res.json(attendee);
            });
        },
        
        /**
         * Show an attendee
         */
        show: function (req, res) {
            res.json(req.attendee);
        },
        
        /**
         * List of holiday
         */
        all: function (req, res) {
        	AttendeeModel.find().exec(function (err, attendees) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the attendees'
                    });
                }
                res.json(attendees);
            });
        },
        
      //Load attendees based on booking
        loadAttendees:function(req,res){
        	 var requiredBooking =req.query.booking;
        	AttendeeModel.find({"booking":requiredBooking}).exec(function (err, attendees) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the attendees'
                    });
                }
                res.json(attendees);
            });
        }
        
        
    };
}