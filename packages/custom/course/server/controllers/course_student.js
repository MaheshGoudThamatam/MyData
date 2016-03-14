'use strict';
/** Name : Student Course  Controller
 * Description : This controller for load student list based on course, load student list based on batch				
 * @ <author> Abha Singh
 * @ <date> 17-Feb-2016
 * @ METHODS: course(),branch(),batch(),student(),studentCourse(),
 * studentByBatchesBasedOnCourse(),loadStudentCourse(),branchStudentCourse(),updateStudentCourse(),
 */
var utility = require('../../../../core/system/server/controllers/util.js');
var mongoose = require('mongoose'),
    StudentCourseModel = mongoose.model('StudentCourse'),
    CourseModel=mongoose.model('Course'),
    BatchModel=mongoose.model('Batch'),
    BranchModel=mongoose.model('Branch'),
    StudentModel = mongoose.model('User'),
    _ = require('lodash');
   module.exports = function(CourseStudent) {
    return {
       
    	/**
    	 * Load the course based on Id
    	 */
    	course: function(req, res, next, id){
    		CourseModel.load(id, function (err, course) {
                if (err) return next(err);
                if (!course) return next(new Error('Failed to load course ' + id));
                req.course = course;
                next();
            });
    	},
    	
    	/**
    	 * Load the branch based on Id
    	 */
    	branch: function(req, res, next, id){
    		BranchModel.load(id, function (err, branch) {
                if (err) return next(err);
                if (!branch) return next(new Error('Failed to load branch ' + id));
                req.branch = branch;
                next();
            });
    	},
    	
    	/**
    	 * Load the batch based on Id
    	 */
    	batch: function(req, res, next, id){
    		BatchModel.load(id, function (err, batch) {
                if (err) return next(err);
                if (!batch) return next(new Error('Failed to load batch ' + id));
                req.batch = batch;
                next();
            });
    	},
    	
    	/**
    	 * Load the student based on Id
    	 */
    	student: function(req, res, next, id){
    		StudentModel.load(id, function (err, student) {
                if (err) return next(err);
                if (!student) return next(new Error('Failed to load student ' + id));
                req.student = student;
                next();
            });
    	},
    	
    	/**
         * Find student courses by id
         */
        studentCourse: function(req, res, next, id) {
            StudentCourseModel.load(id, function(err, studentCourse) {
                if (err) {
                    return next(err);
                }
                if (!studentCourse) {
                    return next(new Error('Failed to load students course' + id));
                }
                req.studentCourse = studentCourse;
                next();
            });
        },
    	
    	 /**
         * student batch list By course
         */
    	studentByBatchesBasedOnCourse: function(req, res) {
            if (req.query.obj) {
                var querobj = JSON.parse(req.query.obj);
            } else {
                var querobj = {};
            }
            var populateObj = {
                paymentschedule: '',
                course: '',
                batch: '',
                branch: '',
                user: ''
            };
            delete req.query.obj;
            utility.pagination(req, res, StudentCourseModel, querobj, {}, populateObj, function(result) {
                if (utility.isEmpty(result.collection)) {
                    // res.json(result);
                }
                return res.json(result);
            });
        },
        
        /**
         * student list By course
         */
        loadStudentCourse : function(req, res){
        	var courseId = req.params.courseId;
        	var batchId = req.params.batchId;
 	        var studentId = req.params.studentId;
 	        var query = {};
 	        query.course = courseId;
 	        query.batch = batchId;
 	        query.user = studentId;
 	       StudentCourseModel.findOne(query).populate('paymentschedule').populate('course').populate('batch').populate('branch')
 	                             .populate('user').exec(function (err, studentCourse){
 	            if (err) {
 	                return res.status(500).json({
 	                    error: 'Cannot find the studentCourse'
 	                });
 	            }
 	           res.json(studentCourse);
 	       });
        },
        
        /**
         * Loading Batch based on Branch
         * */
        branchStudentCourse : function(req, res){
        	var courseId = req.params.courseId;
        	var branchId = req.params.branchId;
        	
 	        var query = {};
 	        query.course = courseId;
 	        query.branch = branchId;
 	       BatchModel.find(query).populate('paymentschedule').populate('course').populate('batch').populate('branch')
 	                             .populate('user').exec(function (err, studentCourse){
 	            if (err) {
 	                return res.status(500).json({
 	                    error: 'Cannot find the studentCourse'
 	                });
 	            }
 	           res.json(studentCourse);
 	       });
        },
        
        /**
         * Updating Student Course with Branch & Batch 
         * */
        updateStudentCourse : function(req,res){
        	var studentCourse = req.studentCourse;
            studentCourse = _.extend(studentCourse, req.body);
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            studentCourse.save(function(err) {
                if (err) {
                    return validation.exportErrorResponse(res, err, ERRORS.ERROR_1401);
                }
                res.json(studentCourse);
            });
        },
    };

}
