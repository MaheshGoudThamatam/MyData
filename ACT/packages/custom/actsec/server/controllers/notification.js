'use strict';

require('../../../socket/server/models/socket.js');
require('../models/notification.js');

var mongoose = require('mongoose'),
    NotificationModel = mongoose.model('Notification'),
    SocketModel = mongoose.model('Socket'),
    configuration = require('../../../../custom/actsec/server/config/config.js');
var _ = require('lodash');
var async = require('async');
var event = require('../../event.js');
var UserModel = mongoose.model('User');

module.exports = function(actsec, io) {

    var notify = function(title, icon, link, userId, callback) {
        NotificationModel.addNotif(title, icon, link, userId, function(err, notif) {
            if (err) {
                callback(err, null);
            } else {
                if (notif) {
                    SocketModel.getUserSockets(userId, function(err, socks) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (socks) {
                                async.each(socks, function(sock, asyncCallback) {
                                    event.emit('notify', sock.socketId, notif);
                                    asyncCallback();
                                }, function(err) {
                                    callback();
                                });
                            } else {
                                callback();
                            }
                        }
                    });
                } else {
                    callback();
                }
            }
        });
    };

    var notifyRole = function(title, icon, link, roleId,companyId,callback) {
    	var query = {};
    	if(roleId == configuration.roles.SUPER_ADMIN){
    		query={
    				role: roleId	
    		};
    	}else{
    		query={
    				role: roleId,
    				company:companyId
    		};
    	}
        UserModel.find(query, function(err, users) {
            if (err) {
                callback(err, null);
            } else {
                if (users) {
                    async.eachSeries(users, function(user, userCB) {
                        NotificationModel.addNotif(title, icon, link, user._id, function(err, notif) {
                            if (err) {
                                userCB(err, null);
                            } else {
                                if (notif) {
                                    SocketModel.getUserSockets(user._id, function(err, socks) {
                                        if (err) {
                                            userCB(err, null);
                                        } else {
                                            if (socks) {
                                                async.each(socks, function(sock, asyncCallback) {
                                                    event.emit('notify', sock.socketId, notif);
                                                    asyncCallback();
                                                }, function(err) {
                                                    userCB();
                                                });
                                            } else {
                                                userCB();
                                            }
                                        }
                                    });
                                } else {
                                    userCB();
                                }
                            }
                        });
                    }, function(err) {
                        callback(err, null);
                    });
                }
            }
        });
    };

    return {

        notif: function(req, res, next, id) {
            req.notifId = id;
            next();
        },

        /**
         * List of Roles
         */
        all: function(req, res) {
            NotificationModel.getUserNotifs(req.user._id, function(err, notifs) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot fetch notifications'
                    });
                } else {
                    if (notifs) {
                        res.json(notifs);
                    } else {
                        res.json([]);
                    }
                }
            });
        },

        allNotify: function(req, res) {
        	
        	var perPage = parseInt(req.query.perPage);
			var page = req.query.page > 0 ? req.query.page : 0;
			var skipCount = parseInt(perPage * page);
			
            NotificationModel.getAllUserNotifs(req.user._id,perPage,skipCount, function(err, allnotify) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot fetch notifications'
                    });
                } else {
                    res.json(allnotify);
                }
            });
        },

        notify: notify,

        notifyRole: notifyRole,

        notifyRead: function(req, res) {
            NotificationModel.markRead(req.notifId, function(err, notif) {
                if (err) {
                    return res.status(500).json(err);
                } else {
                    return res.status(200).json({
                        status: 'success'
                    });
                }
            });
        },

        notifyReadAll: function(req, res) {
            NotificationModel.markAllRead(req.user._id, function(err, data) {
                if(err) {
                    return res.status(500).json(err);
                } else {
                    return res.status(200).json({
                        status: 'success'
                    });
                }
            });
        }
    }
};