'use strict';
/**
 * <Author:Akash Gupta>
 * <Date:27-06-2016>
 * <Functions: Create, Update, GetAll, GetSingle, Soft Delete & undo soft delete for Guarding>
 * @params: req.body & req.accessSystem       Contain new or updated details of Guarding
 */
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    _ = require('lodash'),
    path = require('path'),
    mime = require('mime'),
    uuid = require('node-uuid'),
    multiparty = require('multiparty'),
    upload = require('../../../../contrib/meanio-system/server/services/bulkUpload.js'),
    logger = require('../../../../contrib/meanio-system/server/controllers/logs.js'),
    configuration = require('../../../../custom/actsec/server/config/config.js'),
    fs = require('fs');
module.exports = function(Guarding, actsec, io) {

    var notif = require('../../../actsec/server/controllers/notification.js')(actsec, io);

    return {
        /**
         * Find Building by id
         */
        building: function(req, res, next, id) {
            require('../../../building/server/models/building')(req.companyDb);
            var BuildingModel = req.companyDb.model('Building');
            BuildingModel.load(id, function(err, building) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "guarding", "Failed to fetch building", {
                        _id: id
                    }, err);
                    return next(err);
                }
                if (!building) {
                    logger.error(req, req.user.company.company_name, "guarding", "Failed to load building", {
                        _id: id
                    }, err);
                    return next(new Error('Failed to load Building ' + id));
                }
                req.building = building;
                next();
            });
        },
        /**
         * Find Guarding by id
         */
        guarding: function(req, res, next, id) {
            require('../models/guarding')(req.companyDb);
            var GuardingModel = req.companyDb.model('Guarding');
            GuardingModel.load(id, function(err, guarding) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "guarding", "Failed to fetch guarding", {
                        _id: id
                    }, err);
                    return next(err);
                }
                if (!guarding) {
                    logger.error(req, req.user.company.company_name, "guarding", "Failed to load guarding", {
                        _id: id
                    }, err);
                    return next(new Error('Failed to load Guarding ' + id));
                }
                req.guarding = guarding;
                next();
            });
        },
        /**
         * Create of Guarding
         */
        create: function(req, res) {
            req.body.createdBy = req.user._id;
            require('../models/guarding')(req.companyDb);
            var GuardingModel = req.companyDb.model('Guarding');
            var guarding = new GuardingModel(req.body);
            req.assert('guarding_provider', 'Please enter guarding provider').notEmpty();
            req.assert('contact_person.name', 'Please enter contact person name').notEmpty();
            req.assert('contact_person.email', 'Please enter contact person email').isEmail();
            req.assert('contact_person.contact_number', 'Please enter contact person number').notEmpty();
            req.assert('duration', 'Please enter valid duration of service per month').matches('^[0-9]*$');
            req.assert('cost', 'Invalid Cost').matches('^[0-9]*$');
            req.assert('description', 'Please enter description for guarding service').notEmpty();
            req.assert('budget', 'Invalid Budget').matches('^[0-9]*$');
            req.assert('guarding_responsible.name', 'Please enter responsible person name').notEmpty();
            req.assert('guarding_responsible.email', 'Please enter responsible person email').isEmail();
            req.assert('guarding_responsible.contact_number', 'Please enter responsible person contact number').notEmpty();
            req.assert('building_providers.name', 'Please enter external person name').notEmpty();
            req.assert('building_providers.email', 'Please enter external person email').isEmail();
            req.assert('building_providers.contact_number', 'Please enter external person contact number').notEmpty();
            //Need further clarification
            // req.assert('contract', 'Please upload contract').notEmpty();
            req.assert('contract_validity', 'Please enter validity of contract').notEmpty();
            req.assert('notice_period', 'Please enter notice period of contract').notEmpty();
            // req.assert('user_manual', 'Please upload user manual').notEmpty();
            if(guarding.contractreminder){
            	req.assert('contractPersonEmail', 'Please enter contract person email').isEmail();
            }
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            guarding.save(function(err) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "guarding", "Failed to create guarding", guarding, err);
                    return res.status(500).send(err);
                } else {
                    require('../../../../custom/building/server/models/building.js')(req.companyDb);
                    var BuildingModel = req.companyDb.model('Building');
                    BuildingModel.findOne({
                        _id: guarding.building
                    }, function(err, building) {
                        if (err) {
                            logger.error(req, req.user.company.company_name, "guarding", "Failed to fetch building", {
                                _id: guarding.building
                            }, err);
                        } else {
                            notif.notifyRole('New guarding created for [' + building.building_name + ']', 'icon-shield', '/building/' + guarding.building + '/guards', configuration.roles.SECURITY_MANAGER,req.user.company._id, function() {});
                            logger.log(req, req.user.company.company_name, "guarding", "Guarding created successfully", guarding);
                            return res.json(guarding);
                        }
                    });
                }
            })
        },
        /**
         * Update a Guarding
         */
        update: function(req, res) {
            req.body.updatedBy = req.user._id;
            require('../models/guarding')(req.companyDb);
            var GuardingModel = req.companyDb.model('Guarding');
            var guarding_before = req.guarding.toObject();
            var guarding = req.guarding;
            guarding = _.extend(guarding, req.body);
            req.assert('guarding_provider', 'Please enter guarding provider').notEmpty();
            req.assert('contact_person.name', 'Please enter contact person name').notEmpty();
            req.assert('contact_person.email', 'Please enter contact person email').isEmail();
            req.assert('contact_person.contact_number', 'Please enter contact person number').notEmpty();
            req.assert('duration', 'Please enter valid duration of service per month').matches('^[0-9]*$');
            req.assert('cost', 'Invalid Cost').matches('^[0-9]*$');
            req.assert('description', 'Please enter description for guarding service').notEmpty();
            req.assert('budget', 'Invalid Budget').matches('^[0-9]*$');
            req.assert('guarding_responsible.name', 'Please enter responsible person name').notEmpty();
            req.assert('guarding_responsible.email', 'Please enter responsible person email').isEmail();
            req.assert('guarding_responsible.contact_number', 'Please enter responsible person contact number').notEmpty();
            req.assert('building_providers.name', 'Please enter external person name').notEmpty();
            req.assert('building_providers.email', 'Please enter external person email').isEmail();
            req.assert('building_providers.contact_number', 'Please enter external person contact number').notEmpty();
            //Need further clarification
            // req.assert('contract', 'Please upload contract').notEmpty();
            req.assert('contract_validity', 'Please enter validity of contract').notEmpty();
            req.assert('notice_period', 'Please enter notice period of contract').notEmpty();
            // req.assert('user_manual', 'Please upload user manual').notEmpty();
            if(guarding.contractreminder){
            	req.assert('contractPersonEmail', 'Please enter contract person email').isEmail();
            }
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            guarding.save(function(err) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "guarding", "Failed to update guarding", guarding, err);
                    return res.status(500).send(err);
                } else {
                    logger.delta(req, req.user.company.company_name, "guarding", "Guarding updated successfully", guarding_before, guarding);
                    return res.json(guarding);
                }
            });
        },
        /**
         * Show a Guarding
         */
        show: function(req, res) {
            return res.json(req.guarding);
        },
        /**
         * List of Guarding
         */
        all: function(req, res) {
            require('../models/guarding')(req.companyDb);
            var GuardingModel = req.companyDb.model('Guarding');
            GuardingModel.find({
                building: req.building._id
            }, function(err, guarding) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "guarding", "Failed to list guarding", {
                        building: req.building._id
                    }, err);
                    return res.status(500).json({
                        error: 'Cannot list the Guarding'
                    });
                }
                return res.json(guarding);
            });
        },
        /**
         * Hard Delete the Guarding
         */
        destroy: function(req, res) {
            require('../models/guarding')(req.companyDb);
            var GuardingModel = req.companyDb.model('Guarding');
            var guarding = req.guarding;
            guarding.remove(function(err) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "guarding", "Failed to delete guarding", guarding, err);
                    return res.status(500).json({
                        error: 'Cannot delete the Guarding'
                    });
                } else {
                    logger.log(req, req.user.company.company_name, "guarding", "Guarding deleted successfully", guarding);
                    return res.json(guarding);
                }
            });
        },
        attachcontractguarding: function(req, res) {
            var form = new multiparty.Form();
            form.parse(req, function(err, fields, files) {
                if (files.file[0].originalFilename.split('.').pop() !== 'pdf' && files.file[0].originalFilename.split('.').pop() !== 'txt') {
                    logger.error(req, req.user.company.company_name, "guarding", "Failed to attach contract", {
                        file: files.file[0].originalFilename
                    }, 'File Format Not Supported Contract');
                    return res.status(400).json({
                        'Error': 'File Format Not Supported.'
                    });
                } else {
                    upload.uploadFile(files, req.user.company.database, "/guarding/", files.file[0].originalFilename, function(filepath) {
                        logger.log(req, req.user.company.company_name, "guarding", "Contract uploaded successfully", {
                            file: files.file[0].originalFilename
                        });
                        return res.send(filepath);
                    });
                }
            });
        },
        attachbuildingmanualguarding: function(req, res) {
            var form = new multiparty.Form();
            form.parse(req, function(err, fields, files) {
                if (files.file[0].originalFilename.split('.').pop() !== 'pdf' && files.file[0].originalFilename.split('.').pop() !== 'txt') {
                    logger.error(req, req.user.company.company_name, "guarding", "Failed to attach building manual", {
                        file: files.file[0].originalFilename
                    }, 'File Format Not Supported Building Manual');
                    return res.status(400).json({
                        'Error': 'File Format Not Supported.'
                    });
                } else {
                    upload.uploadFile(files, req.user.company.database, "/guarding/", files.file[0].originalFilename, function(filepath) {
                        logger.log(req, req.user.company.company_name, "guarding", "Building manual uploaded successfully", {
                            file: files.file[0].originalFilename
                        });
                        return res.send(filepath);
                    });
                }
            });
        }
    };
}