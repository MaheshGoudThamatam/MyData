'use strict';

/**
 * Module dependencies.
 */
var async = require('async');
require('../models/city.js');
var uploadUtil = require('../../../../core/system/server/controllers/upload.js');
var utility = require('../../../../core/system/server/controllers/util.js');
var validation = require('../../../../core/system/server/controllers/validationUtil.js');
var MESSAGE = require('../../../../core/system/server/controllers/message.js');
var ERRORS = MESSAGE.ERRORS;
var SUCCESS = MESSAGE.SUCCESS;
var uuid = require('node-uuid'), multiparty = require('multiparty'), fs = require('fs');

var mongoose = require('mongoose'),
    BranchModel = mongoose.model('Branch'),
    CityModel = mongoose.model('City'),
    ZoneModel = mongoose.model('Zone'),
    UserModel = mongoose.model('User'),
    _ = require('lodash');


var postBranchImage = function (req, res, err, fields, files) {
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
};

function updateBranch(user, branch, callback) {
    BranchModel.load(branch._id, function (err, branch) {
        UserModel.findOne({_id: user._id}).exec(function (err, user) {
            user.branch = validation.insertInArray(user.branch, branch);
            user.save(function (err) {
                if (err) {
                    console.log("Inside User admin save:Error " + err);
                }
                if (callback) {
                    callback();
                }
            });
        });
    });
}

