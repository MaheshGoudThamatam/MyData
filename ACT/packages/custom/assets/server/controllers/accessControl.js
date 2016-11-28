'use strict';
/**
 * <Author:Akash Gupta>
 * <Date:24-06-2016>
 * <Functions: Create, Update, GetAll, GetSingle, Soft Delete for Access System>
 * @params: req.body & req.accessSystem       Contain new or updated details of Access System
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
module.exports = function(AccessControl, actsec, io) {

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
                    logger.error(req, req.user.company.company_name, "accessControl", "Failed to fetch building", {
                        _id: id
                    }, err);
                    return next(err);
                }
                if (!building) {
                    logger.error(req, req.user.company.company_name, "accessControl", "Failed to load access control", {
                        _id: id
                    }, err);
                    return next(new Error('Failed to load Building ' + id));
                }
                req.building = building;
                next();
            });
        },
        /**
         * Find Access Control by id
         */
        access: function(req, res, next, id) {
            require('../models/accessControl')(req.companyDb);
            var AccessControlModel = req.companyDb.model('AccessControl');
            AccessControlModel.load(id, function(err, accessControl) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "accessControl", "Failed to fetch access control", {
                        _id: id
                    }, err);
                    return next(err);
                }
                if (!accessControl) {
                    logger.error(req, req.user.company.company_name, "accessControl", "Failed to load access control", {
                        _id: id
                    }, err);
                    return next(new Error('Failed to load Access Control ' + id));
                }
                req.accessControl = accessControl;
                next();
            });
        },
        /**
         * Create of Access Control
         */
        create: function(req, res) {
            req.body.createdBy = req.user._id;
            require('../models/accessControl')(req.companyDb);
            var AccessControlModel = req.companyDb.model('AccessControl');
            var accessControl = new AccessControlModel(req.body);
            req.assert('accessControl_provider', 'Please enter access control provider').notEmpty();
            req.assert('model', 'Please enter access control model').notEmpty();
            req.assert('year', 'Invalid Year').len(4, 4);
            req.assert('replacement_year', 'Please enter replacement year').notEmpty();
            req.assert('reader', 'Please enter reader').notEmpty();
            req.assert('lock', 'Please enter lock').notEmpty();
            req.assert('system_responsible.name', 'Please enter responsible person name').notEmpty();
            req.assert('system_responsible.email', 'Please enter responsible person email').isEmail();
            req.assert('system_responsible.contact_number', 'Please enter responsible person contact number').notEmpty();
            req.assert('external_person.model', 'Please enter external person model').notEmpty();
            req.assert('external_person.provider', 'Please enter external person provider').notEmpty();
            req.assert('external_person.email', 'Please enter external person email').isEmail();
            req.assert('external_person.contact_number', 'Please enter external person contact number').notEmpty();
            req.assert('readers', 'Invalid no of readers').matches('^[0-9]*$');
            req.assert('nodes', 'Invalid no of nodes').matches('^[0-9]*$');
            req.assert('user_licenses', 'Invalid no of user license').matches('^[0-9]*$');
            if(accessControl.service_agreement.emergencyDuty || accessControl.service_agreement.annualService){
            req.assert('service_provider', 'Please enter service provider name').notEmpty();
            req.assert('contact_person.name', 'Please enter contact person name').notEmpty();
            req.assert('contact_person.email', 'Please enter contact person email').isEmail();
            req.assert('contact_person.contact_number', 'Please enter contact person number').notEmpty();
            req.assert('cost_per_year', 'Invalid annual cost').matches('^[0-9]*$');
            }
            //Need further clarification
            // req.assert('contract', 'Please upload contract').notEmpty();
            // req.assert('contract_validity', 'Please enter validity of contract').notEmpty();
            // req.assert('notice_period', 'Please enter notice period of contract').notEmpty();
            // req.assert('orientation_drawing', 'Please upload orientation drawing').notEmpty();
            // req.assert('user_manual', 'Please upload user manual').notEmpty();
            req.assert('yearly_budget_cost', 'Invalid annual budget cost').matches('^[0-9]*$');
            if(accessControl.contractreminder){
            	req.assert('contractPersonEmail', 'Please enter contract person email').isEmail();
            }
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            accessControl.save(function(err) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "accessControl", "Failed to create access control", accessControl, err);
                    return res.status(500).send(err);
                } else {
                    require('../../../../custom/building/server/models/building.js')(req.companyDb);
                    var BuildingModel = req.companyDb.model('Building');
                    BuildingModel.findOne({
                        _id: accessControl.building
                    }, function(err, building) {
                        if (err) {
                            logger.error(req, req.user.company.company_name, "accessControl", "Failed to fetch building", {
                                _id: accessControl.building
                            }, err);
                        } else {
                            notif.notifyRole('New access control created for [' + building.building_name + ']', 'icon-login', '/building/' + accessControl.building + '/accesscontrol', configuration.roles.SECURITY_MANAGER,req.user.company._id, function() {});
                            logger.log(req, req.user.company.company_name, "accessControl", "Access control created successfully", accessControl);
                            return res.json(accessControl);
                        }
                    });
                }
            })
        },
        /**
         * Update a Access Control
         */
        update: function(req, res) {
            req.body.updatedBy = req.user._id;
            require('../models/accessControl')(req.companyDb);
            var AccessControlModel = req.companyDb.model('AccessControl');
            var accessControl_before = req.accessControl.toObject();
            var accessControl = req.accessControl;
            accessControl = _.extend(accessControl, req.body);
            req.assert('accessControl_provider', 'Please enter access control provider').notEmpty();
            req.assert('model', 'Please enter access control model').notEmpty();
            req.assert('year', 'Invalid Year').len(4, 4);
            req.assert('replacement_year', 'Please enter replacement year').notEmpty();
            req.assert('reader', 'Please enter reader').notEmpty();
            req.assert('lock', 'Please enter lock').notEmpty();
            req.assert('system_responsible.name', 'Please enter responsible person name').notEmpty();
            req.assert('system_responsible.email', 'Please enter responsible person email').isEmail();
            req.assert('system_responsible.contact_number', 'Please enter responsible person contact number').notEmpty();
            req.assert('external_person.model', 'Please enter external person model').notEmpty();
            req.assert('external_person.provider', 'Please enter external person provider').notEmpty();
            req.assert('external_person.contact_number', 'Please enter external person contact number').notEmpty();
            req.assert('readers', 'Invalid no of readers').matches('^[0-9]*$');
            req.assert('nodes', 'Invalid no of nodes').matches('^[0-9]*$');
            req.assert('user_licenses', 'Invalid no of user license').matches('^[0-9]');
            if(accessControl.service_agreement.emergencyDuty || accessControl.service_agreement.annualService){
                req.assert('service_provider', 'Please enter service provider name').notEmpty();
                req.assert('contact_person.name', 'Please enter contact person name').notEmpty();
                req.assert('contact_person.email', 'Please enter contact person email').isEmail();
                req.assert('contact_person.contact_number', 'Please enter contact person number').notEmpty();
                req.assert('cost_per_year', 'Invalid annual cost').matches('^[0-9]*$');
                }
            //Need further clarification
            // req.assert('contract', 'Please upload contract').notEmpty();
            // req.assert('contract_validity', 'Please enter validity of contract').notEmpty();
            // req.assert('notice_period', 'Please enter notice period of contract').notEmpty();
            // req.assert('orientation_drawing', 'Please upload orientation drawing').notEmpty();
            // req.assert('user_manual', 'Please upload user manual').notEmpty();
            req.assert('yearly_budget_cost', 'Invalid annual budget cost').matches('^[0-9]*$');
            if(accessControl.contractreminder){
            	req.assert('contractPersonEmail', 'Please enter contract person email').isEmail();
            }
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            accessControl.save(function(err) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "accessControl", "Failed to update access control", accessControl, err);
                    return res.status(500).send(err);
                } else {
                    logger.delta(req, req.user.company.company_name, "accessControl", "Access control updated successfully", accessControl_before, accessControl);
                    return res.json(accessControl);
                }
            });
        },
        /**
         * Show a Access Control
         */
        show: function(req, res) {
            return res.json(req.accessControl);
        },
        /**
         * List of Access Control
         */
        all: function(req, res) {
            require('../models/accessControl')(req.companyDb);
            var AccessControlModel = req.companyDb.model('AccessControl');
            AccessControlModel.find({
                building: req.building._id
            }, function(err, accessControl) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "accessControl", "Failed to list access control", {
                        building: req.building._id
                    }, err);
                    return res.status(400).json({
                        error: 'Cannot list the Access Control'
                    });
                }
                return res.json(accessControl);
            });
        },
        /**
         * Hard Delete the Access Control
         */
        destroy: function(req, res) {
            require('../models/accessControl')(req.companyDb);
            var AccessControlModel = req.companyDb.model('AccessControl');
            var accessControl = req.accessControl;
            accessControl.remove(function(err) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "accessControl", "Failed to delete access control", accessControl, err);
                    return res.status(400).json({
                        error: 'Cannot delete the Access Control'
                    });
                } else {
                    logger.log(req, req.user.company.company_name, "accessControl", "Access control deleted successfully", accessControl);
                    return res.json(accessControl);
                }
            });
        },
        attachcontractaccesscontrol: function(req, res) {
            var form = new multiparty.Form();
            form.parse(req, function(err, fields, files) {
                if (files.file[0].originalFilename.split('.').pop() !== 'pdf' && files.file[0].originalFilename.split('.').pop() !== 'txt') {
                    logger.error(req, req.user.company.company_name, "accessControl", "Failed to attach contract", {
                        file: files.file[0].originalFilename
                    }, 'File Format Not Supported Contract');
                    return res.status(400).json({
                        'Error': 'File Format Not Supported.'
                    });
                } else {
                    upload.uploadFile(files, req.user.company.database, "/accescontrolupload/", files.file[0].originalFilename, function(filepath) {
                        logger.log(req, req.user.company.company_name, "accessControl", "Contract uploaded successfully", {
                            file: files.file[0].originalFilename
                        });
                        return res.send(filepath);
                    });
                }
            });
        },
        attachorientationdrawingsaccesscontrol: function(req, res) {
            var form = new multiparty.Form();
            form.parse(req, function(err, fields, files) {
                if (files.file[0].originalFilename.split('.').pop() !== 'pdf' && files.file[0].originalFilename.split('.').pop() !== 'txt') {
                    logger.error(req, req.user.company.company_name, "accessControl", "Failed to attach orientation drawings", {
                        file: files.file[0].originalFilename
                    }, 'File Format Not Supported Orientation Drawings');
                    return res.status(400).json({
                        'Error': 'File Format Not Supported.'
                    });
                } else {
                    upload.uploadFile(files, req.user.company.database, "/accescontrolupload/", files.file[0].originalFilename, function(filepath) {
                        logger.log(req, req.user.company.company_name, "accessControl", "Orientation drawings uploaded successfully", {
                            file: files.file[0].originalFilename
                        });
                        return res.send(filepath);
                    });
                }
            });
        },
        attachusermanualaccesscontrol: function(req, res) {
            var form = new multiparty.Form();
            form.parse(req, function(err, fields, files) {
                if (files.file[0].originalFilename.split('.').pop() !== 'pdf' && files.file[0].originalFilename.split('.').pop() !== 'txt') {
                    logger.error(req, req.user.company.company_name, "accessControl", "Failed to attach user manual", {
                        file: files.file[0].originalFilename
                    }, 'File Format Not Supported User Manual');
                    return res.status(400).json({
                        'Error': 'File Format Not Supported.'
                    });
                } else {
                    upload.uploadFile(files, req.user.company.database, "/accescontrolupload/", files.file[0].originalFilename, function(filepath) {
                        logger.log(req, req.user.company.company_name, "accessControl", "User manual uploaded successfully", {
                            file: files.file[0].originalFilename
                        });
                        return res.send(filepath);
                    });
                }
            });
        }
    };
}