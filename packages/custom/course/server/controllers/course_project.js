'use strict';
/**
 * Module dependencies.
 */
var utility = require('../../../../core/system/server/controllers/util.js');

var mongoose = require('mongoose'), CourseprojectModel = mongoose
		.model('Courseproject'), _ = require('lodash');
module.exports = function(CourseprojectCtrl) {
	return {
		/**
		 * Find Course Project by id
		 */
		courseproject : function(req, res, next, id) {
			CourseprojectModel.load(id,
					function(err, courseproject) {
						if (err) {
							return next(err);
						}
						if (!courseproject) {
							return next(new Error(
									'Failed to load courseproject ' + id));
						}
						req.courseproject = courseproject;
						next();
					});
		},
		/**
		 * Create an course project
		 */
		create : function(req, res) {
			var courseproject = new CourseprojectModel(req.body);
			// because we set our user.provider to local our models/user.js
			// validation will always be true
			req.assert('projectName', 'Please enter Project Name').notEmpty();
			req.assert('description', 'You must enter Description').notEmpty();
			req.assert('totalMarks', 'You must enter Total Marks').notEmpty();
			req.assert('minimumMarks', 'You must enter Minimum Marks')
					.notEmpty();
			req.assert('requiredSkill[0].skill', 'You must enter Skill')
					.notEmpty();
			req.assert('requiredSkill[0].level', 'You must enter Level')
					.notEmpty();
			req.assert('requiredSkill[0].rewardPoint',
					'You must enter Reward Point').notEmpty();
			req.assert('questionsfields', 'You must enter Question').notEmpty();
			var errors = [];
            errors.concat(req.validationErrors());
            if(courseproject.totalMarks<=courseproject.minimumMarks){
            	 var valError = {
                         msg: "Total Marks must be greater than Minimum Marks",
                         param: "totalMarks"
                     };
                     errors.push(valError);
                 }
            if (errors.length > 0)
                {
				return res.status(400).send(errors);
			    }
			courseproject.save(function(err) {
				if (err) {
					switch (err.code) {
					case 11000:
					case 11001:
						res.status(400).json([ {
							msg : 'Project Name already exists',
							param : 'projectName'
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
				res.json(courseproject);
			});
		},
		/**
		 * Update an course project
		 */
		update : function(req, res) {
			var courseproject = req.courseproject;
			courseproject = _.extend(courseproject, req.body);
			req.assert('projectName', 'Please enter Project Name').notEmpty();
			req.assert('description', 'You must enter Description').notEmpty();
			req.assert('totalMarks', 'You must enter Total Marks').notEmpty();
			req.assert('minimumMarks', 'You must enter Minimum Marks')
					.notEmpty();
			req.assert('requiredSkill[0].skill', 'You must enter Skill ')
					.notEmpty();
			req.assert('requiredSkill[0].level', 'You must enter Level')
					.notEmpty();
			req.assert('requiredSkill[0].rewardPoint',
					'You must enter Reward Point').notEmpty();
			req.assert('questionsfields', 'You must enter Question').notEmpty();
			var errors = [];
            errors.concat(req.validationErrors());
            if(courseproject.totalMarks<=courseproject.minimumMarks){
            	 var valError = {
                         msg: "Total Marks must be greater than Minimum Marks",
                         param: "totalMarks"
                     };
                     errors.push(valError);
                 }
            if (errors.length > 0)
                {
				return res.status(400).send(errors);
			    }
			courseproject.save(function(err) {
				if (err) {
					switch (err.code) {
					case 11000:
					case 11001:
						res.status(400).json([ {
							msg : 'Project Name already exists',
							param : 'projectName'
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
				res.json(courseproject);
			});
		},
		/**
		 * Delete a course project
		 */
		destroy : function(req, res) {
			var courseproject = req.courseproject;

			courseproject.remove(function(err) {
				if (err) {
					return res.status(500).json({
						error : 'Cannot delete the courseproject'
					});
				}
				res.json(courseproject);
			});
		},

		/**
		 * Show an course project
		 */
		show : function(req, res) {
			res.json(req.courseproject);
		},

		/**
		 * List of Course projects
		 */
		all : function(req, res) {
			CourseprojectModel.find().populate('requiredSkill').deepPopulate('requiredSkill.skill').exec(function(err, courseprojects) {
				if (err) {
					return res.status(500).json({
						error : 'Cannot list the courseprojects'
					});
				}
				res.json(courseprojects);
			});
		},

		/**
		 * List of course project as by pagination
		 */
		courseprojectListByPagination : function(req, res) {
			var populateObj = {};
			utility.pagination(req, res, CourseprojectModel, {}, {},
					populateObj, function(result) {
						if (utility.isEmpty(result.collection)) {
							// res.json(result);
						}

						return res.json(result);
					});
			
		}
		
	};

}