module.exports = function (Branch) {

    return {

        /**
         * Find city by id
         */
        city: function (req, res, next, id) {

            CityModel.load(id, function (err, city) {
                if (err) return next(err);
                if (!city) return next(new Error('Failed to load city ' + id));
                req.city = city;
                next();
            });
        },

        /**
         * Find branch by id
         */
        branch: function (req, res, next, id) {
            BranchModel.load(id, function (err, branch) {
                if (err) return next(err);
                if (!branch) return next(new Error('Failed to load branch ' + id));
                req.branch = branch;
                next();
            });
        },

        /**
         * Create a branch
         */

        create: function (req, res) {

            var adminList = req.body.adminList;
            delete req.body.adminList;

            var branch = new BranchModel(req.body);
            branch.city = new CityModel(req.city);
            var cityId = req.body.cityId;

            req.assert('branchName', 'You must enter a branch name').notEmpty();
            req.assert('branchCode', 'You must enter branch code').notEmpty();

            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }

            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            branch.save(function (err, branch) {
                if (err) {
                    return validation.exportErrorResponse(res, err, ERRORS.ERROR_1104);
                }
                CityModel.findOne({ _id: cityId }, function (err, cityDocument) {
                    cityDocument.branch.push(branch._id);
                    cityDocument.save(function (err, items) {
                        if (err) {
                            console.log(err);
                        }
                    });
                    async.each(adminList, function (user, callback) {
                        updateBranch(user, branch)
                    });
                    res.json(branch);
                });
            });
        },
        /**
         * Update a branch
         */

        update: function (req, res) {
            var adminList = req.body.adminList;
            delete req.body.adminList;

            var branch = req.branch;
            branch = _.extend(branch, req.body);

            req.assert('branchName', 'You must enter a branch name').notEmpty();
            req.assert('branchCode', 'You must enter branch code').notEmpty();

            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            UserModel.find({
                branch: {$elemMatch: {$in: [branch._id] }}
            }).populate('role', 'name').populate('city', 'name').exec(function (err, userList) {
                for (var i = 0; i < userList.length; i++) {
                    var found = false;
                    for (var j = 0; j < adminList.length; j++) {
                        if (userList[i]._id === adminList[j]._id) {
                            found = true;
                        }
                    }
                    if (!found) {
                        updateBranch(userList[i], branch);
                    }
                }
            });
            branch.save(function (err, branch) {
                if (err) {
                    return validation.exportErrorResponse(res, err, ERRORS.ERROR_1104);
                }
                async.each(adminList, function (user, callback) {
                    updateBranch(user, branch)
                });
                res.json(branch);
            });
        },

        /**
         * Delete a branch
         */

        destroy: function (req, res) {
            var branch = req.branch;
            UserModel.find({
                city: {$elemMatch: {$in: [branch._id] }}
            }).populate('role', 'name').populate('city', 'name').exec(function (err, userList) {
                var counter = 0;
                async.each(userList, function (user, callback) {
                    updateBranch(user, branch, function () {
                        counter++;
                        if (counter == userList.length) {
                            CityModel.findOne({ _id: branch.city._id }).exec(function (err, cityDocument) {
                                cityDocument.branch=validation.insertInArray(cityDocument.branch, branch);
                                cityDocument.save(function (err, items) {
                                    if (err) {
                                        console.log(err);
                                    }
                                });
                                branch.remove(function (err) {
                                    if (err) {
                                        return res.status(500).json({
                                            error: 'Cannot delete the country'
                                        });
                                    }
                                    res.json(city);
                                });
                            });
                        }
                    });
                });
            });
        },

        /**
         * Show a branch
         */
        show: function (req, res) {
            res.json(req.branch);
        },

        /**
         * List of Branches
         */
        all: function (req, res) {
            var cityId = req.city._id;
            BranchModel.find({city: cityId}).populate('course').populate('mentor').populate('course').exec(function (err, branches) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the branches'
                    });
                }

                res.json(branches);
            });
        },

        allBranch: function (req, res) {
            BranchModel.find({}).populate('course').deepPopulate(['course','city','city.cityName']).exec(function (err, branches) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the branches'
                    });
                }

                res.json(branches);
            });
        },

        loadZoneNCountry: function (req, res) {
            var cityId = req.query.cityId;
            var zoneCountryObj = {};
            CityModel.findOne({_id: cityId}).exec(function (err, city) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the zone'
                    });
                }
                ZoneModel.findOne({_id: city.zone}).exec(function (err, zone) {
                    if (err) {
                        return res.status(500).json({
                            error: 'Cannot list the zone'
                        });
                    }
                    zoneCountryObj.zone = zone;
                    zoneCountryObj.cityId = city._id;
                    res.json(zoneCountryObj);
                });
            });
        },

        uploadBranchPic: function (req, res) {
            var form = new multiparty.Form();
            form.parse(req, function (err, fields, files) {
                var filePath = uploadUtil.postImage(req, res, err, fields, files);
                uploadUtil.createSubFolder(filePath.dest + 'Branch/');

                var dir = filePath.dest + 'Branch/';
                uploadUtil.createSubFolder(dir);

                var relativePath = 'Branch/';
                dir = filePath.dest + relativePath;
                uploadUtil.createSubFolder(dir);

                var filedir = dir + filePath.fileName;
                var dirPath = '/system/assets/uploads/';
                var result = {};

                var is = fs.createReadStream(filePath.temp);
                var os = fs.createWriteStream(filedir);
                is.pipe(os);
                is.on('end', function () {
                    fs.unlinkSync(filePath.temp);
                });

                filePath.dirPath = '/system/assets/uploads/Branch/';

                result.picture = filePath.dirPath + filePath.fileName;
                result.thumbpicture = uploadUtil.createThumnail(dir, false, 'thumb', filePath.fileName, 50, 50, relativePath, false);
                result.thumb150picture = uploadUtil.createThumnail(dir, false, 'thumb150', filePath.fileName, 150, 150, relativePath, false);

                res.json(result);
            });
        },

        loadBranchesonCourses: function (req, res) {
            var courseId = req.query.courseId;
            var branchesCoursesObj = {};
            BranchModel.find({course: courseId}).populate('course').populate('mentor').exec(function (err, branches) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the zone'
                    });
                }

                res.json(branches);
            });
        },
        /**
         * List of role as by pagination
         */
        branchListByPagination: function (req, res) {
            var populateObj = {
                'course': ''
            };
            utility.pagination(req, res, BranchModel, {}, {}, populateObj, function (result) {
                if (utility.isEmpty(result.collection)) {
                    //res.json(result);
                }
                return res.json(result);
            });
        }

    };
}
       