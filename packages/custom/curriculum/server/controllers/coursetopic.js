'use strict';
require('../../../../custom/course/server/models/course.js');
require('../../../../custom/skill/server/models/skill.js');
var async = require('async');

var mongoose = require('mongoose'), CourseTopicModel = mongoose
		.model('CourseTopic'), CourseCurriculumModel = mongoose
		.model('CourseCurriculum'), CourseModel = mongoose.model('Course'),
		SkillModel = mongoose.model('Skill'),_ = require('lodash');

module.exports = function(CourseTopicCtrl) {

	return {

		topic : function(req, res, next, id) {
			CourseTopicModel.load(id, function(err, topic) {
				if (err) {
					return next(err);
				}
				if (!topic) {
					return next(new Error('Failed to load topic ' + id));
				}
				req.topic = topic;
				next();
			});
		},
		course : function(req, res, next, id) {
			CourseModel.load(id, function(err, course) {
				if (err) {
					return next(err);
				}
				if (!course) {
					return next(new Error('Failed to load course' + id))
				}
				req.course = course;
				next();
			});
		},
		
		skill : function(req,res,next,id) {
       	 SkillModel.load( id , function(err, skill){
         		if(err){
         			return next(err);
         		}
         		if(!skill){
         			return next(new Error('Failed to load skill'+ id));
         		}
         		req.skillId = skill;
         		next();

         	});
         },
        

		create : function(req, res) {
		   	var errors = [];
		   	var curriculums = req.body.topics;		
		   	curriculums.course = req.body.course;
		   	var sequence = 1;
		   	var topicLists = _.pluck(req.body.topic, 'name');
		   	for (var i = 0; i < topicLists.length; i++) {
			    if (!topicLists[i]) {
		     		errors.push({});    
		    	}
		   	}
		   	CourseCurriculumModel.remove({
		   		course : req.body.course
			}, function() {
		    	async.each(curriculums, function(curriculum, callback) {		    		
		     		if(curriculum.name) {		     			
		      			var topic = new CourseTopicModel(curriculum);		      			
		      			topic.course = new CourseModel(req.course);		      			
		      			topic.save(function(err) {			      			
		       				if (err) {		       					
		        				switch (err.code) {
		        					case 11000:
		        					case 11001:
		         					res.status(400).json([ {
		          						msg : 'Topic name already taken',
		          						param : 'name'
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
		          						res.status(400).json(modelErrors);
		         					}
		        				}
		        				return res.status(400);
		       				}
		      			});		      			
		      			curriculum.topic = topic;
		     		}    
		     		var course = req.body.course;		     		
		     		if (curriculum.topic) {
		      			var topic = curriculum.topic;
		      			var curriculumData = {
		       				course : course,
		       				topic : topic._id,
		       				sequence : sequence++
		      			};
		     		}else if (curriculum.test) {		     			
						var test = curriculum.test;
						if (test._id) {
							var curriculumData = {
								course : course,
								test : test._id,
								sequence : sequence++,
								testType : curriculum.testType
							};
						} else {
							var curriculumData = {
								course : course,
								test : test,
								sequence : sequence++,
								testType : curriculum.testType
							};
						}
					} else {
						var project = curriculum.project;
						if (!project._id) {
							var curriculumData = {
								course : course,
								project : project,
								sequence : sequence++
							};
						} else {
							var curriculumData = {
								course : course,
								project : project._id,
								sequence : sequence++
							};
						}
					}
		     		var curriculum = new CourseCurriculumModel(curriculumData);
		     		curriculum.save(function(err) {
		      			if (err) {
		       				console.log("Inside country admin save:Error " + err);
		      			}
		     		});
		    	});
		    	var response = {};
		    	response.curriculums = curriculums;
		    	res.json(response);
		   	});
		},

		//update the topic

		update : function(req, res) {
			var topic = req.topic;

			var topic = _.extend(topic, req.body);
			req.assert('name', 'You must enter a topic name').notEmpty();
			var errors = req.validationErrors();
			if (errors) {
				return res.status(400).send(errors);
			}
			topic.save(function(err) {
				if (err) {
					switch (err.code) {
					case 11000:
					case 11001:
						res.status(400).json([ ERRORS.ERROR_001 ]);
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
							res.status(400).json(modelErrors);
						}
					}
					return res.status(400);
				}

				res.json(topic);

			});
		},

		destroy : function(req, res) {
			var topic = req.topic;

			topic.remove(function(err) {
				if (err) {
					return res.status(400).json({
						error : 'Cannot delete the role'
					});
				}

				res.json(topic);
			});
		},

		all : function(req, res) {
			CourseTopicModel.find().populate('topicSkill','name').exec(function(err, topics) {
				if (err) {
					return res.status(500).json({
						error : 'Cannot list the subtopics'
					});
				}

				res.json(topics);
			});
		},

		show : function(req, res) {
			res.json(req.topic);
		},

		loadTopicsByCourse : function(req, res) {
			var course = req.course;
			var coursetopics = [];
			var j = 0;
			CourseTopicModel.find({
				course : course._id
			}).exec(function(err, topics) {				
				var topics = topics;
				for (var i = 0; i < topics.length; i++) {
					if (!JSON.stringify(topics[i].parent)) {
						coursetopics[j] = topics[i];
						j++;
					}
				}
				res.json(coursetopics);
			});
		},

		loadTopicsByParent : function(req, res) {			
			var topic = req.topic;
			CourseTopicModel.find({
				parent : topic._id
			}).sort({sequence : 1}).populate('parent','name').exec(function(err, subtopics) {
				res.json(subtopics);

			});
		},
		
		createsubtopic : function(req,res){		
			var errors = [];			
			var curriculums = req.body.subtopic;			
			curriculums.course = req.body.course;			
			var sequence = 1;
			var topicLists = _.pluck(req.body.topic, 'name');
			for (var i = 0; i < topicLists.length; i++) {
				if (!topicLists[i]) {
					errors.push({});				
				}
			}	
			CourseTopicModel.remove({
				parent : req.body.parent
			}, function() {
				async.each(curriculums, function(curriculum, callback) {						
						var topic = new CourseTopicModel(curriculum);
						topic.course = new CourseModel(req.course);
						topic.sequence = sequence ++;
						topic.save(function(err) {
							if (err) {
								switch (err.code) {
								case 11000:
								case 11001:
									res.status(400).json([ {
										msg : 'Topic name already taken',
										param : 'name'
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
										res.status(400).json(modelErrors);
									}
								}
								return res.status(400);
							}						
						});						
					});				
				var response = {};
		    	response.curriculums = curriculums;
		    	res.json(response);
				});
			}
		
	}//return close

}