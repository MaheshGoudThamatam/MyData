'use strict';

/**
 * Module dependencies.
 */

require('../../../../custom/mentor/server/models/project_request.js');
require('../../../../custom/mentor/server/models/mentor_request.js');
var utility = require('../../../../core/system/server/controllers/util.js');

var async = require('async');
var mongoose = require('mongoose'),
	ProjectRequestModel = mongoose.model('ProjectRequest'),
    UserModel = mongoose.model('User'),
    MentorRequestModel = mongoose.model('MentorRequest'),
    _ = require('lodash');

module.exports = function (AdminMentor) {

    return {
        
    	/**
		 * Find mentor request by id
		 */
    	mentorRequest : function(req, res, next, id) {
			MentorRequestModel.load(id, function(err, mentorRequest) {
				if (err) {
					return next(err);
				}
				if (!mentorRequest) {
					return next(new Error('Failed to load Project Request ' + id));
				}
				req.mentorRequest = mentorRequest;
				next();
			});
		},
		
		/**
		 * Confirm User for the post of Mentorship
		 */
		confirmUserAsMentor: function(req, res) {
			var mentorRequest = req.mentorRequest;

			mentorRequest = _.extend(mentorRequest, req.body);
			
			var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            
            mentorRequest.save(function(err) {
				if (err) {
					res.status(400).json(err);
				}
				/*var query = {};
				query.project = mentorRequest.project
				utility.pagination(req, res, MentorRequestModel, query, {}, populateObj, function(result){
					if(utility.isEmpty(result.collection)){
						//res.json(result);
					}
	               
					return res.json(result);
				});*/
				res.json(mentorRequest);
			});
		},
    	
        /**
         * List of Mentors
         */
        all: function (req, res) {
            /*RoleModel.findOne({'name' : req.query.role}).exec(function (err, role) {
                if (err) {
                    return res.status(400).json({
                        error: 'Cannot list the Roles'
                    });
                }
                res.json(collection);
            });*/
        },
        
        /**
         * List of mentor request as by pagination
         */
		mentorRequestListByPagination: function (req, res) {
           var populateObj = {user: 'user'};
           var query = {};
           if(req.query.userStatus !== 'All'){
        	   query.user_status = req.query.userStatus;
           }
           utility.pagination(req, res, MentorRequestModel, query, {}, populateObj, function(result){
               if(utility.isEmpty(result.collection)){
                   //res.json(result);
               }
               
               return res.json(result);
           });
       },
       
       /**
        * Assign test to Mentor
        */
       assignTest: function (req, res) {
    	   var mentorRequest = req.mentorRequest;

    	   mentorRequest = _.extend(mentorRequest, req.body);
			
    	   var errors = req.validationErrors();
           if (errors) {
               return res.status(400).send(errors);
           }
           
           mentorRequest.save(function(err) {
				if (err) {
					res.status(400).json(err);
				}
				res.json(mentorRequest);
			});
       },
       
       /**
        * Fetch Mentor Request
        */
       showMentorRequest: function (req, res) {
			MentorRequestModel.findOne({
				_id : req.mentorRequest._id
			}).deepPopulate([ 'user', 'user.address', 'user.qualification_details','user.additional_documents', 'user.experience_details','user.references' ,'user.skills']).exec(
					function(err, mentorRequest) {
						if (err) {
							return next(err);
						}
						if (!mentorRequest) {
							return next(new Error(
									'Failed to load Project Request ' + id));
						}
						res.json(mentorRequest);
					});
       },
        
    };
}

