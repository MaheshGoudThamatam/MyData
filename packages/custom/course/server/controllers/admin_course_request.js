'use strict';
/**
 * Module dependencies.
 */
require('../../../../custom/course/server/models/course_student.js');
require('../../../../custom/course/server/models/course_request.js');
var utility = require('../../../../core/system/server/controllers/util.js');
var http = require('http');
var async = require('async');
var mongoose = require('mongoose'),
    CourseModel = mongoose.model('Course'),
    UserModel = mongoose.model('User'),
    CourseRequestModel = mongoose.model('CourseRequest'),
    StudentCourseModel = mongoose.model('StudentCourse'),
    _ = require('lodash');
var nodemailer = require('nodemailer');
var config = require('meanio').loadConfig();
/**
 * Send email for accepting the students for a particular course
 */
function sendMail(mailOptions) {
    var transport = nodemailer.createTransport(config.mailer);
    transport.sendMail(mailOptions, function(err, response) {
        if (err) return err;
        return response;
    });
}
module.exports = function(AdminCourseCtrl) {
    return {
        /**
         * Find course by id
         */
        course: function(req, res, next, id) {
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
         * Create student course
         */
        create: function(req, res) {
            var studentCourse = new StudentCourseModel(req.body);
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
        /**
         * Delete student course 
         */
        destroy: function(req, res) {
            var studentCourse = req.studentCourse;
            studentCourse.remove(function(err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete'
                    });
                }
                res.json(studentCourse);
            });
        },
        /**
         * Show student course
         */
        show: function(req, res) {
            res.json(req.studentCourse);
        },
        /**
         * List student course
         */
        all: function(req, res) {
            StudentCourseModel.find().exec(function(err, studentCourses) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the'
                    });
                }
                res.json(studentCourses);
            });
        },
        /**
         * List of course request as by pagination
         */
        courseRequestListByPagination: function(req, res) {
            var populateObj = {
                'user': '',
                'course': '',
                'branch': '',
                'assign_Test': '',
                'paymentscheme': '',
                'batch': ''
            };
            var query = {};
            if (req.query.userStatus !== 'All') {
                query.user_status = req.query.userStatus;
            }
            utility.pagination(req, res, CourseRequestModel, query, {}, populateObj, function(result) {
                if (utility.isEmpty(result.collection)) {}
                return res.json(result);
            });
        },
        /**
         * Find course request by id
         */
        courseRequest: function(req, res, next, id) {
            CourseRequestModel.load(id, function(err, courseRequest) {
                if (err) {
                    return next(err);
                }
                if (!courseRequest) {
                    return next(new Error('Failed to load courseRequest ' + id));
                }
                req.courseRequest = courseRequest;
                next();
            });
        },
        /**
         * Fetch course request
         */
        loadCourseRequestDetails: function(req, res) {
            var courseRequest = req.courseRequest;
            var query = {};
            query._id = courseRequest._id;
            CourseRequestModel.findOne(query).populate('course').populate('paymentscheme').populate('assign_Test').deepPopulate(
                ['user', 'user.address', 'user.qualification_details', 'user.additional_documents', 'user.experience_details', 'user.references', 'user.skills']).exec(function(err, courseRequest) {
                if (err) {
                    return next(err);
                }
                if (!courseRequest) {
                    return next(new Error('Failed to load courseRequest ' + courseRequest._id));
                }
                res.json(courseRequest);
            });
        },
        /**
         * Confirm User for the course applied for
         */
        confirmUserAsCourseRequest: function(req, res) {
            var courseRequest = req.courseRequest;
            courseRequest = _.extend(courseRequest, req.body);
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            courseRequest.save(function(err) {
                if (err) {
                    res.status(400).json(err);
                } else {
                    CourseRequestModel.findOne({
                        _id: courseRequest._id
                    }, function(err, courseRequest) {
                        if (err) {
                            console.log(err);
                        } else {
                            var confirmMail = courseRequest.user.email;
                            var mailOptions = {
                                from: config.emailFromWelcome,
                                createTextFromHtml: true,
                                subject: 'CodersTrust Confirmation for Course'
                            };
                            mailOptions.to = confirmMail;
                            var courseConfirmation = ['This email is for course confirmation', 'Dear <b>' + courseRequest.user.username + '</b>,', 'This is your Branch'];
                            courseConfirmation.push('This is your Batch');
                            mailOptions.html = courseConfirmation.join('<br><br>');
                            sendMail(mailOptions);
                            res.sendStatus(200);
                        }
                    }).populate('user', '');
                }
            });
        },
        loadCoursesBasedonUser: function(req, res) {
            var userId = req.query.userId;
            var studentcourses = {};
            StudentCourseModel.find({
                user: userId
            }).populate('paymentschedule').populate('course').populate('batch').populate('branch').populate('user').populate('').exec(function(err, studentcourses) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the zone'
                    });
                }
                res.json(studentcourses);
            });
        },
        /**
        * Pagination API Pass filters/query from frontend in req.query.obj in form of key and value pair (ex: req.query.obj = {xxx : xxxx}- frontend)
        **/
        listPaginationStudentCourses: function(req, res) {
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
    }
}