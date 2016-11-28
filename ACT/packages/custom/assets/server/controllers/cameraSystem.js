'use strict';
/**
 * <Author:Akash Gupta>
 * <Date:24-06-2016>
 * <Functions: Create, Update, GetAll, GetSingle, Soft Delete for Camera System>
 * @params: req.body & req.cameraSystem       Contain new or updated details of camera system
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
var async = require('async');
module.exports = function(CameraSystem, actsec, io) {

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
                    logger.error(req, req.user.company.company_name, "cameraSystem", "Failed to fetch building", {
                        _id: id
                    }, err);
                    return next(err);
                }
                if (!building) {
                    logger.error(req, req.user.company.company_name, "cameraSystem", "Failed to load building", {
                        _id: id
                    }, err);
                    return next(new Error('Failed to load Building ' + id));
                }
                req.building = building;
                next();
            });
        },
        /**
         * Find Camera System by id
         */
        camera: function(req, res, next, id) {
            require('../models/cameraSystem')(req.companyDb);
            var CameraSystemModel = req.companyDb.model('CameraSystem');
            CameraSystemModel.load(id, function(err, cameraSystem) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "cameraSystem", "Failed to fetch camera system", {
                        _id: id
                    }, err);
                    return next(err);
                }
                if (!cameraSystem) {
                    logger.error(req, req.user.company.company_name, "cameraSystem", "Failed to load camera system", {
                        _id: id
                    }, err);
                    return next(new Error('Failed to load camera system ' + id));
                }
                req.cameraSystem = cameraSystem;
                next();
            });
        },
        /**
         * Create of Camera System
         */
        create: function(req, res) {
            req.body.createdBy = req.user._id;
            require('../models/cameraSystem')(req.companyDb);
            var CameraSystemModel = req.companyDb.model('CameraSystem');
            var cameraSystem = new CameraSystemModel(req.body);
            req.assert('camera_provider', 'Please enter camera provider').notEmpty();
            req.assert('model', 'Please enter camera model').notEmpty();
            req.assert('year', 'Invalid Year').len(4, 4);
            req.assert('replacement_year', 'Please enter replacement year').notEmpty();
            req.assert('name', 'Please enter camera name').notEmpty();
            req.assert('resolution', 'Please enter camera resolution').notEmpty();
            req.assert('place', 'Please enter the place, where camera is installed').notEmpty();
            // req.assert('place_image', 'Please upload image of place where camera is installed').notEmpty();
            req.assert('purpose', 'Please enter the purpose of camera').notEmpty();
            req.assert('system_responsible.name', 'Please enter responsible person name').notEmpty();
            req.assert('system_responsible.email', 'Please enter responsible person email').isEmail();
            req.assert('system_responsible.contact_number', 'Please enter responsible person contact number').notEmpty();
            req.assert('external_person.model', 'Please enter external person model').notEmpty();
            req.assert('external_person.provider', 'Please enter external person provider').notEmpty();
            req.assert('external_person.email', 'Please enter external person email').isEmail();
            req.assert('external_person.contact_number', 'Please enter external person contact number').notEmpty();
            if(cameraSystem.service_agreement.emergencyDuty || cameraSystem.service_agreement.annualService){
            req.assert('service_provider', 'Please enter service provider name').notEmpty();
            req.assert('contact_person.name', 'Please enter contact person name').notEmpty();
            req.assert('contact_person.email', 'Please enter contact person email').isEmail();
            req.assert('contact_person.contact_number', 'Please enter contact person number').notEmpty();
            req.assert('cost_per_year', 'Please enter annualy cost').matches('^[0-9]*$');
            }
             if(cameraSystem.contractreminder){
            	 req.assert('contractPersonEmail', 'Please enter contract person email').isEmail();
            }
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            cameraSystem.save(function(err) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "cameraSystem", "Failed to create camera system", cameraSystem, err);
                    return res.status(500).send(err);
                } else {
                    require('../../../../custom/building/server/models/building.js')(req.companyDb);
                    var BuildingModel = req.companyDb.model('Building');
                    BuildingModel.findOne({
                        _id: cameraSystem.building
                    }, function(err, building) {
                        if (err) {
                            logger.error(req, req.user.company.company_name, "cameraSystem", "Failed to fetch building", {
                                _id: cameraSystem.building
                            }, err);
                        } else {
                            notif.notifyRole('New camera system created for [' + building.building_name + ']', 'icon-camrecorder', '/building/' + cameraSystem.building + '/camera', configuration.roles.SECURITY_MANAGER,req.user.company._id, function() {});
                            logger.log(req, req.user.company.company_name, "cameraSystem", "Camera system created successfully", cameraSystem);
                            return res.json(cameraSystem);
                        }
                    });
                }
            })
        },
        /**
         * Update a Camera System
         */
        update: function(req, res) {
            req.body.updatedBy = req.user._id;
            require('../models/cameraSystem')(req.companyDb);
            var CameraSystemModel = req.companyDb.model('CameraSystem');
            var cameraSystem_before = req.cameraSystem.toObject();
            var cameraSystem = req.cameraSystem;
            cameraSystem = _.extend(cameraSystem, req.body);
            req.assert('camera_provider', 'Please enter camera provider').notEmpty();
            req.assert('model', 'Please enter camera model').notEmpty();
            req.assert('year', 'Invalid Year').len(4, 4);
            req.assert('replacement_year', 'Please enter replacement year').notEmpty();
            req.assert('name', 'Please enter camera name').notEmpty();
            req.assert('resolution', 'Please enter camera resolution').notEmpty();
            req.assert('place', 'Please enter the place, where camera is installed').notEmpty();
            // req.assert('place_image', 'Please upload image of place where camera is installed').notEmpty();
            req.assert('purpose', 'Please enter the purpose of camera').notEmpty();
            req.assert('system_responsible.name', 'Please enter responsible person name').notEmpty();
            req.assert('system_responsible.email', 'Please enter responsible person email').isEmail();
            req.assert('system_responsible.contact_number', 'Please enter responsible person contact number').notEmpty();
            req.assert('external_person.model', 'Please enter external person model').notEmpty();
            req.assert('external_person.provider', 'Please enter external person provider').notEmpty();
            req.assert('external_person.email', 'Please enter external person email').isEmail();
            req.assert('external_person.contact_number', 'Please enter external person contact number').notEmpty();
            if(cameraSystem.service_agreement.emergencyDuty || cameraSystem.service_agreement.annualService){
                req.assert('service_provider', 'Please enter service provider name').notEmpty();
                req.assert('contact_person.name', 'Please enter contact person name').notEmpty();
                req.assert('contact_person.email', 'Please enter contact person email').isEmail();
                req.assert('contact_person.contact_number', 'Please enter contact person number').notEmpty();
                req.assert('cost_per_year', 'Please enter annualy cost').matches('^[0-9]*$');
                }
            if(cameraSystem.contractreminder){
           	 req.assert('contractPersonEmail', 'Please enter contract person email').isEmail();
           }
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            cameraSystem.save(function(err) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "cameraSystem", "Failed to update camera system", cameraSystem, err);
                    return res.status(500).send(err);
                } else {
                    logger.delta(req, req.user.company.company_name, "cameraSystem", "Camera system updated successfully", cameraSystem_before, cameraSystem);
                    return res.json(cameraSystem);
                }
            });
        },
        /**
         * Show a Camera System
         */
        show: function(req, res) {
            return res.json(req.cameraSystem);
        },
        /**
         * List of Camera System
         */
        all: function(req, res) {
            require('../models/cameraSystem')(req.companyDb);
            var CameraSystemModel = req.companyDb.model('CameraSystem');
            CameraSystemModel.find({
                building: req.building._id
            }, function(err, cameraSystem) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "cameraSystem", "Failed to list camera system", {
                        building: req.building._id
                    }, err);
                    return res.status(500).json({
                        error: 'Cannot list the Camera System'
                    });
                }
                return res.json(cameraSystem);
            });
        },
        /**
         * Hard Delete the Company
         */
        destroy: function(req, res) {
            require('../models/cameraSystem')(req.companyDb);
            var CameraSystemModel = req.companyDb.model('CameraSystem');
            var cameraSystem = req.cameraSystem;
            cameraSystem.remove(function(err) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "cameraSystem", "Failed to delete camera system", cameraSystem, err);
                    return res.status(500).json({
                        error: 'Cannot delete the Camera System'
                    });
                } else {
                    logger.log(req, req.user.company.company_name, "cameraSystem", "Camera system deleted successfully", cameraSystem);
                    return res.json(cameraSystem);
                }
            });
        },
        fileupload: function(req, res) {
            var form = new multiparty.Form();
            form.parse(req, function(err, fields, files) {
                if (files.file[0].originalFilename.split('.').pop() !== 'jpg' && files.file[0].originalFilename.split('.').pop() !== 'jpeg') {
                    logger.error(req, req.user.company.company_name, "cameraSystem", "Failed to attach camera photo", {
                        file: files.file[0].originalFilename
                    }, 'File Format Not Supported Camera Photo');
                    return res.status(400).json({
                        'Error': 'File Format Not Supported.'
                    });
                } else {
                    upload.uploadFile(files, req.user.company.database, "/cameracreateupload/", files.file[0].originalFilename, function(filepath) {
                        logger.log(req, req.user.company.company_name, "cameraSystem", "Camera photo uploaded successfully", {
                            file: files.file[0].originalFilename
                        });
                        return res.send(filepath);
                    });
                }
            });
        },
        attachdocument: function(req, res) {
            var form = new multiparty.Form();
            form.parse(req, function(err, fields, files) {
                if (files.file[0].originalFilename.split('.').pop() !== 'pdf' && files.file[0].originalFilename.split('.').pop() !== 'txt') {
                    logger.error(req, req.user.company.company_name, "cameraSystem", "Failed to attach document", {
                        file: files.file[0].originalFilename
                    }, 'File Format Not Supported document');
                    return res.status(400).json({
                        'Error': 'File Format Not Supported.'
                    });
                } else {
                    upload.uploadFile(files, req.user.company.database, "/cameracreateupload/", files.file[0].originalFilename, function(filepath) {
                        logger.log(req, req.user.company.company_name, "cameraSystem", "document uploaded successfully", {
                            file: files.file[0].originalFilename
                        });
                        return res.send(filepath);
                    });
                }
            });
        },
        attachcontract: function(req, res) {
            var form = new multiparty.Form();
            form.parse(req, function(err, fields, files) {
                if (files.file[0].originalFilename.split('.').pop() !== 'pdf' && files.file[0].originalFilename.split('.').pop() !== 'txt') {
                    logger.error(req, req.user.company.company_name, "cameraSystem", "Failed to attach contract", {
                        file: files.file[0].originalFilename
                    }, 'File Format Not Supported Contract');
                    return res.status(400).json({
                        'Error': 'File Format Not Supported.'
                    });
                } else {
                    upload.uploadFile(files, req.user.company.database, "/cameracreateupload/", files.file[0].originalFilename, function(filepath) {
                        logger.log(req, req.user.company.company_name, "cameraSystem", "Contract uploaded successfully", {
                            file: files.file[0].originalFilename
                        });
                        return res.send(filepath);
                    });
                }
            });
        },
        attachorientationdrawingscamera: function(req, res) {
            var form = new multiparty.Form();
            form.parse(req, function(err, fields, files) {
                if (files.file[0].originalFilename.split('.').pop() !== 'pdf' && files.file[0].originalFilename.split('.').pop() !== 'txt') {
                    logger.error(req, req.user.company.company_name, "cameraSystem", "Failed to attach orientation drawings", {
                        file: files.file[0].originalFilename
                    }, 'File Format Not Supported Orientation Drawings');
                    return res.status(400).json({
                        'Error': 'File Format Not Supported.'
                    });
                } else {
                    upload.uploadFile(files, req.user.company.database, "/cameracreateupload/", files.file[0].originalFilename, function(filepath) {
                        logger.log(req, req.user.company.company_name, "cameraSystem", "Orientation drawings uploaded successfully", {
                            file: files.file[0].originalFilename
                        });
                        return res.send(filepath);
                    });
                }
            });
        },
        attachcameradocumentation: function(req, res) {
            var form = new multiparty.Form();
            form.parse(req, function(err, fields, files) {
                if (files.file[0].originalFilename.split('.').pop() !== 'pdf' && files.file[0].originalFilename.split('.').pop() !== 'txt') {
                    logger.error(req, req.user.company.company_name, "cameraSystem", "Failed to attach camera documentation", {
                        file: files.file[0].originalFilename
                    }, 'File Format Not Supported Camera Documentation');
                    return res.status(400).json({
                        'Error': 'File Format Not Supported.'
                    });
                } else {
                    upload.uploadFile(files, req.user.company.database, "/cameracreateupload/", files.file[0].originalFilename, function(filepath) {
                        logger.log(req, req.user.company.company_name, "cameraSystem", "Camera documentation uploaded successfully", {
                            file: files.file[0].originalFilename
                        });
                        return res.send(filepath);
                    });
                }
            });
        }
    };
}