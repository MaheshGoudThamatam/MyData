'use strict';

require('../../../../core/users/server/models/user.js');
require('../../../role/server/models/role.js');
require('../../../notification/server/models/notification.js');
require('../../../space/server/models/space.js');
var mongoose = require('mongoose'),
    UserModel = mongoose.model('User'),
    RoleModel = mongoose.model('Role'),
    SpaceModel = mongoose.model('Space'),
    NotificationModel = mongoose.model('Notification'),
    nodemailer = require('nodemailer'),
    config = require('meanio').loadConfig(),
    async = require('async'),
    _ = require('lodash');

module.exports = {
    
	addNotification: function (title,description,user) {
        var notification={
            title: title,
            description: description,
            user: user,
            isRead: false,
        };
        var notificationObj = new NotificationModel(notification);
        notificationObj.save(function (err) {
            if (err) {
                console.log(err);
            }
        });
    },
    
    addNotificationForBooking : function (title, description, booking) {
    	var notifyingUsers = [];
    	var counter = 0;
    	var thisFunction = this;
    	//notifyingUsers.push(booking.partner);
    	thisFunction.addNotification(title, description, booking.partner);
    	var query = {};
    	query = {
    		'name': new RegExp('^' + 'BackOffice' + '$', "i")
    	};
    	RoleModel.findOne(query).exec(function(err, role){
    		if (err) {
                res.status(500).json(err);
            }
    		query = {};
	    	query = {
	    		'name': new RegExp('^' + 'Admin' + '$', "i")
	    	};
	    	RoleModel.findOne(query).exec(function(err, roleAdmin){
	    		if (err) {
	                res.status(500).json(err);
	            }
	    		query = {};
	    		query = {
    				"role" : {
    					$in : [roleAdmin._id]
    				}
	    		}
                UserModel.findOne(query).exec(function(err, userAdmin){
    	    		if (err) {
    	    			console.log(err);
    	            }
		    		//notifyingUsers.push(userAdmin._id);
    	    		thisFunction.addNotification(title, description, userAdmin._id);
		    		SpaceModel.findOne({_id: booking.space}).populate('teams').exec(function (err, space) {
		                if(err) {
		              	  return res.json(err);
		                }
		                /*if(space.teams.length === 0){
		                	var notification={
	            	            title: title,
	            	            description: description,
	            	            user: notifyingUsers,
	            	            isRead: false
	            	        };
	            	        var notificationObj = new NotificationModel(notification);
	            	        notificationObj.save(function (err) {
	            	            if (err) {
	            	                console.log(err);
	            	            }
	            	        });
		                }*/
		                async.each(space.teams, function(teamObj, callback) {
		                	if(JSON.stringify(teamObj._id) === JSON.stringify(role._id)){
		    	                //notifyingUsers.push(teamObj._id);
		                		thisFunction.addNotification(title, description, teamObj._id);
		                	}
		                	/*counter++;
		                	if(space.teams.length === counter){
		                		var notification={
	                	            title: title,
	                	            description: description,
	                	            user: notifyingUsers,
	                	            isRead: false
	                	        };
	                	        var notificationObj = new NotificationModel(notification);
	                	        notificationObj.save(function (err) {
	                	            if (err) {
	                	                console.log(err);
	                	            }
	                	        });
		                	}*/
		                });
		            }); 
                });
	    	});
    	});
    },

    addNotificationURL: function (title,description,user,redirect) {
        var notification={
            title: title,
            description: description,
            user: user,
            isRead: false,
            url: redirect
        };
        var notificationObj = new NotificationModel(notification);
        notificationObj.save(function (err) {
            if (err) {
                console.log(err);
            }
        });
    }
    
};