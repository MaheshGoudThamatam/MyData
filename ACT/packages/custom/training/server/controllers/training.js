'use strict';
/**
 * <Author:Akash Gupta>
 * <Date:22-06-2016>
 * <Functions: Create, Update, GetAll, GetSingle, Hard Delete for Training>
 * @params: {req.body}, {req.training}       Contain new or updated details of Training
 */
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    async = require('async'),
    logger = require('../../../../contrib/meanio-system/server/controllers/logs.js'),
    configuration = require('../../../../custom/actsec/server/config/config.js'),
    _ = require('lodash');
var UserModel = mongoose.model('User');

module.exports = function(Training,actsec, io) {
	
	var notif = require('../../../actsec/server/controllers/notification.js')(actsec, io);
    return {
        /**
         * Find Training by id
         */
        training: function(req, res, next, id) {
            require('../models/training')(req.companyDb);
            var TrainingModel = req.companyDb.model('Training');
            TrainingModel.load(id, function(err, training) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "training", "Failed to fetch training", {
                        _id: id
                    }, err);
                    return next(err);
                }
                if (!training) {
                    logger.error(req, req.user.company.company_name, "training", "Failed to load training", {
                        _id: id
                    }, err);
                    return next(new Error('Failed to load training ' + id));
                }
                req.training = training;
                next();
            });
        },
        /**
         * Create of Training
         */
        create: function(req, res) {
            require('../models/training')(req.companyDb);
            var TrainingModel = req.companyDb.model('Training');
            req.body.createdBy = req.user._id;
            req.body.company = req.user.company._id;
            var training = new TrainingModel(req.body);
            req.assert('training_name', 'Please enter Training name').notEmpty();
            req.assert('shortName', 'Please enter short name').notEmpty();
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            training.save(function(err) {
                if (err) {
                    switch (err.code) {
                        case 11000:
                        case 11001:
                            return res.status(400).json([{
                                msg: ' Training already exists',
                                param: 'training_name'
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
                            }
                            logger.error(req, req.user.company.company_name, "training", "Failed to create training", training, err);
                            return res.status(400).json(modelErrors);
                    }
                    logger.error(req, req.user.company.company_name, "training", "Failed to create training", training, err);
                    return res.status(500).json(err);
                } else {
                	notif.notifyRole('New training has been created in ' + req.user.company.company_name , 'icon-book-open', '/trainings/manage', configuration.roles.SECURITY_MANAGER,req.user.company._id, function() {});
                    logger.log(req, req.user.company.company_name, "training", "Training created successfully", training);
                    return res.json(training);
                }
            });
        },
        /**
         * Update a Training
         */
        update: function(req, res) {
            require('../models/training')(req.companyDb);
            var TrainingModel = req.companyDb.model('Training');
            req.body.updatedBy = req.user._id;
            var training_before = req.training.toObject();
            var training = req.training;
            training = _.extend(training, req.body);
            req.assert('training_name', 'Please enter Training name').notEmpty();
            req.assert('shortName', 'Please enter short name').notEmpty();
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            training.save(function(err) {
                if (err) {
                    switch (err.code) {
                        case 11000:
                        case 11001:
                            return res.status(400).json([{
                                msg: ' Training already exists',
                                param: 'training_name'
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
                            }
                            logger.error(req, req.user.company.company_name, "training", "Failed to update training", training, err);
                            return res.status(400).json(modelErrors);
                    }
                    logger.error(req, req.user.company.company_name, "training", "Failed to update training", training, err);
                    return res.status(500).json(err);
                } else {
                    logger.delta(req, req.user.company.company_name, "training", "Training updated successfully", training_before, training);
                    return res.json(training);
                }
            })
        },
        /**
         * Show a Training
         */
        show: function(req, res) {
            require('../models/training')(req.companyDb);
            var TrainingModel = req.companyDb.model('Training');
            return res.json(req.training);
        },
        /**
         * List of Trainings
         */
        all: function(req, res) {
            require('../models/training')(req.companyDb);
            var TrainingModel = req.companyDb.model('Training');
            TrainingModel.find(function(err, training) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "training", "Failed to fetch training", err);
                    return res.status(400).json({
                        error: 'Cannot list the training'
                    });
                }
                return res.json(training);
            });
        },
        /**
         * Hard Delete the Training
         */
        destroy: function(req, res) {
            require('../models/training')(req.companyDb);
            var TrainingModel = req.companyDb.model('Training');
            var training = req.training;
            UserModel.find({
                trainings: req.training._id
            }, function(err, users) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "users", "Failed to list users", {
                        trainings: req.training._id
                    }, err);
                    return res.status(500).json({
                        error: 'Cannot list the Users'
                    });
                }
                async.eachSeries(users, function(user, callback) {
                    user.trainings = user.trainings.filter(function(item) {
                        return JSON.stringify(item) !== JSON.stringify(req.training._id);
                    });
                    user.save(function(err) {
                        if (err) {
                            logger.error(req, req.user.company.company_name, "user", "Failed to save user", user, err);
                            return res.status(400).json({
                                error: 'Cannot Save the User'
                            });
                        } else {
                            callback();
                        }
                    });
                }, function(err) {
                    training.remove(function(err) {
                        if (err) {
                            logger.error(req, req.user.company.company_name, "training", "Failed to delete training", training, err);
                            return res.status(400).json({
                                error: 'Cannot delete the Training'
                            });
                        } else {
                            logger.log(req, req.user.company.company_name, "training", "Training deleted successfully", training);
                            return res.json(training);
                        }
                    });
                });
            });
        },
        allUser: function(req, res) {
            UserModel.find({
                company: req.user.company._id
            }, function(err, users) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "training", "Failed to fetch users", {
                        company: req.user.company._id
                    }, err);
                    return res.status(400).send(err);
                } else {
                    return res.status(200).json(users);
                }
            });
        },
        getallGroupTrainings: function(req, res) {
            var userTrainingsList = [];
            require('../models/training')(req.companyDb);
            var TrainingModel = req.companyDb.model('Training');
            TrainingModel.find({}).exec(function(err, trainings) {
                if (err) {
                    res.status(400).json({
                        "trainings": "Not able to find trainings"
                    });
                } else {var userTrainings = {};

                    async.eachSeries(trainings, function(training, cb) {
                        userTrainings[training._id] = {};
                        userTrainings[training._id]['name'] = training.training_name;
                        userTrainings[training._id]['count'] = 0;
                        cb();
                    }, function(err) {
                    async.eachSeries(trainings, function(training, Trainingcallback) {
                        UserModel.find({
                           'trainings':  training._id
                        }).exec(function(err, userslist){
                            userTrainings[training._id]['count'] = userslist.length;
                            userTrainingsList.push(userTrainings[training._id]);
                            Trainingcallback();
                        })
                    }, function(err) {
                        res.status(200).json(userTrainingsList);
                    });
                    });
                }
            });
        }
    };
}
