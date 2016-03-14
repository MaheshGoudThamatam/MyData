'use strict';

/**
 * Module dependencies.
 */

require('../../../../custom/role/server/models/role.js');
/* require('../../../../core/user/server/controllers/users.js'); */
require('../../../../custom/course/server/models/course.js');
require('../../../../custom/course/server/models/payment_scheme.js');
require('../../../../custom/course/server/models/course_request.js');
var utility = require('../../../../core/system/server/controllers/util.js');
var uuid = require('node-uuid'), multiparty = require('multiparty'), fs = require('fs');
var uploadUtil = require('../../../../core/system/server/controllers/upload.js');

var async = require('async');
var mongoose = require('mongoose'), RoleModel = mongoose.model('Role'), 
	UserModel = mongoose.model('User'), 
	CourseRequestModel = mongoose.model('CourseRequest'),
	CourseModel = mongoose.model('Course'),
	BranchModel = mongoose.model('Branch'),
	PaymentSchemeModel = mongoose.model('PaymentScheme'),
	BatchModel = mongoose.model('Batch'),
	_ = require('lodash');

module.exports = function(CourseRequest) {
	return {
		
		/**
		 * Find course by id
		 */
		course : function(req, res, next, id) {
			CourseModel.load(id, function(err, course) {
				if (err) {
					return next(err);
				}
				if (!course) {
					return next(new Error('Failed to load course ' + id));
				}
				req.course = course;
				next();
			});
		},			
		
		user : function(req, res, next, id) {
			UserModel.load(id, function(err, user) {
				if (err) {
					return next(err);
				}
				if (!user) {
					return next(new Error('Failed to user ' + id));
				}
				req.user = user;
				next();
			});
		},
		
		branch: function(req, res, next, id){
			 
					      BranchModel.load(id, function (err, branch) {
				 
				                if (err) return next(err);
				 
				                if (!branch) return next(new Error('Failed to load branch ' + id));
				 
				                req.branch = branch;
				 
				                next();
				 
				            });				
				     },
		
		courserequest: function(req, res, next, id) {
            CourseRequestModel.load(id, function(err, courserequest) {
                if (err) return next(err);
                if (!courserequest) return next(new Error('Failed to load courserequest ' + id));
                req.courserequest = courserequest;
                next();
            });
        },
		/**
		 * Find course request by id
		 */

		create : function(req, res) {
			   var courseRequest = new CourseRequestModel(req.body);
			   courseRequest.save(function(err) {
			    if (err) {
			     console.log("err:" + err);
			    } 
			    res.json(courseRequest);
			   });
		},
		update: function(req, res) {
            var courserequest = req.courserequest;
            courserequest = _.extend(courserequest, req.body);
            courserequest.save(function(err) {
                if (err) {
                    switch (err.code) {
                        case 11000:
                        case 11001:
                            res.status(400).json([{
                                msg: 'Name already exists',
                                param: 'name'
                            }]);
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
                                console.log('mod' + modelErrors);
                                res.status(400).json(modelErrors);
                            }
                    }
                    return res.status(400);
                }
                res.json(courserequest);
            });
        },
        /**
         * Delete a courserequest
         */
        destroy: function(req, res) {
            var courserequest = req.courserequest;
            courserequest.remove(function(err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete the batch'
                    });
                }
                res.json(courserequest);
            });
        },
        /**
         * Show an courserequest
         */
        show: function(req, res) {
            res.json(req.courserequest);
        },
        /**
         * List of batch
         */
        all: function(req, res) {
            CourseRequestModel.find().exec(function(err, courserequests) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the courserequest'
                    });
                }
                res.json(courserequests);
            });
        },
        /**
         * List of batch as by pagination
         */
        batchListByPagination: function(req, res) {
            var populateObj = {
                'branch': '',
                'course': '',
                'user':'',
                'paymentscheme':''
            };
            utility.pagination(req, res, CourseRequestModel, {}, {}, populateObj, function(result) {
                if (utility.isEmpty(result.collection)) {
                    //res.json(result);
                }
                return res.json(result);
            });
        },
        
        /**
         * List of course Request as by pagination
         */
        adminListCourseRequestPagination: function(req, res) {
            var populateObj = {
                'branch': '',
                'course': '',
                'user':'',
                'paymentscheme':''
            };
            utility.pagination(req, res, CourseRequestModel, {}, {}, populateObj, function(result) {
                if (utility.isEmpty(result.collection)) {
                    //res.json(result);
                }
                return res.json(result);
            });
        },
        
		loadPaymentScheme : function(req, res) {
			var courseId = req.course._id;
			PaymentSchemeModel.find({course: courseId}).exec(function(err, paymentSchemes){
				if (err) {
			     console.log("err:" + err);
			    } 
				res.json(paymentSchemes);
				console.log("paymentScheme:"+paymentSchemes);
			});
			
		},
		 /**
         * List of payment Schemas
         */
        paymentSchema: function (req, res) {
        	var courseId = req.course._id;
        	var branchId = req.branch._id;
        	var query = {};
        	query.course = courseId;
        	query.branch = branchId;
        	PaymentSchemeModel.find(query).populate('course' ,'name').exec(function (err, paymentSchemes) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the paymentSchemes'
                    });
                }

                res.json(paymentSchemes);
            });
        },
        /**
         *  Load Course Requests For a User */
        loadCourseRequestsBasedonUser: function(req, res) {
            var userId = req.query.userId;
            var studentcourses = {};
            CourseRequestModel.find({
                user: userId
            }).populate('paymentscheme').populate('course').populate('batch').populate('branch').populate('user').exec(function(err, courserequests) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the zone'
                    });
                }
                res.json(courserequests);
            });
        },
        
        loadBatchesSpecificToBranch: function(req, res) {
        	var courseId = req.course._id;
        	var branchId = req.branch._id;
        	var query = {};
        	query.course = courseId;
        	query.branch = branchId;
        	BatchModel.find(query).populate('paymentscheme').populate('course').populate('batch').populate('branch').populate('user').exec(function (err, batches) {
        		 if (err) {
                     return res.status(500).json({
                         error: 'Cannot list the batches'
                     });
                 }
                 res.json(batches);
        	});
        },
        fetchingallcourserequestlist:function(req,res) {
           var populateObj = {};
            utility.pagination(req, res, CourseModel, {"publish":"True"}, {}, populateObj, function(result){
               if(utility.isEmpty(result.collection)){
               }
               return res.json(result);
            });
        },
	}
}
