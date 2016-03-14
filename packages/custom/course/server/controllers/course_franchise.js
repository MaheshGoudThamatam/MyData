'use strict';

/**
 * Module dependencies.
 */
require('../../../branch/server/models/branch.js');
require('../../../course/server/models/course_franchise.js');
require('../../../course/server/models/user_course.js');
require('../../../course/server/models/course_mode.js');

// Pagination
var utility = require('../../../../core/system/server/controllers/util.js');

var mongoose = require('mongoose'),

CourseModel = mongoose.model('Course'),
UserCourseModel = mongoose.model('UserCourse'),
CourseModeModel = mongoose.model('CourseMode'),
UserModel = mongoose.model('User'),
FranchiseModel = mongoose.model('Franchise'),
_ = require('lodash');


module.exports = function (FranchiseCtrl) {
	return {

    /**
     * Find franchise/ Third party Provider by id
     */
    franchise: function (req, res, next, id) {
    	FranchiseModel.load(id, function (err, franchise) {
            if (err) {
            	return next(err);
            }
            if (!franchise) {
            	return next(new Error('Failed to load franchise ' + id));
            }
            req.franchise = franchise;
            next();
        });
    },
     
    userCourse: function (req, res, next, id) {
		UserCourseModel.load(id, function (err, userCourse) {
            if (err){
            	return next(err);
            }
            if (!userCourse){
            	return next(new Error('Failed to load userCourse ' + id));
            }
            req.userCourse = userCourse;
            next();
        });
    },
    
    user: function (req, res, next, id) {
		UserModel.load(id, function (err, user) {
            if (err) {
            	return next(err);
            }
            if (!user) {
            	return next(new Error('Failed to load user ' + id));
            }
            req.user = user;
            next();
        });
    },
    
	/**
	 * Creates  franchise/ Third party Provider
	 */
	create : function(req, res) {
		var franchise = new FranchiseModel(req.body);
		 req.assert('name', 'You must enter a Name').notEmpty();
         req.assert('url', 'You must enter a URL').notEmpty();
         req.assert('email', 'You must enter a Email').notEmpty();
         req.assert('contactDetails[0].personName', 'You must enter Name').notEmpty();
         req.assert('contactDetails[0].designation', 'You must enter Designation').notEmpty();
         req.assert('contactDetails[0].phoneNumber', 'You must enter Phone Number').notEmpty();
         req.assert('contactDetails[0].mobileNumber', 'You must enter Mobile Number').notEmpty();
         req.assert('contactDetails[0].emailId', 'You must enter Email Id').notEmpty();
         
        var errors = req.validationErrors();
			if (errors) {
				return res.status(400).send(errors);
			}
     	
		franchise.save(function (err) {
           			if (err) {
					switch (err.code) {
					case 11000:
					case 11001:
						res.status(400).json([ {
							msg : ' Name already exists',
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
							console.log('mod'+modelErrors);
							res.status(400).json(modelErrors);
						}
					}
					return res.status(400);
				    
			}
                res.json(franchise);
            });
        },
        
        
      /**
       * Updates the franchise/ Third party Provider
       */
        update: function (req, res) {
            var franchise = req.franchise;
            franchise = _.extend(franchise, req.body);
            req.assert('name', 'Please enter  Name').notEmpty();
 			
 			var errors = req.validationErrors();
 			if (errors) {
 				return res.status(400).send(errors);
 			}
            franchise.save(function (err) {
                if (err) {
                    switch (err.code) {
 					case 11000:
 					case 11001:
 						res.status(400).json([ {
 							msg : 'Name already exists',
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
 							console.log('mod'+modelErrors);
 							res.status(400).json(modelErrors);
 						}
 					}
 				return res.status(400);
                }

                res.json(franchise);
            });
        },
        
        
        /**
         * Deletes the franchise/ Third party Provider
         */
        destroy: function (req, res) {
            var franchise = req.franchise;
            
            franchise.remove(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete the franchise'
                    });
                }

                res.json(franchise);
            });
        },
        
        /**
		 * Shows the franchise/ Third party Provider
		 */
		show : function(req, res) {
			res.json(req.franchise);
		},
		
		/**
		 * Lists the franchise/ Third party Provider
		 */
		all : function(req, res) {
			FranchiseModel.find().exec(function(err, franchises) {
				if (err) {
					return res.status(500).json({
						error : 'Cannot list the franchise'
					});
				}

				res.json(franchises);
			});
		},
		
		 /**
         * List of franchise as by pagination
         */
		franchiseListByPagination: function (req, res) {
			var populateObj = {};
			utility.pagination(req, res, FranchiseModel, {}, {}, populateObj, function(result){
               if(utility.isEmpty(result.collection)){
                  
               }
               return res.json(result);
			});
		},
		
    	
        
        
	
	};	
	
}