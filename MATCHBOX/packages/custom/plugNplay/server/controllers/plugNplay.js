'use strict';

/**
 * Module dependencies.
 */

require('../../../plugNplay/server/models/plugNplay.js');
require('../../../role/server/models/role.js');
require('../../../../core/users/server/models/user.js');
var mongoose = require('mongoose'),
	PlugNPlayModel = mongoose.model('PlugNPlay'),
	PlugNPlayUsersModel=mongoose.model('PlugNPlayUsers'),
	 nodemailer = require('nodemailer'), 
	    templates = require('../template'), 
	    config = require('meanio').loadConfig(),
	    RoleModel = mongoose.model('Role'),
	    UserModel = mongoose.model('User'),
	    Mailgen = require('mailgen'),
	    mail = require('../../../../core/system/server/services/mailService.js'),
	    async = require('async'),
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
module.exports = function(plugNplay) {
  return {
	  
	  /**
       * Find plugNplay by id
       */
	  plugNplay: function (req, res, next, id) {
		  PlugNPlayModel.load(id, function (err, plugNplay) {
              if (err) return next(err);
              if (!plugNplay) return next(new Error('Failed to load plugNplay ' + id));
              req.plugNplay = plugNplay;
              next();
          });
	  },
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
	  
	  /**
       * Show an Booking
       */
      show: function (req, res) {
          res.json(req.plugNplay);
      },

    //creating, upload and save image and areas
     
    createPlugNPlay:function(req,res){
    	console.log(req.body);
    	 var plugandplay=new PlugNPlayModel(req.body);
    	 plugandplay.save(function (err) {
              if (err) {
                  return res.status(500).json({
                      error: 'Cannot save the plug and play'
                  });
              }
              res.json(plugandplay);
          });
    },
    
    //update image and area
    
    updatePlugNPlay:function(req,res){
    	 var plugNplay = req.plugNplay;
    	 plugNplay = _.extend(plugNplay, req.body);
    	 plugNplay.save(function (err) {
             if (err) {
                 return res.status(500).json({
                     error: 'Cannot update the plugNplay'
                 });
             }

             res.json(plugNplay);
         });
    	
    },
    
    loadPlugNPlay: function (req, res) {
    	PlugNPlayModel.find().exec(function (err, plugNplays) {
            if (err) {
                return res.status(500).json({
                    error: 'Cannot list the plugNplays'
                });
            }
            res.json(plugNplays);
        });
    },
    
    //Plug N Play search 
    
    searchPlugNPlay:function (req, res, searchRadius, perPage, skipCount, locationArr) {
    	 // console.log(req.body);
    	 // console.log(new Date(req.body.stime));
    	 VirtualOffice.aggregate().near({ 
    	  near: locationArr,
    	  distanceField: "dist.calculated", // required
    	  spherical:true, 
    	  maxDistance: parseFloat(searchRadius)/distanceMultiplier,
    	  includeLocs: "dist.location",
    	 }).limit(perPage).skip(skipCount).exec(function(err,docs) {
    	  if (err) {
    	   res.json({'code': '0001', 'msg': err});
    	  } else {
    	   

    	   VirtualOffice.populate( docs, [{ path: 'spaceId' , select: 'name address1 address2 phone city locality state postal_code country'}], function(err, virtualRoomsList) {
    	    if(err){
    	     return res.status(500).json({
    	      error : 'Cannot load rooms'
    	     });
    	    }
    	    var result = {};
    	    result.rooms= [];
    	    result.rooms = virtualRoomsList;
    	    result.searchRadius = searchRadius;
    	    res.json(result);
    	    
    	    
    	   });
    	  
    	   
    	  }
    	 });
    	},
    	
    	//fetching plug anad play based on city
    	
    	getPlugNplayCity : function (req, res) {
    		var citySelected=req.query.citySelected;
    		console.log(citySelected);
        	PlugNPlayModel.findOne({'city':citySelected}).exec(function (err, city) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the city'
                    });
                }
                res.json(city);
            });
        },
        
        /*
         * Load Admin Users
         * 
         */
        
        loadRoles:function(req,res){
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
			            	   
			            	   return adminRoleUser;   
			               }
			               
			           });
	            	  // res.json(adminRole);   
	               }
	               
	           });
	       },
	       
        savePlugNPlayUsers:function(req,res){
       	 var plugandplay=new PlugNPlayUsersModel(req.body);
         //var userAdminRoles=this.loadRoles();
       	 //console.log(userAdminRoles);
       	 var plugNplayUsers = req.body;
       	 /*plugandplay.save(function (err,plugNplayUsers) {
                 if (err) {
                     return res.status(500).json({
                         error: 'Cannot save the plug and play users',
                         err: err
                     });
                 }
                 else{*/
       	 
       	 			// Based on role
                	 /*RoleModel.findOne({'name' :'Admin'}).exec(function (err, adminRole) {
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
      			            		 // console.log(userAdminRole);
      		                		 var mailOptionsAdmin = {
      		                                 to: userAdminRole.email,
      		                                 from: config.emailFrom
      		                             };
      		                		 console.log(mailOptionsAdmin);
      		                		 mailOptionsAdmin = templates.plugNplayUsers_admin_email(userAdminRole,plugNplayUsers,req,mailOptionsAdmin);
      		                         sendMail(mailOptionsAdmin);
      			            		 var removeString = {
      			            			hi : 'Hi'
      			            		 }
      			            		 var email = templates.plugNplayUsers_admin_email(userAdminRole, plugNplayUsers,req);
      	                 			 mail.mailServiceCustomized(email, userAdminRole.email, removeString);
      		                         callbackuserAdminRoles();
      		                     }, function(err) {
      		                    	 console.log(err);
      		                       //  res.send(myresult);
      		                     });
      			               }
      			           });
      	            	  // res.json(adminRole);   
      	               }
      	           });*/
       	 
			       	var emailConfig = config.email_config('plugNplay');
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
			                var removeString = {
		            			hi : 'Hi'
		            		}
		            		var email = templates.plugNplayUsers_admin_email({}, plugNplayUsers, req);
                 			mail.mailServiceCustomized(email, user_email, removeString);
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
                	 
                	
                	 var email = templates.plugNplayUsers_email(plugNplayUsers,req)
           			 mail.mailService(email,plugNplayUsers.email)
                	 res.json(plugNplayUsers);
                 /*}
                 
             });*/
       },
		      
  };
  
};