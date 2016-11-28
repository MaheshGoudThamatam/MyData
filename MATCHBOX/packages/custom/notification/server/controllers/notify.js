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
    
    addNotificationForBooking : function (title, description, booking, redirect) {
    	console.log(booking);
    	var notifyingUsers = [];
    	var counter = 0;
    	var thisFunction = this;
    	//notifyingUsers.push(booking.partner);
    	thisFunction.addNotificationURL(title, description, booking.partner,redirect);
    	var query = {};
    	query = {
    		'name': new RegExp('^' + 'BackOffice' + '$', "i")
    	};
    	RoleModel.findOne(query).exec(function(err, role){
    		if (err) {
                res.status(500).json(err);
            }
    		console.log(role);
    		query = {};
	    	query = {
	    		'name': new RegExp('^' + 'Admin' + '$', "i")
	    	};
	    	RoleModel.findOne(query).exec(function(err, roleAdmin){
	    		if (err) {
	                res.status(500).json(err);
	            }
	    		console.log(roleAdmin);
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
    	    		console.log(userAdmin);
		    		//notifyingUsers.push(userAdmin._id);
    	    		thisFunction.addNotificationURL(title, description, userAdmin._id, redirect);
		    		SpaceModel.findOne({_id: booking.space}).populate('teams').exec(function (err, space) {
		                if(err) {
		              	  return res.json(err);
		                }
		                if(space.teams.length === 0){
		                	thisFunction.addNotificationURL(title, description, notifyingUsers, redirect);
		                	
		                }else{
		                async.each(space.teams, function(teamObj, callback) {
		                	if(JSON.stringify(teamObj._id) === JSON.stringify(role._id)){
		    	                //notifyingUsers.push(teamObj._id);
		                		thisFunction.addNotificationURL(title, description, teamObj._id, redirect);
		                	}
		                	});
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
		                }
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