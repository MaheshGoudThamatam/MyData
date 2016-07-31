'use strict';

/**
 * Module dependencies.
 */
require('../../../../custom/role/server/models/role.js');
var mongoose = require('mongoose'), UserModel = mongoose.model('User'), TeamModel = mongoose
        .model('Team'), RoleModel = mongoose.model('Role'), PartnerTeamModel = mongoose
        .model('PartnerTeam'), _ = require('lodash');
var nodemailer = require('nodemailer'), config = require('meanio').loadConfig(), templates = require('../template');

/**
 * Send email to partner
 */


module.exports = function(Team) {
	return {
	    /**
		 * Find partner user by id
		 */
	    partner : function(req, res, next, id) {
		    UserModel.load(id, function(err, partner) {
			    if (err) {
				    return next(err);
			    }
			    if (!partner) {
				    return next(new Error('Failed to load partner' + id));
			    }
			    req.partner = partner;
			    next();

		    });
	    },
	    /**
		 * Find team user by id
		 */
	    team : function(req, res, next, id) {
		    UserModel.load(id, function(err, team) {
			    if (err) {
				    return next(err);
			    }
			    if (!team) {
				    return next(new Error('Failed to load team' + id));
			    }
			    req.team = team;
			    next();

		    });
	    },

	    /**
		 * list all team for a particular partner
		 */
	    all : function(req, res) {
		    var _user = req.partner;
		    if (req.query.roleType == 'partner') {
			    var name = req.query.roleType;
			    var queryType = {
				    'name' : new RegExp('^' + name + '$', "i")
			    };
			    RoleModel.findOne(queryType, function(err, roleId) {
				    var found = false;
				    for (var i = 0; i <= _user.role.length; i++) {
					    if (JSON.stringify(_user.role[i]) === JSON
					            .stringify(roleId._id)) {
						    found = true;
						    break;
					    }
				    }
				    if (found) {
					    PartnerTeamModel.find({partner : req.partner._id}).populate('team').exec(function(err, team) {
						    if (err) {
							    return res.status(500).json({
								    error : 'Cannot list the team'
							    });
						    }
						    res.json(team);
					    });

				    } else {
					    res.json(401).send("user is not authorized for this action");
				    }

			    });
		    }

		    else {
			    res.json(401).send("user is not authorized for this action");
		    }
	    },

	    /**
		 * show a specific team associated with a particular partner
		 */
	    show : function(req, res) {
		    var partner = req.partner;
		    var team = req.team;
		    if (req.query.roleType == 'partner'
		            || req.query.roleType == 'admin') {
			    var name = req.query.roleType;
			    var queryType = {
				    'name' : new RegExp('^' + name + '$', "i")
			    };
			    RoleModel.findOne(queryType, function(err, roleId) {
				    var found = false;
				    for (var i = 0; i <= partner.role.length; i++) {
					    if (JSON.stringify(partner.role[i]) === JSON
					            .stringify(roleId._id)) {
						    console.log(partner.role[i]);
						    found = true;
						    break;
					    }
				    }
				    if (found) {
					    res.json(team);
				    } else {
					    return res.status(401).send("User is not authorized for this action 1");
				    }

			    });
		    } else {
			    return res.status(401).send("User is not authorized for this action 2");
		    }
	    },
	    //Create
	    create : function(req, res) {

		    //var _user = req.partner;
		    if (req.query.roleType == 'partner'|| req.query.roleType == 'admin') {
			    var name = req.query.roleType;
			    var queryType = {
				    'name' : new RegExp('^' + name + '$', "i")
			    };
			    console.log(queryType);
			    RoleModel.findOne(queryType, function(err, roleId) {
				    var found = false;
				    var user = req.partner;
				    console.log(user);
				    var userRole = user.role;
				    console.log(userRole);
				    for (var i = 0; i < userRole.length; i++) {
					    if (JSON.stringify(user.role[i]) === JSON.stringify(roleId._id)) {
						    found = true;
						    break;
					    }
				    }
				    console.log(found);
				    if (found) {
					    var user = new UserModel(req.body);
					    req.assert('email', 'Please enter email').notEmpty();
					    req.assert('first_name', 'Please enter first_name').notEmpty();
					    req.assert('pinCode', 'Please enter pinCode')
			            .notEmpty();
					    var errors = req.validationErrors();
					    if (errors) {
						    return res.status(400).send(errors);
					    }
					    user.save(function(err) {
						    if (err) {
							    switch (err.code) {
							    case 11000:
							    case 11001:
								    res.status(400).json([ {
								        msg : 'email already exists',
								        param : 'email'
								    } ]);
								    break;
							    default:
								    var modelErrors = [];
								    if (err.errors) {
									    for ( var x in err.errors) {
										    modelErrors.push({
										        param : x,
										        msg : err.errors[x].message,
										        value : err.errors[x].value
										    });
									    }
									    console.log('mod' + modelErrors);
									    res.status(400).json(modelErrors);
								    }
							    }
							    return res.status(400);
						    }
						    res.json(user);
					    });

         var partnerTeam = {};
         partnerTeam.partner = req.partner._id;
         partnerTeam.team = user._id;
         var partnerTeamObj = new PartnerTeamModel(partnerTeam)
         partnerTeamObj.save(function(err) {
          if (err) {
           return (err);
          }
         });
        } else {
         return res.status(401).send("User is not authorized for this action 1");
        }

       });
      } else {
       return res.status(401).send("User is not authorized for this action 2");
      }

     },
	    /**
		 * update an team
		 */
	    update : function(req, res) {
		    var partner = req.partner;
		    var team = req.team;
		    var _user = req.user;
		    _user = _.extend(team, req.body);
		    if (req.query.roleType == 'partner'
		            || req.query.roleType == 'admin') {
			    var name = req.query.roleType;
			    var queryType = {
				    'name' : new RegExp('^' + name + '$', "i")
			    };
			    RoleModel.findOne(queryType, function(err, roleId) {
				    var found = false;
				    for (var i = 0; i <= partner.role.length; i++) {
					    if (JSON.stringify(partner.role[i]) === JSON
					            .stringify(roleId._id)) {
						    found = true;
						    break;
					    }
				    }
				    if (found) {

					    var user = new UserModel(req.body);
					    req.assert('email', 'Please enter email').notEmpty();
					    req.assert('first_name', 'Please enter first_name')
					            .notEmpty();
					    var errors = req.validationErrors();
					    if (errors) {
						    return res.status(400).send(errors);
					    }
					    _user.save(function(err) {
						    if (err) {
							    switch (err.code) {
							    case 11000:
							    case 11001:
								    res.status(400).json([ {
								        msg : 'email already exists',
								        param : 'email'
								    } ]);
								    break;
							    default:
								    var modelErrors = [];
								    if (err.errors) {
									    for ( var x in err.errors) {
										    modelErrors.push({
										        param : x,
										        msg : err.errors[x].message,
										        value : err.errors[x].value
										    });
									    }
									    console.log('mod' + modelErrors);
									    res.status(400).json(modelErrors);
								    }
							    }
							    return res.status(400);
						    }
						    res.json(user);
					    });

					    /*
						 * var partnerTeam = {}; partnerTeam.partner =
						 * req.partner._id; partnerTeam.team = user._id; var
						 * partnerTeamObj = new partnerTeamModel(partnerTeam)
						 * partnerTeamObj.save(function(err){ if(err){
						 * console.log(err); return(err); } });
						 */

				    } else {
					    return res.status(401).send("User is not authorized for this action 1");
				    }

			    });
		    } else {
			    return res.status(401).send("User is not authorized for this action 2");
		    }
	    },
	    /**
		 * delete an team
		 */
	    destroy : function(req, res) {
		    var partner = req.partner;
		    var team = req.team;
		    if (req.query.roleType == 'partner'|| req.query.roleType == 'admin') {
			    var name = req.query.roleType;
			    var queryType = {
				    'name' : new RegExp('^' + name + '$', "i")
			    };
			    RoleModel.findOne(queryType, function(err, roleId) {
				    var found = false;
				    for (var i = 0; i <= partner.role.length; i++) {
					    if (JSON.stringify(partner.role[i]) === JSON.stringify(roleId._id)) {
						    found = true;
						    break;
					    }
				    }
				    if (found) {
					    team.remove(function(err) {
						    if (err) {
							    return res.status(500).json({
								    error : 'Cannot delete the team'
							    });
						    }
						    PartnerTeamModel.remove({
						        partner : req.partner._id,
						        team : team._id
						    }, function(err) {
							    if (err) {
								    return (err);
							    }
						    });
						    res.json(team);
					    });

				    } else {
					    return res.status(401).send("User is not authorized for this action");
				    }

			    });
		    } else {
			    return res.status(401).send("User is not authorized for this action");
		    }

	    },

	     



	};
}
