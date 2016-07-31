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
      config = require('meanio').loadConfig(),
 	_ = require('lodash');

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
        create: function (req, res) {
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