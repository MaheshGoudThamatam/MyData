'use strict';

/**
 * Module dependencies.
 */
var uuid = require('node-uuid'), multiparty = require('multiparty'), fs = require('fs');
var mongoose = require('mongoose'), ProjectModel = mongoose.model('Project'), _ = require('lodash');
var uploadUtil = require('../../../../core/system/server/controllers/upload.js');
var validation = require('../../../../core/system/server/controllers/validationUtil.js');
var MESSAGE = require('../../../../core/system/server/controllers/message.js');
var ERRORS = MESSAGE.ERRORS;
var SUCCESS = MESSAGE.SUCCESS;

// var makeDirectory = require('mkdirp');//

var postProjectImage = function (req, res, err, fields, files) {
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
    console.log(destination_file);

    // Server side file type checker.//
    /*
     * if (contentType !== 'image/png' && contentType !== 'image/jpeg') {
     * fs.unlink(tmpPath); return res.status(400).send('Unsupported file
     * type.'); }
     */

    pathObj.temp = tmpPath;
    pathObj.dest = destination_file;
    pathObj.fileName = fileName;
    return pathObj;
}

module.exports = function (ProjectCtrl) {

    return {

        /**
         * Find project by id
         */
        project: function (req, res, next, id) {
            ProjectModel.load(id, function (err, project) {
                if (err) {
                    return next(err);

                }
                if (!project) {
                    return next(new Error('Failed to load project ' + id));
                }
                req.project = project;
                next();
            });
        },

        /**
         * Create an project
         */
        create: function (req, res) {
            console.log(req.body);
            var project = new ProjectModel(req.body);
            // because we set our user.provider to local our models/user.js validation will always be true
            req.assert('projectName', 'You must enter a Project name').notEmpty();
            req.assert('price', 'You must enter price').notEmpty();
            req.assert('currency', 'You must enter Currency').notEmpty();
            req.assert('skills', 'You must enter Skills').notEmpty();
            req.assert('description', 'You must enter Description').notEmpty();
            req.assert('links', 'You must enter Url').notEmpty();
            /* req.assert('projectPicture', 'You must enter Project Picture').notEmpty();*/

            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            project.save(function (err) {
                if (err) {
                    return validation.exportErrorResponse(res, err, ERRORS.ERROR_1401);
                }
                res.json(project);
            });
        },

        /**
         * Update an project
         */
        update: function (req, res) {
            var project = req.project;
            project = _.extend(project, req.body);
            // because we set our user.provider to local our models/user.js validation will always be true
            req.assert('projectName', 'You must enter a Project name').notEmpty();
            req.assert('price', 'You must enter price').notEmpty();
            req.assert('currency', 'You must enter Currency').notEmpty();
            req.assert('skills', 'You must enter Skills').notEmpty();
            req.assert('description', 'You must enter Description').notEmpty();
            req.assert('links', 'You must enter Url').notEmpty();
            /* req.assert('projectPicture', 'You must enter Project Picture').notEmpty();*/

            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            project.save(function (err) {
                if (err) {
                    return validation.exportErrorResponse(res, err, ERRORS.ERROR_1401);
                }

                res.json(project);
            });
        },

        /**
         * Delete a project
         */
        destroy: function (req, res) {
            var project = req.project;

            project.remove(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete the project'
                    });
                }

                res.json(project);
            });
        },

        /**
         * Show an project
         */
        show: function (req, res) {
            res.json(req.project);
        },

        /**
         * List of Projects
         */
        all: function (req, res) {
            ProjectModel.find().exec(function (err, projects) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the projects'
                    });
                }

                res.json(projects);
            });
        },
        uploadProjectPic: function (req, res) {
            console.log('qwerty');
            var form = new multiparty.Form();
            form.parse(req, function (err, fields, files) {
                var filePath = postProjectImage(req, res, err, fields, files);
                var dir = filePath.dest + 'Project/';
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }

                dir = filePath.dest + 'Project/' + req.user._id;

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

                filePath.dirPath = '/system/assets/uploads/Project/' + req.user._id + '/';
                res.json(filePath.dirPath + filePath.fileName);

            });

        }

    };
}
