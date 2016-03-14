'use strict';
var async = require('async');
require('../../../../custom/course/server/models/course.js');
require('../../../../custom/onlinetest/server/models/onlinetest.js');
require('../../../../custom/course/server/models/course_project.js');
var utility = require('../../../../core/system/server/controllers/util.js');
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
     CourseModel = mongoose.model('Course'),
     CourseTopicModel = mongoose.model('CourseTopic'),
     OnlineTestModel = mongoose.model('Onlinetest'),    
     CourseCurriculumModel = mongoose.model('CourseCurriculum'),
     CourseprojectModel = mongoose.model('Courseproject'),
    _ = require('lodash');

module.exports = function (CourseCurriculumCtrl) {

    return {
        /**
         * Find course by id
         */

    	coursetest : function(req , res, next ,id){		
    		CourseCurriculumModel.load(id, function (err,coursetest){
				if(err){
					return next(err);
				}
				if(!coursetest){
					return next(new Error('Failed to load course'+ id))
				}
				req.coursetest = coursetest;
				next();
			});
		},
		
		topic: function (req, res, next, id) {					
        	CourseTopicModel.load(id, function (err, topic) {
                if (err) {
                    return next(err);
                }
                if (!topic) {
                 return next(new Error('Failed to load role ' + id));
                 }	               
                req.topic = topic;		               
                next();
            });
        },	
        
        course : function(req , res, next ,id){		    		
			CourseModel.load(id, function (err,course){					
				if(err){
					return next(err);
				}
				if(!course){
					return next(new Error('Failed to load course'+ id))
				}
				req.course = course;				
				next();
			});
		},
        
		 test : function(req,res,next,id) {
	         	OnlineTestModel.load( id , function(err, onlinetest){
	         		if(err){
	         			return next(err);
	         		}
	         		if(!onlinetest){
	         			return next(new Error('Failed to load onlinetest'+ id));
	         		}
	         		req.onlinetest = onlinetest;
	         		next();

	         	});
	         },     
	         project : function(req, res, next, id) {
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

        create: function (req, res) {         
        	var curriculums = req.body.topics;           	
            var sequence = 0;
            CourseCurriculumModel.remove({course: req.body.course}, function () {
				async.each(curriculums, function(curriculum, callback) {
					var course = req.body.course;					
					if (curriculum.topic) {
						var topic = curriculum.topic;
						var curriculumData = {
							course : course,
							topic : topic._id,
							sequence : sequence++
						};
					} else if (curriculum.test) {
						var test = curriculum.test;
						if (test._id) {
							var curriculumData = {
								course : course,
								test : test._id,
								sequence : sequence++
							};
						} else {
							var curriculumData = {
								course : course,
								test : test,
								sequence : sequence++
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
							console.log("Inside country admin save:Error "
									+ err);
						}

					});
				});
				var response = {};
		    	response.curriculums = curriculums;
		    	res.json(response);
  			  });
                
            },


        /**
		 * Update the Role
		 */
        update: function (req, res) {
            var coursetest = req.coursetest;
            if(coursetest.topic){
	            var topic = coursetest.topic;
	            var topic = _.extend(topic,req.body.topic);
	            topic.save(function(err){
	            	if(err){
	            		 return res.status(400).send(errors);
	            	}
	            });
            }        
            var coursetest = _.extend(coursetest, req.body);          
             
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            coursetest.save(function (err) {
            	
            	
                if (err) {
                    switch (err.code) {
                        case 11000:
                        case 11001:
                            res.status(400).json([
                                 ERRORS.ERROR_001
                             ]);
                            break;
                        default:
                            var modelErrors = [];

                            if (err.errors) {
                                for (var x in err.errors) {
                                    modelErrors.push({
                                        param: x,
                                        msg: err.errors[x].message,
                                        value: err.errors[x].value
                                    });
                                }                              
                                res.status(400).json(modelErrors);
                            }
                        }
                        return res.status(400);                      
                    }
                        res.json(coursetest);
                });
            },


        /**
         * Delete the featurerole
         */
        destroy: function (req, res) {        
            var coursetest = req.coursetest;


            coursetest.remove(function (err) {
            
                if (err) {
                    return res.status(400).json({
                        error: 'Cannot delete the branchadmin'
                    });
                }  
                if(coursetest.topic){
                	CourseTopicModel.remove({_id:coursetest.topic._id }, function (err) {
                          if (err) {
                              console.log(err);
                          }
                      });
                	CourseTopicModel.remove({parent:coursetest.topic._id }, function (err) {
                        if (err) {
                            console.log(err);
                        }
                    });
                }

                res.json(coursetest);
            });
        },

        /**
         * Show the Role
         */
        show: function (req, res) {           
            res.json(req.coursetest);
        },
        /**
         * List of Roles
         */
        all: function (req, res) {
        	var course = req.course;
        	CourseCurriculumModel.find({course:course._id}).sort({sequence: 1}).populate('topic').populate('test').populate('project').deepPopulate('topic.topicSkill,project.requiredSkill.skill', 'name').exec(function (err, coursetests) {
                if (err) {
                    return res.status(400).json({
                        error: 'Cannot list the branchadmin'
                    });
                }
                res.json(coursetests);
            });
        },
        CurriculumListByPagination:function(req,res){        	        	   
        	var course = req.query.course;        
        	var queryAnd = [];
        	var obj = {
                    'course': course
                };
        	queryAnd.push(obj);
        	 var populateObj = {'test': '','topic': '','project':'','course':''};        	   
        	 utility.paginationSort(req, res, CourseCurriculumModel, {
        		 $and: queryAnd
             }, {}, populateObj, {
                 sequence: 1
             }, function(result) {            	
                 if (utility.isEmpty(result.collection)) {
                     //res.json(result);
                 }              
                 return res.json(result);
             });
        },
        courseCurriculumTest:function (req, res) {
        	var course = req.course;
        		CourseCurriculumModel.find({course:course._id}).populate('test').exec(function (err, test) {
                    if (err) {
                        return res.status(400).json({
                            error: 'Cannot list the course test'
                        });
                    }
                    res.json(test);
                });	
        	}
        	
    };
}
