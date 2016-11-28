'use strict';
/**
 * <Author:Akash Gupta>
 * <Date:27-06-2016>
 * <Functions: Create, Update, GetAll, GetSingle, Soft Delete & undo soft delete for Burglar Alarm System>
 * @params: req.body & req.accessSystem       Contain new or updated details of Burglar Alarm System
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
module.exports = function(BurglarAlarm, actsec, io) {

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
                    logger.error(req, req.user.company.company_name, "burglarAlarm", "Failed to fetch building", {
                        _id: id
                    }, err);
                    return next(err);
                }
                if (!building) {
                    logger.error(req, req.user.company.company_name, "burglarAlarm", "Failed to load building", {
                        _id: id
                    }, err);
                    return next(new Error('Failed to load Building ' + id));
                }
                req.building = building;
                next();
            });
        },
        /**
         * Find Burglar Alarm by id
         */
        alarm: function(req, res, next, id) {
            require('../models/burglarAlarm')(req.companyDb);
            var BurglarAlarmModel = req.companyDb.model('BurglarAlarm');
            BurglarAlarmModel.load(id, function(err, burglarAlarm) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "burglarAlarm", "Failed to load burglar alarm", {
                        _id: id
                    }, err);
                    return next(err);
                }
                if (!burglarAlarm) {
                    logger.error(req, req.user.company.company_name, "burglarAlarm", "Failed to load burglar alarm", {
                        _id: id
                    }, err);
                    return next(new Error('Failed to load Burglar Alarm ' + id));
                }
                req.burglarAlarm = burglarAlarm;
                next();
            });
        },
        /**
         * Create of Burglar Alarm
         */
        create: function(req, res) {
            req.body.createdBy = req.user._id;
            require('../models/burglarAlarm')(req.companyDb);
            var BurglarAlarmModel = req.companyDb.model('BurglarAlarm');
            var burglarAlarm = new BurglarAlarmModel(req.body);
            req.assert('burglarAlarm_provider', 'Please enter burglar alarm provider').notEmpty();
            req.assert('model', 'Please enter burglar alarm model').notEmpty();
            req.assert('year', 'Invalid Year').len(4, 4);
            req.assert('replacement_year', 'Please enter replacement year').notEmpty();
            req.assert('sections', 'Please enter number of sections').matches('^[0-9]*$');
            req.assert('alarm_point', 'Please enter number of alarm points').matches('^[0-9]*$');
            req.assert('system_responsible.name', 'Please enter responsible person name').notEmpty();
            req.assert('system_responsible.email', 'Please enter responsible person email').isEmail();
            req.assert('system_responsible.contact_number', 'Please enter responsible person contact number').notEmpty();
            req.assert('external_person.name', 'Please enter alarm reciever person name').notEmpty();
            req.assert('external_person.email', 'Please enter alarm reciever person email').isEmail();
            req.assert('external_person.contact_number', 'Please enter alarm reciever person contact number').notEmpty();
            if(burglarAlarm.service_agreement.emergencyDuty || burglarAlarm.service_agreement.annualService){
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
            if(burglarAlarm.contractreminder){
            	req.assert('contractPersonEmail', 'Please enter contract person email').isEmail();
            }
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            burglarAlarm.save(function(err) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "burglarAlarm", "Failed to create burglar alarm", burglarAlarm, err);
                    return res.status(500).send(err);
                } else {
                    require('../../../../custom/building/server/models/building.js')(req.companyDb);
                    var BuildingModel = req.companyDb.model('Building');
                    BuildingModel.findOne({
                        _id: burglarAlarm.building
                    }, function(err, building) {
                        if (err) {
                            logger.error(req, req.user.company.company_name, "burglarAlarm", "Failed to fetch building", {
                                _id: burglarAlarm.building
                            }, err);
                        } else {
                            notif.notifyRole('New buglar alarm created for [' + building.building_name + ']', 'icon-bell', '/building/' + burglarAlarm.building + '/burglaralarm', configuration.roles.SECURITY_MANAGER,req.user.company._id, function() {});
                            logger.log(req, req.user.company.company_name, "burglarAlarm", "Burglar alarm created successfully", burglarAlarm);
                            return res.json(burglarAlarm);
                        }
                    });
                }
            })
        },
        /**
         * Update a Burglar Alarm
         */
        update: function(req, res) {
            req.body.updatedBy = req.user._id;
            require('../models/burglarAlarm')(req.companyDb);
            var BurglarAlarmModel = req.companyDb.model('BurglarAlarm');
            var burglarAlarm_before = req.burglarAlarm.toObject();
            var burglarAlarm = req.burglarAlarm;
            burglarAlarm = _.extend(burglarAlarm, req.body);
            req.assert('burglarAlarm_provider', 'Please enter burglar alarm provider').notEmpty();
            req.assert('model', 'Please enter burglar alarm model').notEmpty();
            req.assert('year', 'Invalid Year').len(4, 4);
            req.assert('replacement_year', 'Please enter replacement year').notEmpty();
            req.assert('sections', 'Please enter number of sections').matches('^[0-9]*$');
            req.assert('alarm_point', 'Please enter number of alarm points').matches('^[0-9]*$');
            req.assert('system_responsible.name', 'Please enter responsible person name').notEmpty();
            req.assert('system_responsible.email', 'Please enter responsible person email').isEmail();
            req.assert('system_responsible.contact_number', 'Please enter responsible person contact number').notEmpty();
            req.assert('external_person.name', 'Please enter alarm reciever person name').notEmpty();
            req.assert('external_person.email', 'Please enter alarm reciever person email').isEmail();
            req.assert('external_person.contact_number', 'Please enter alarm reciever person contact number').notEmpty();
            if(burglarAlarm.service_agreement.emergencyDuty || burglarAlarm.service_agreement.annualService){
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
            if(burglarAlarm.contractreminder){
            	req.assert('contractPersonEmail', 'Please enter contract person email').isEmail();
            }
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            burglarAlarm.save(function(err) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "burglarAlarm", "Failed to update burglar alarm", burglarAlarm, err);
                    return res.status(500).send(err);
                } else {
                    logger.delta(req, req.user.company.company_name, "burglarAlarm", "Burglar alarm updated successfully", burglarAlarm_before, burglarAlarm);
                    return res.json(burglarAlarm);
                }
            });
        },
        /**
         * Show a Burglar Alarm
         */
        show: function(req, res) {
            return res.json(req.burglarAlarm);
        },
        /**
         * List of Burglar Alarm
         */
        all: function(req, res) {
            require('../models/burglarAlarm')(req.companyDb);
            var BurglarAlarmModel = req.companyDb.model('BurglarAlarm');
            BurglarAlarmModel.find({
                building: req.building._id
            }, function(err, burglarAlarm) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "burglarAlarm", "Failed to list burglar alarm", {
                        building: req.building._id
                    }, err);
                    return res.status(500).json({
                        error: 'Cannot list the Burglar Alarm'
                    });
                }
                return res.json(burglarAlarm);
            });
        },
        /**
         * Hard Delete the Burglar Alarm
         */
        destroy: function(req, res) {
            require('../models/burglarAlarm')(req.companyDb);
            var BurglarAlarmModel = req.companyDb.model('BurglarAlarm');
            var burglarAlarm = req.burglarAlarm;
            burglarAlarm.remove(function(err) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "burglarAlarm", "Failed to delete burglar alarm", burglarAlarm, err);
                    return res.status(400).json({
                        error: 'Cannot delete the Burglar Alarm'
                    });
                } else {
                    logger.log(req, req.user.company.company_name, "burglarAlarm", "Burglar alarm deletaed successfully", burglarAlarm);
                    return res.json(burglarAlarm);
                }
            });
        },
        attachorientationdrawingsalarm: function(req, res) {
            var form = new multiparty.Form();
            form.parse(req, function(err, fields, files) {
                if (files.file[0].originalFilename.split('.').pop() !== 'pdf' && files.file[0].originalFilename.split('.').pop() !== 'txt') {
                    logger.error(req, req.user.company.company_name, "burglarAlarm", "Failed to attach orientation drawings", {
                        file: files.file[0].originalFilename
                    }, 'File Format Not Supported Orientaion Drawings');
                    return res.status(400).json({
                        'Error': 'File Format Not Supported.'
                    });
                } else {
                    upload.uploadFile(files, req.user.company.database, "/burglarupload/", files.file[0].originalFilename, function(filepath) {
                        logger.log(req, req.user.company.company_name, "burglarAlarm", "Orientation drawings uploaded successfully", {
                            file: files.file[0].originalFilename
                        });
                        return res.send(filepath);
                    });
                }
            });
        },
        attachcontractalarm: function(req, res) {
            var form = new multiparty.Form();
            form.parse(req, function(err, fields, files) {
                if (files.file[0].originalFilename.split('.').pop() !== 'pdf' && files.file[0].originalFilename.split('.').pop() !== 'txt') {
                    logger.error(req, req.user.company.company_name, "burglarAlarm", "Failed to attach contract", {
                        file: files.file[0].originalFilename
                    }, 'File Format Not Supported Contract');
                    return res.status(400).json({
                        'Error': 'File Format Not Supported.'
                    });
                } else {
                    upload.uploadFile(files, req.user.company.database, "/burglarupload/", files.file[0].originalFilename, function(filepath) {
                        logger.log(req, req.user.company.company_name, "burglarAlarm", "Contract uploaded successfully", {
                            file: files.file[0].originalFilename
                        });
                        return res.send(filepath);
                    });
                }
            });
        },
        attachusermanualalarm: function(req, res) {
            var form = new multiparty.Form();
            form.parse(req, function(err, fields, files) {
                if (files.file[0].originalFilename.split('.').pop() !== 'pdf' && files.file[0].originalFilename.split('.').pop() !== 'txt') {
                    logger.error(req, req.user.company.company_name, "burglarAlarm", "Failed to attach user manual", {
                        file: files.file[0].originalFilename
                    }, 'File Format Not Supported User Manual');
                    return res.status(400).json({
                        'Error': 'File Format Not Supported.'
                    });
                } else {
                    upload.uploadFile(files, req.user.company.database, "/burglarupload/", files.file[0].originalFilename, function(filepath) {
                        logger.log(req, req.user.company.company_name, "burglarAlarm", "User manual uploaded successfully", {
                            file: files.file[0].originalFilename
                        });
                        return res.send(filepath);
                    });
                }
            });
        }
    };
}