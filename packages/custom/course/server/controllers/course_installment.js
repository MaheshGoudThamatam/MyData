'use strict';

/**
 * Module dependencies.
 */
require('../../../course/server/models/user_course.js');
var mongoose = require('mongoose'),
CourseInstallmentModel = mongoose.model('CourseInstallment'),
	UserCourseModel = mongoose.model('UserCourse'),
    _ = require('lodash');

module.exports = function (CourseInstallment) {

    return {

        /**
         * Find course by id
         */
    	courseInstallment: function (req, res, next, id) {
    		CourseInstallmentModel.load(id, function (err, courseInstallment) {
                if (err) return next(err);
                if (!courseInstallment) return next(new Error('Failed to load courseInstallment ' + id));
                req.courseInstallment = courseInstallment;
                next();
            });
        },
         
        userCourse: function (req, res, next, id) {
    		UserCourseModel.load(id, function (err, userCourse) {
                if (err) return next(err);
                if (!userCourse) return next(new Error('Failed to load userCourse ' + id));
                req.userCourse = userCourse;
                next();
            });
        },
         
        /**
         * Create an courseInstallment
         */
        create: function (req, res) {
            var courseInstallment = new CourseInstallmentModel(req.body);
            courseInstallment.save(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot save the course'
                    });
                }

                res.json(courseInstallment);
            });
        },
        
        /**
         * Update an courseInstallment
         */
        update: function (req, res) {
            var courseInstallment = req.courseInstallment;
            courseInstallment = _.extend(courseInstallment, req.body);
            courseInstallment.save(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot update the courseInstallment'
                    });
                }

                res.json(courseInstallment);
            });
        },
        
        /**
         * Delete a courseInstallment
         */
        destroy: function (req, res) {
            var courseInstallment = req.courseInstallment;
            
            courseInstallment.remove(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete the courseInstallment'
                    });
                }

                res.json(courseInstallment);
            });
        },
        
        /**
         * Show an courseInstallment
         */
        show: function (req, res) {
            res.json(req.courseInstallment);
        },
        
        /**
         * List of courseInstallments
         */
        all: function (req, res) {
        	CourseInstallmentModel.find().exec(function (err, courseInstallments) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the courseInstallments'
                    });
                }

                res.json(courseInstallments);
            });
        }
        
    };
}