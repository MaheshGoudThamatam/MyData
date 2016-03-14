'use strict';

/**
 * Module dependencies.
 */
var uuid = require('node-uuid'), multiparty = require('multiparty'), fs = require('fs');
var mongoose = require('mongoose'),
    MentorprojectModel = mongoose.model('Mentorproject'),
    ProjectRequestModel = mongoose.model('ProjectRequest'),
    MentorRequestModel = mongoose.model('MentorRequest'),
//ConfirmProjectMentorModel = mongoose.model('ConfirmProjectMentor'),
    _ = require('lodash');
var uploadUtil = require('../../../../core/system/server/controllers/upload.js');
var utility = require('../../../../core/system/server/controllers/util.js');
var validation = require('../../../../core/system/server/controllers/validationUtil.js');
var MESSAGE = require('../../../../core/system/server/controllers/message.js');
var ERRORS = MESSAGE.ERRORS;
var SUCCESS = MESSAGE.SUCCESS;
var postTaskImage = function (req, res, err, fields, files) {
    var pathObj = {};
    var file = files.file[0];
    var contentType = file.headers['content-type'];
    var tmpPath = file.path;
    var extIndex = tmpPath.lastIndexOf('.');
    var extension = (extIndex < 0) ? '' : tmpPath.substr(extIndex);
    var fileName = uuid.v4() + extension;
    var destination_file = __dirname
        + '/../../../../core/system/public/assets/uploads/';
    pathObj.temp = tmpPath;
    pathObj.dest = destination_file;
    pathObj.fileName = fileName;
    return pathObj;
}

module.exports = function (MentorprojectCtrl) {
    return {
        uploadTaskImage: function (req, res) {
            var form = new multiparty.Form();
            form.parse(req, function (err, fields, files) {
                var filePath = postTaskImage(req, res, err, fields, files);
                var dir = filePath.dest + 'Mentorproject/';
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }
                dir = filePath.dest + 'Mentorproject/' + req.user._id;
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }
                dir = dir + '/' + filePath.fileName;
                var is = fs.createReadStream(filePath.temp);
                var os = fs.createWriteStream(dir);
                is.pipe(os);
                is.on('end', function () {
                    fs.unlinkSync(filePath.temp);
                });
                filePath.dirPath = '/system/assets/uploads/Mentorproject/' + req.user._id + '/';
                res.json(filePath.dirPath + filePath.fileName);
            });
        },

        /**
         * Find task by id
         */
        mentorproject: function (req, res, next, id) {
            MentorprojectModel.load(id, function (err, mentorproject) {
                if (err) {
                    return next(err);
                }
                if (!mentorproject) {
                    return next(new Error('Failed to load mentorproject ' + id));
                }
                req.mentorproject = mentorproject;
                next();
            });
        },

        /**
         * Create an task
         */
        create: function (req, res) {
            var mentorproject = new MentorprojectModel(req.body);
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            mentorproject.save(function (err) {
                if (err) {
                    return validation.exportErrorResponse(res, err, ERRORS.ERROR_1401);
                }

                res.json(mentorproject);
            });
        },

        /**
         * Update an task
         */
        update: function (req, res) {
            var mentorproject = req.mentorproject;
            mentorproject = _.extend(mentorproject, req.body);

            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }

            mentorproject.save(function (err) {
                if (err) {
                    return validation.exportErrorResponse(res, err, ERRORS.ERROR_1401);
                }

                res.json(mentorproject);
            });
        },

        /**
         * Delete a task
         */
        destroy: function (req, res) {
            var mentorproject = req.mentorproject;
            mentorproject.remove(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete the mentorproject'
                    });
                }

                res.json(mentorproject);
            });
        },

        /**
         * Show an task
         */
        show: function (req, res) {
            res.json(req.mentorproject);
        },

        /**
         * List of tasks
         */
        all: function (req, res) {
            MentorprojectModel.find().exec(function (err, mentorprojects) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the mentorprojects'
                    });
                }

                res.json(mentorprojects);
            });
        },
        /**
         * Find project by id
         */
        project: function (req, res, next, id) {
            MentorRequestModel.load(id, function (err, mentorRequest) {
                if (err) {
                    return next(err);
                }
                if (!mentorRequest) {
                    return next(new Error('Failed to load Project Request ' + id));
                }
                req.mentorRequest = mentorRequest;
                next();
            });
        },

        /**
         * Update a Mentor Request Status
         */
        updateMentorRequestStatus: function (req, res) {
            var mentorRequest = req.mentorRequest;
            var acceptedMentor = req.mentorRequest;
            var projectRequest = _.extend(mentorRequest, req.body);
            var async = require("async");

            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }

            projectRequest.save(function (err) {
                if (err) {
                    res.status(400).json(err);
                }
                MentorRequestModel.find({project: mentorRequest.project}).exec(function (err, mentorRequests) {
                    if (err) {
                        return res.status(500).json({
                            error: 'Cannot list the projectRequests'
                        });
                    }
                    async.each(mentorRequests, function (mentorRequestObj, callback) {
                        if (JSON.stringify(acceptedMentor.user) !== JSON.stringify(mentorRequestObj.user)) {
                            mentorRequestObj.user_status = 'Declined';
                            mentorRequestObj.project_status = 'Close';
                            mentorRequestObj.save(function (err) {
                                if (err) {
                                    console.log("ERROR : " + err);
                                }
                            });
                        }
                    });

                });
                res.json(projectRequest);
            });
        },

        /**
         * Update a Mentor Request Status Decline
         */
        updateMentorRequestStatusDecline: function (req, res) {
            var mentorRequest = req.mentorRequest;
            var projectRequest = _.extend(mentorRequest, req.body);

            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }

            projectRequest.save(function (err) {
                if (err) {
                    res.status(400).json(err);
                }
                res.json(projectRequest);
            });
        },

        /**
         * List of Mentor for a specific project, based on status
         */
        loadMentorProjectDetails: function (req, res) {
            var populateObj = {};
            utility.pagination(req, res, MentorprojectModel, {}, {}, populateObj, function (result) {
                if (utility.isEmpty(result.collection)) {
                    //res.json(result);
                }
                return res.json(result);
            });
        }

    };
}