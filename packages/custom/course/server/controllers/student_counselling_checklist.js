/** <Desc : Defined for the mentor to add remarks for counselling checklist for a particular course created by the admin>
     * @ PARAMS: <studentCounsellingChecklist._id,user._id>, ...
     * @ RETURNS: <studentCounsellingChecklist object>
     * @ <Sanjana> <01-mar-2016> <description of change>
     **/
'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
StudentCounsellingChecklistModel = mongoose.model('StudentCounsellingChecklist'),
CourseCounsellingChecklistModel = mongoose.model('CourseCounsellingChecklist'),
UserModel = mongoose.model('User'),
	_ = require('lodash');

module.exports = function (StudentCounsellingChecklist) {

    return {
  
        /**
         * Find StudentCounsellingChecklist by id
         */
    	studentCounsellingChecklist: function (req, res, next, id) {
    		StudentCounsellingChecklistModel.load(id, function (err, studentCounsellingChecklist) {
                if (err) return next(err);
                if (!studentCounsellingChecklist) return next(new Error('Failed to load studentCounsellingChecklist ' + id));
                req.studentCounsellingChecklist = studentCounsellingChecklist;
                next();
            });
        },
        /**
         * Find user by id
         */
        user: function (req, res, next, id) {
        	UserModel.load(id, function (err, user) {
                if (err) return next(err);
                if (!user) return next(new Error('Failed to load user ' + id));
                req.user = user;
                next();
            });
        },

        /**
         * Create an StudentCounsellingChecklist
         */
        create: function (req, res) {
                var studentCounsellingChecklist = new StudentCounsellingChecklistModel(req.body);
                req.assert('notes', 'You must enter notes')
				.notEmpty();
                var errors = req.validationErrors();
                if (errors) {
                    return res.status(400).send(errors);
                }
                
                var errors = [];
                errors.concat(req.validationErrors());
                
                var checklistRemarks = [];
                for (var i = 0; i < req.body.questions.length; i++) {
                    if (req.body.questions[i].remarks  == "") {
                    	checklistRemarks.push({});
                    }
                }
                if (checklistRemarks.length > 0) {
                    return res.status(400).send([{
                        msg: "Please enter the remarks",
                        param: "remarks"
                    }]);
                }

                studentCounsellingChecklist.save(function (err) {
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
                res.json(studentCounsellingChecklist);
            });
        },
        
        /**
         * Update an StudentCounsellingChecklist
         */
        update: function (req, res) {
            var studentCounsellingChecklist = req.studentCounsellingChecklist;
            studentCounsellingChecklist = _.extend(studentCounsellingChecklist, req.body);
            req.assert('notes', 'You must enter notes')
			.notEmpty();
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            var errors = [];
            errors.concat(req.validationErrors());
            
            var checklistRemarks = [];
            for (var i = 0; i < req.body.questions.length; i++) {
                if (req.body.questions[i].remarks  == "") {
                	checklistRemarks.push({});
                }
            }
            if (checklistRemarks.length > 0) {
                return res.status(400).send([{
                    msg: "Please enter the remarks",
                    param: "remarks"
                }]);
            }

            studentCounsellingChecklist.save(function (err) {
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
                res.json(studentCounsellingChecklist);
            });
        },
        
        /**
         * Delete a StudentCounsellingChecklist
         */
        destroy: function (req, res) {
            var studentCounsellingChecklist = req.studentCounsellingChecklist;
            studentCounsellingChecklist.remove(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete the studentCounsellingChecklist'
                    });
                }

                res.json(studentCounsellingChecklist);
            });
        },
        
        /**
         * Show an StudentCounsellingChecklist
         */
        show: function (req, res) {
            res.json(studentCounsellingChecklist);
        },
        
        /**
         * List of StudentCounsellingChecklist
         */
        all : function(req, res) {
        	StudentCounsellingChecklistModel.find().exec(function(err, holiday) {
				if (err) {
					return res.status(500).json({
						error : 'Cannot list the holiday'
					});
				}
				res.json(studentCounsellingChecklist);
			});

		},
        
    };
}