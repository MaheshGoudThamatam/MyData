'use strict';

/**
 * Module dependencies.
 */
require('../../../course/server/models/user_course.js');
var mongoose = require('mongoose'),
    CourseModeModel = mongoose.model('CourseMode'),
	CourseModel = mongoose.model('Course'),
	_ = require('lodash');

module.exports = function (CourseMode) {

    return {

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
         
        courseMode: function (req, res, next, id) {
        	CourseModeModel.load(id, function (err, courseMode) {
                if (err) return next(err);
                if (!courseMode) return next(new Error('Failed to load courseMode ' + id));
                req.courseMode = courseMode;
                next();
            });
        },
         
        /**
         * Create an courseMode
         */
        create: function (req, res) {
            var courseMode = new CourseModeModel(req.body);
            courseMode.save(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot save the courseMode'
                    });
                }

                res.json(courseMode);
            });
        },
        
        /**
         * Update an courseMode
         */
        update: function (req, res) {
            var courseMode = req.courseMode;
            courseMode = _.extend(courseMode, req.body);
            courseMode.save(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot update the courseMode'
                    });
                }

                res.json(courseMode);
            });
        },
        
        /**
         * Delete a courseMode
         */
        destroy: function (req, res) {
            var courseMode = req.courseMode;
            
            courseMode.remove(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete the courseMode'
                    });
                }

                res.json(courseMode);
            });
        },
        
        /**
         * Show an courseMode
         */
        show: function (req, res) {
            res.json(req.courseMode);
        },
        
        /**
         * List of courseMode
         */
        all: function (req, res) {
        	CourseModeModel.find().exec(function (err, courseModes) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the courseModes'
                    });
                }

                res.json(courseModes);
            });
        }
        
    };
}