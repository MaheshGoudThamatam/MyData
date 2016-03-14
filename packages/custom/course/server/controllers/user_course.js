'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	UserCourseModel = mongoose.model('UserCourse'),
	UserModel = mongoose.model('User'),
    _ = require('lodash');

module.exports = function (UserCourse) {

    return {

        /**
         * Find Usercourse by id
         */
    	userCourse: function (req, res, next, id) {
    		UserCourseModel.load(id, function (err, userCourse) {
                if (err) return next(err);
                if (!userCourse) return next(new Error('Failed to load userCourse ' + id));
                req.userCourse = userCourse;
                next();
            });
        },
        user: function (req, res, next, id) {
    		UserModel.load(id, function (err, user) {
                if (err) return next(err);
                if (!user) return next(new Error('Failed to load user ' + id));
                req.user = user;
                next();
            });
        },
    
        
        /**
         * Create an userCourse
         */
        create: function (req, res) {
            var userCourse = new UserCourseModel(req.body);
            if(userCourse.payment_method=='true'){
            	userCourse.payment_method='loan';
            }
            else{
            	userCourse.payment_method='card';
            }
            userCourse.save(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot save the userCourse'
                    });
                }

                res.json(userCourse);
            });
        },
        
        /**
         * Update an userCourse
         */
        update: function (req, res) {
            var userCourse = req.userCourse;
            userCourse = _.extend(userCourse, req.body);
            userCourse.save(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot update the userCourse'
                    });
                }

                res.json(userCourse);
            });
        },
        
        /**
         * Delete a userCourse
         */
        destroy: function (req, res) {
            var userCourse = req.userCourse;
            
            userCourse.remove(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete the userCourse'
                    });
                }

                res.json(userCourse);
            });
        },
        
        /**
         * Show an userCourse
         */
        show: function (req, res) {
            res.json(req.userCourse);
        },
        
        /**
         * List of userCourses
         */
        all: function (req, res) {
        	UserCourseModel.find().populate('course', 'name course_picture').exec(function (err, userCourses) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the userCourses'
                    });
                }

                res.json(userCourses);
            });
        }
        
    };
}