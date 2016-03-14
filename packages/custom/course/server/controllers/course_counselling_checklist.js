/** <Desc : Defined for the admin to create counselling checklist for a particular course>
     * @ PARAMS: <counsellingchecklist._id,course._id>, ...
     * @ RETURNS: <counsellingchecklist object>
     * @ <Sanjana> <01-mar-2016> <description of change>
     **/
'use strict';

/**
 * Module dependencies.
 */
var utility = require('../../../../core/system/server/controllers/util.js');
var mongoose = require('mongoose'),
CourseCounsellingChecklistModel = mongoose.model('CourseCounsellingChecklist'),
CourseModel = mongoose.model('Course'),
	_ = require('lodash');

module.exports = function (CourseCounsellingChecklist) {

    return {

        /**
         * Find courseCounsellingChecklist by id
         */
    	courseCounsellingChecklist: function (req, res, next, id) {
    		CourseCounsellingChecklistModel.load(id, function (err, courseCounsellingChecklist) {
                if (err) return next(err);
                if (!courseCounsellingChecklist) return next(new Error('Failed to load courseCounsellingChecklist ' + id));
                req.courseCounsellingChecklist = courseCounsellingChecklist;
                next();
            });
        },
        /**
         * Find course by id
         */
    	course: function (req, res, next, id) {
    		CourseModel.load(id, function (err, course) {
                if (err) return next(err);
                if (!course) return next(new Error('Failed to load course ' + id));
                req.course = course;
                next();
            });
        },
         
        
         /**
         * Create an courseCounsellingChecklist
         */
        create : function(req, res) {
			var courseCounsellingChecklist = new CourseCounsellingChecklistModel(req.body);
			// because we set our user.provider to local our models/user.js
			// validation will always be true
			req.assert('title', 'You must enter title')
					.notEmpty();
			req.assert('description', 'You must enter description')
					.notEmpty();
			
			var errors = [];
            errors.concat(req.validationErrors());
            
            var checklisttitle = [];
            for(var i=0;i<req.body.questions.length;i++){
            	if(req.body.questions[i].title == ""){
            		checklisttitle.push({});
            	}
            }
            if(checklisttitle.length > 0){
            	return res.status(400).send([{
                    msg: "Please enter the title",
                    param: "title"
                }]);
            }
            
            var checklistDescription = [];
               for (var i = 0; i < req.body.questions.length; i++) {
                if (req.body.questions[i].description  == "") {
                	checklistDescription.push({});
                }
            }
            if (checklistDescription.length > 0) {
                return res.status(400).send([{
                    msg: "Please enter the description",
                    param: "description"
                }]);
            }

          
            var checklistTitle = [];
            var questionsTitle = _.pluck(req.body.questions, 'title');
            var uniqueChc = _.uniq(questionsTitle, JSON.stringify).length === questionsTitle.length;
            if (!uniqueChc) {
                var valError2 = {
                    msg: "Title Should be unique",
                    param: "title"
                };
                checklistTitle.push(valError2);
            }
            if (checklistTitle.length > 0) {
                return res.status(400).send(checklistTitle);
            }
                                   
            courseCounsellingChecklist.save(function(err) {
				if (err) {
					switch (err.code) {
					case 11000:
					case 11001:
						res.status(400).json([ {
							msg : 'Title already exists',
							param : 'title'
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
				var course = req.course;
				course.checklist.push(courseCounsellingChecklist._id); 
				course.save(function(err) {
					if(err){
						res.status(400).json({});
					}
				});
				res.json(courseCounsellingChecklist);
			});
		},
        /**
         * Update an courseCounsellingChecklist
         */
        update: function (req, res) {
            var courseCounsellingChecklist = req.courseCounsellingChecklist;
            courseCounsellingChecklist = _.extend(courseCounsellingChecklist, req.body);
         // because we set our user.provider to local our models/user.js
			// validation will always be true
			req.assert('title', 'You must enter title')
					.notEmpty();
			req.assert('description', 'You must enter description')
					.notEmpty();
			
			var errors = [];
            errors.concat(req.validationErrors());
            
            var checklisttitle = [];
            for(var i=0;i<req.body.questions.length;i++){
            	if(req.body.questions[i].title == ""){
            		checklisttitle.push({});
            	}
            }
            if(checklisttitle.length > 0){
            	return res.status(400).send([{
                    msg: "Please enter the title",
                    param: "title"
                }]);
            }
            
            var checklistDescription = [];
              for (var i = 0; i < req.body.questions.length; i++) {
                if (req.body.questions[i].description  == "") {
                	checklistDescription.push({});
                }
            }
            if (checklistDescription.length > 0) {
                return res.status(400).send([{
                    msg: "Please enter the description",
                    param: "description"
                }]);
            }

          
            var checklistTitle = [];
            var questionsTitle = _.pluck(req.body.questions, 'title');
            var uniqueChc = _.uniq(questionsTitle, JSON.stringify).length === questionsTitle.length;
            if (!uniqueChc) {
                var valError2 = {
                    msg: "Title Should be unique",
                    param: "title"
                };
                checklistTitle.push(valError2);
            }
            if (checklistTitle.length > 0) {
                return res.status(400).send(checklistTitle);
            }
                 
            courseCounsellingChecklist.save(function (err) {
            	if (err) {
					switch (err.code) {
					case 11000:
					case 11001:
						res.status(400).json([ {
							msg : 'Title already exists',
							param : 'title'
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

                res.json(courseCounsellingChecklist);
            });
        },
        
        /**
         * Delete a courseCounsellingChecklist
         */
        destroy: function (req, res) {
            var courseCounsellingChecklist = req.courseCounsellingChecklist;
            
            courseCounsellingChecklist.remove(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete the CounsellingChecklist'
                    });
                }

                res.json(courseCounsellingChecklist);
            });
        },
        
        /**
         * Show an courseCounsellingChecklist
         */
        show: function (req, res) {
        	 res.json(req.courseCounsellingChecklist);
        },
        
        /**
         * List of courseCounsellingChecklist
         */
        all: function (req, res) {
        	CourseCounsellingChecklistModel.find().populate('course').exec(function (err, courseCounsellingChecklist) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the courseCounsellingChecklist'
                    });
                }

                res.json(courseCounsellingChecklist);
            });
        },

		/**
		 * List of course counselling checklist as by pagination
		 */
		courseCounsellingChecklistByPagination : function(req, res) {
			var populateObj = {course:'name'};
			utility.pagination(req, res, CourseCounsellingChecklistModel, {}, {},
					populateObj, function(result) {
						if (utility.isEmpty(result.collection)) {
							}
                          return res.json(result);
					});
			
		},
        
    };
}