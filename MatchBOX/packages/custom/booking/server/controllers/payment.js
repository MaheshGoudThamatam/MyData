'use strict';

/**
 * Module dependencies.
 */

var notify = require('../../../notification/server/controllers/notify.js');

var mongoose = require('mongoose'),
    config = require('meanio').loadConfig(),
    async = require('async'),
    BookingModel = mongoose.model('Booking'),
    ScheduleModel = mongoose.model('Schedule'),
    _ = require('lodash'),
    scheduler=require('./scheduler.js'),
    nodemailer = require('nodemailer'),
    templates = require('../template'),
    notify=require('../../../notification/server/controllers/notify.js'),
    config = require('meanio').loadConfig();

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

function sendMailTemplate(actor, room,space,booking) {
    var mailOptions = {
        to: [actor.email],
        from: config.emailFrom
    };
    mailOptions = templates.booking_email(actor, room,space,booking,mailOptions);
    sendMail(mailOptions);
}

module.exports = function (Payment) {
    /**
     * Success of Payment
     */
    return {

        successPayUMoney: function (req, res) {
            BookingModel.load(req.body.txnid, function (err, booking) {
                if (err) return next(err);
                booking.status='Confirm';
                booking.payUMoneyId=req.body.payuMoneyId;
                booking.save(function (err, bookedItem) {
                    if (err) {
                        return res.status(500).json({
                            error: 'Cannot save the Booking'
                        });
                    }

                    notify.addNotificationForBooking('Room is Booked', 'Booking done with Id : '+ booking._id, booking);
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
                            res.redirect("/booking/success?booking_id="+booking._id +"&nord");
                            sendMailTemplate(user, room,space,booking);
                            console.log(booking);
                            sendMailTemplate(partner,room,space,booking);
                        });
                    });

                });
            });
        },


        /**
         * Failure of Payment
         */
        failurePayUMoney: function (req, res) {
            BookingModel.load(req.body.txnid, function (err, booking) {
                if (err) return next(err);
                booking.status='Failed';
                booking.save(function (err, bookedItem) {
                    if (err) {
                        return res.status(500).json({
                            error: 'Cannot save the Booking'
                        });
                    }
                    
                    notify.addNotificationForBooking('Room is Booked', 'Booking done with Id : '+ booking._id, booking);
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
                    
                    notify.addNotificationForBooking('Room is Booked', 'Booking done with Id : '+ booking._id, booking);
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