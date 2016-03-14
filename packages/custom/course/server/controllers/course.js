'use strict';

/**
 * Module dependencies.
 */
require('../../../course/server/models/user_course.js');
require('../../../course/server/models/course_mode.js');
//require('../../../../users/server/models/user.js');
var utility = require('../../../../core/system/server/controllers/util.js');
var uuid = require('node-uuid'), multiparty = require('multiparty'), fs = require('fs');
var uploadUtil = require('../../../../core/system/server/controllers/upload.js');
var mongoose = require('mongoose'),
    CourseModel = mongoose.model('Course'),
    UserCourseModel = mongoose.model('UserCourse'),
    CourseModeModel = mongoose.model('CourseMode'),
    UserModel = mongoose.model('User'),
    _ = require('lodash');


/**
*Upload Image Function
**/
var postCourseImage = function(req, res, err, fields, files) {
    var pathObj = {};
    var file = files.file[0];
    var contentType = file.headers['content-type'];
    var tmpPath = file.path;
    var extIndex = tmpPath.lastIndexOf('.');
    var extension = (extIndex < 0) ? '' : tmpPath.substr(extIndex);

    // uuid is for generating unique filenames.it
    var fileName = uuid.v4() + extension;

    var destination_file = __dirname
            + '/../../../../core/system/public/assets/uploads/';
    pathObj.temp = tmpPath;
    pathObj.dest = destination_file;
    pathObj.fileName = fileName;
    return pathObj;
}



module.exports = function (Course) {

    return {



        /**
        *  Upload banner image
        **/

        uploadCourseBanner : function(req, res) {

            var form = new multiparty.Form();
            form.parse(req, function(err, fields, files) {
                var fileValidation= uploadUtil.valid(req, res, err, fields, files);
                if(fileValidation.errorCode != "000"){
                    return res.status(400).json(fileValidation);
                }
                var filePath =uploadUtil.postImage(req, res, err, fields, files);
                uploadUtil.createSubFolder(filePath.dest +'Course/');
                var dir = filePath.dest +'Course/';
                uploadUtil.createSubFolder(dir);
                var relativePath= 'Course/';
                dir = filePath.dest + relativePath;
                uploadUtil.createSubFolder(dir);
                var filedir = dir + filePath.fileName;
                var dirPath='/system/assets/uploads/';
                var result={};
                var is = fs.createReadStream(filePath.temp);
                var os = fs.createWriteStream(filedir);
                is.pipe(os);
                is.on('end', function() {
                    fs.unlinkSync(filePath.temp);
                });

                result.picture = filePath.dirPath + filePath.fileName;
                result.thumbpicture = uploadUtil.createThumnail(dir, false, 'thumb', filePath.fileName, 50, 50, relativePath, false);
                result.thumb150picture = uploadUtil.createThumnail(dir, false, 'thumb150', filePath.fileName, 150, 150, relativePath, false);
                filePath.dirPath = '/system/assets/uploads/Course/';
                        res.json(filePath.dirPath + filePath.fileName);

        });

        },


        /**
        *Upload Course Icon
        **/

        /**
        *  Upload banner image
        **/

        uploadCourseIcon : function(req, res) {

            var form = new multiparty.Form();
            form.parse(req, function(err, fields, files) {
                var fileValidation= uploadUtil.valid(req, res, err, fields, files);
                if(fileValidation.errorCode != "000"){
                    return res.status(400).json(fileValidation);
                }
                var filePath =uploadUtil.postImage(req, res, err, fields, files);
                uploadUtil.createSubFolder(filePath.dest +'Course/');
                var dir = filePath.dest +'Course/';
                uploadUtil.createSubFolder(dir);
                var relativePath= 'Course/';
                dir = filePath.dest + relativePath;
                uploadUtil.createSubFolder(dir);
                var filedir = dir + filePath.fileName;
                var dirPath='/system/assets/uploads/';
                var result={};
                var is = fs.createReadStream(filePath.temp);
                var os = fs.createWriteStream(filedir);
                is.pipe(os);
                is.on('end', function() {
                    fs.unlinkSync(filePath.temp);
                });

                result.picture = filePath.dirPath + filePath.fileName;
                result.thumbpicture = uploadUtil.createThumnail(dir, false, 'thumb', filePath.fileName, 50, 50, relativePath, false);
                result.thumb150picture = uploadUtil.createThumnail(dir, false, 'thumb150', filePath.fileName, 150, 150, relativePath, false);
                filePath.dirPath = '/system/assets/uploads/Course/';
                        res.json(filePath.dirPath + filePath.fileName);

        });

        },

        /**
         * Find course by id
         */
        course: function(req, res, next, id) {
            CourseModel.load(id, function(err, course) {
                if (err) {console.log(err);return next(err);}
                if (!course) return next(new Error('Failed to load course ' + id));
                req.course = course;
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
        user: function (req, res, next, id) {
            UserModel.load(id, function (err, user) {
                if (err) return next(err);
                if (!user) return next(new Error('Failed to load user ' + id));
                req.user = user;
                next();
            });
        },
         
        /**
         * Create an course
         */
        create: function (req, res) {
            var course = new CourseModel(req.body);
            req.assert('name', 'You must enter a Course name').notEmpty();
            req.assert('description', 'You must enter Description').notEmpty();
            req.assert('qualification', 'You must enter Qualification equired').notEmpty();
            req.assert('course_startDate', 'You must select Course start date').notEmpty();
            
            var errors = [];
            errors.concat(req.validationErrors());
            course.courseSkill.map(function(cSkill) {
                if(cSkill.target_value <= cSkill.pre_requisite) {
                    var valError = {
                        msg: "Target value must be greater than pre requisite",
                        param: "target_value"
                    };
                    errors.push(valError);
                }
                return cSkill;
            });
            if (errors.length > 0) {
                return res.status(400).send(errors);
            }
            course.save(function (err) {
                if (err) {
                    switch (err.code) {
                    case 11000:
                    case 11001:
                    res.status(400).json([{
                        msg: 'Course name already taken',
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
                        console.log('mod'+modelErrors);
                        res.status(400).json(modelErrors);
                    }
                }
                return res.status(400);
                }

                res.json(course);
            });
        },
        
        /**
         * Update an course
         */
        update: function (req, res) {
            var course = req.course;
            course = _.extend(course, req.body);
            course.save(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot update the course'
                    });
                }

                res.json(course);
            });
        },
        
        /**
         * Delete a course
         */
        destroy: function (req, res) {
            var course = req.course;
            
            course.remove(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete the course'
                    });
                }

                res.json(course);
            });
        },
        
        /**
         * Show an course
         */
        show: function (req, res) {
            res.json(req.course);
        },
        
        /**
         * List of Courses
         */
        all: function (req, res) {
            CourseModel.find().populate('usercourse', 'payment_method course').populate('coursemode', 'mode deposit_amount').exec(function (err, courses) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the courses'
                    });
                }

                res.json(courses);
            });
        },


     /**
      * Pagination
      * */
    
        loadCoursePagination : function(req, res) {
            var populateObj = {};
            utility.pagination(req, res, CourseModel, {}, {}, populateObj, function(result){
               if(utility.isEmpty(result.collection)){
               }
               return res.json(result);
            });
        }    
    };
}