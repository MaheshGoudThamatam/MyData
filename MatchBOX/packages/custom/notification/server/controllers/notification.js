'use strict';

/**
 * Module dependencies.
 */
require('../../../../core/users/server/models/user.js');
require('../../../rooms/server/models/rooms.js');
require('../../../search/server/models/search.js');
var mongoose = require('mongoose'),
    NotificationModel = mongoose.model('Notification'),
    UserModel = mongoose.model('User'),
    nodemailer = require('nodemailer'),
    config = require('meanio').loadConfig(),
    async = require('async'),
    _ = require('lodash');

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

function sendMailTemplate(actor, room) {
    var mailOptions = {
        to: [actor.email],
        from: config.emailFrom
    };
    mailOptions = templates.booking_email(actor, room, mailOptions);
    sendMail(mailOptions);
}


module.exports = function (Notification) {

    return {
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
        notification: function (req, res, next, id) {
            NotificationModel.findOne({
                _id: id
            }).exec(function (err, notification) {
                if (err) return next(err);
                if (!notification) return next(new Error('Failed to load User ' + id));
                req.notification = notification;
                next();
            });
        },

        getAllUserNotification: function (req, res) {
        	var query = {
        		$in : [req.user._id]
        	};
            NotificationModel.loadByUser(query, function (err, notifications) {
                res.json(notifications);
            });
        },

        getActiveUserNotification: function (req, res) {
        	var query = {
        		$in : [req.user._id]
        	};
            NotificationModel.loadActiveByUser(query, function (err, notifications) {
                res.json(notifications);
            });
        },
        
        showNotification: function (req, res) {
            req.notification.isRead = true;
            req.notification.save(function (err, notification) {
                if (err) {
                    console.log(err);
                }
                res.json(notification);
            });
        },
        
        create: function (req, res) {
            var notification = new NotificationModel(req.body);
            notification.save(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot update the Booking'
                    });
                }

                res.json(notification);
            });
        },
    };
}