'use strict';
/**
 * Name : External Security task Controller Description : In this controller Audits are created
 * by the super admin and Security Manager for a particular company. @ <author>
 * Sanjana @ <date> 11-July-2016 @ METHODS: create, show, update, approvalEstimateTask,approvedOrdeclinedTask
 */
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    mail = require('../../../../contrib/meanio-system/server/services/mailService.js'),
    nodemailer = require('nodemailer'),
    templates = require('../../../../custom/actsec/server/config/externalTask_template.js'),
    upload = require('../../../../contrib/meanio-system/server/services/bulkUpload.js'),
    multiparty = require('multiparty'),
    config = require('meanio').loadConfig(),
    _ = require('lodash');
var async = require('async');
var UserModel = mongoose.model('User');
var configuration = require('../../../../custom/actsec/server/config/config.js');
var logger = require('../../../../contrib/meanio-system/server/controllers/logs.js');

function sendMail(mailOptions) {
    var transport = nodemailer.createTransport(config.mailer);
    transport.sendMail(mailOptions, function(err, response) {
        if (err) return err;
        return response;
    });
};

module.exports = function(ExternalSecurityTaskCtrl, actsec, io) {

    var notif = require('../../../actsec/server/controllers/notification.js')(actsec, io);

    return {
        /**
         * Find externalSecurityTask by id
         */
        externalSecurityTask: function(req, res, next, id) {
            require('../models/external_securitytask')(req.companyDb);
            var ExternalSecurityTaskModel = req.companyDb.model('ExternalSecurityTask');
            ExternalSecurityTaskModel.load(id, function(err, externalSecurityTask) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "externalsecuritytask", "Failed to fetch externalsecuritytask", {
                        _id: id
                    }, err);
                    return next(err);
                }
                if (!externalSecurityTask) {
                    logger.error(req, req.user.company.company_name, "externalsecuritytask", "Failed to fetch externalsecuritytask", {
                        _id: id
                    }, err);
                    return next(new Error('Failed to load externalSecurityTask ' + id));
                }
                req.externalSecurityTask = externalSecurityTask;
                next();
            });
        },
        /**
         * Create a new external security task
         */
        create: function(req, res) {
            var isActual = false;
            if (JSON.stringify(req.user.role._id) === JSON.stringify(configuration.roles.SECURITY_MANAGER)) {
                require('../models/external_securitytask')(req.companyDb);
                var ExternalSecurityTaskModel = req.companyDb.model('ExternalSecurityTask');
                req.body.createdBy = req.user._id;
                var externalSecurityTask = new ExternalSecurityTaskModel(req.body);
                var validation = function(callbackValidation) {
                    req.assert('task_name', 'Please enter task name').notEmpty();
                    req.assert('description', 'Please enter description').notEmpty();
                    req.assert('email', 'Please enter a valid email').isEmail();
                    var errors = req.validationErrors();
                    if (errors) {
                        logger.error(req, req.user.company.company_name, "externalsecuritytask", "Failed to create externalsecuritytask", externalSecurityTask, errors);
                        return res.status(400).send(errors);
                    } else {
                        callbackValidation();
                    }
                };
                async.waterfall([validation], function(err) {
                    var save = true;
                    //on success or failure of this condition respective status will be set based on which further actions will be done 
                    if (req.body.value == "Cancel") {
                        externalSecurityTask.status = "APPROVED";
                    } else {
                        externalSecurityTask.status = "FOR_ESTIMATE";
                    }
                    externalSecurityTask.company = req.body.company_id;
                    externalSecurityTask.save(function(err) {
                        if (err) {
                            save = false;
                            logger.error(req, req.user.company.company_name, "externalsecuritytask", "Failed to create extenalsecuritytask", externalSecurityTask, err);
                            return res.status(400);
                        } else {
                        	notif.notifyRole('New external security task has been created' , 'icon-target', '/securitytasks', configuration.roles.SECURITY_MANAGER,externalSecurityTask.company, function() {});
                            logger.log(req, req.user.company.company_name, "externalsecuritytask", "externalsecuritytask created successfully", externalSecurityTask);
                            return res.json(externalSecurityTask);
                        }
                    });
                    if (save) {
                        //if this condition is false then, mail will be to the external user on clicking the link he needs to estimate else that particular task will be approved 
                        if (req.body.value == "Cancel") {
                            var email = templates.external_user_approved(externalSecurityTask);
                            mail.mailService(email, externalSecurityTask.email)
                        } else {
                            var email = templates.external_user(externalSecurityTask);
                            mail.mailService(email, externalSecurityTask.email);
                        }
                    }
                });
            } else {
                return res.status(401).json('Unauthorised');
            }
        },
        /**
         * Update a external security task by an external user
         */
        update: function(req, res) {
            req.body.updatedBy = req.user._id;
            var externalSecurityTask_before = req.externalSecurityTask.toObject();
            var externalSecurityTask = req.externalSecurityTask;
            externalSecurityTask = _.extend(externalSecurityTask, req.body);
            req.assert('task_name', 'Please enter task name').notEmpty();
            req.assert('description', 'Please enter description').notEmpty();
            req.assert('email', 'Please enter email').notEmpty();
            var errors = req.validationErrors();
            if (errors) {
                logger.error(req, req.user.company.company_name, "externalsecuritytask", "Failed to update externalsecuritytask", externalSecurityTask, errors);
                return res.status(400).send(errors);
            }
            externalSecurityTask.save(function(err) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "externalsecuritytask", "Failed to update externalsecuritytask", externalSecurityTask, err);
                } else {
                    logger.delta(req, req.user.company.company_name, "externalsecuritytask", "externalsecuritytask updated successfully", externalSecurityTask_before, externalSecurityTask);
                    return res.send(externalSecurityTask);
                }
            });
        },
        /**
         * Show a External Security Task
         */
        show: function(req, res) {
            return res.json(req.externalSecurityTask);
        },
        /**
         * Send for approval of external task after estimation of hours and cost
         */
        approvalEstimateTask: function(req, res) {
            require('../models/external_securitytask')(req.companyDb);
            var ExternalSecurityTaskModel = req.companyDb.model('ExternalSecurityTask');
            var saveExternalTask = function(callbackDone) {
                ExternalSecurityTaskModel.findOne({
                    _id: req.body.externalsecuritytaskId
                }).exec(function(err, externalSecurityTaskObject) {
                    if (externalSecurityTaskObject.isUpdated == false) {
                        if (err) {
                            logger.error(req, req.user.company.company_name, "extenalsecuritytask", "Failed to approve  task", externalSecurityTaskObject, err);
                        } else {
                            req.assert('externalsecuritytask_hours', 'Please enter estimated hours').notEmpty();
                            req.assert('externalsecuritytask_cost', 'Please enter estimated cost').notEmpty();
                            var errors = req.validationErrors();
                            if (errors) {
                                return res.status(400).send(errors);
                            }
                            externalSecurityTaskObject.estimated_hours = req.body.externalsecuritytask_hours;
                            externalSecurityTaskObject.estimated_cost = req.body.externalsecuritytask_cost;
                            externalSecurityTaskObject.query = req.body.externalsecuritytask_query;
                            externalSecurityTaskObject.comments.push(req.body.externalsecuritytask_comments);
                            externalSecurityTaskObject.isDeclined = false;
                            externalSecurityTaskObject.status = "ESTIMATION_COMPLETED";
                            externalSecurityTaskObject.isUpdated = true;
                            externalSecurityTaskObject.save(function(err) {
                                if (err) {
                                    logger.error(req, req.user.company.company_name, "extenalsecuritytask", "Failed to approve  task", externalSecurityTaskObject, err);
                                } else {
                                    callbackDone(null, externalSecurityTaskObject);
                                }
                            });
                        }
                    } else {
                        return res.status(400).json("Already Submitted");
                    }
                });
            };
            var findUser = function(externalSecurityTaskObject, callBackUser) {
                UserModel.find({
                    company: externalSecurityTaskObject.company,
                    role: configuration.roles.SECURITY_MANAGER
                }).exec(function(err, managers) {
                    if (err) {
                        logger.error(req, req.user.company.company_name, "extenalsecuritytask", "Failed to fetch Managers", {
                            company: externalSecurityTaskObject.company,
                            role: configuration.roles.SECURITY_MANAGER
                        }, err);
                        return res.status(400).json({
                            error: 'Cannot list the Managers'
                        });
                    } else {
                        callBackUser(null, managers, externalSecurityTaskObject)
                    }
                });
            };
            async.waterfall([saveExternalTask, findUser], function(error, managers, externalSecurityTaskObject) {
                async.each(managers, function(manager, callback) {
                    var email = templates.managers(manager, externalSecurityTaskObject);
                    mail.mailService(email, manager.email);
                    callback();
                }, function(err) {
                    externalSecurityTaskObject.status = "FOR_APPROVAL";
                    externalSecurityTaskObject.save(function(err) {
                        if (err) {
                            logger.error(req, req.user.company.company_name, "extenalsecuritytask", "Failed to approve  task", externalSecurityTaskObject, err);
                        } else {
                            notif.notifyRole('Estimated external security task  [' + externalSecurityTaskObject.status + ']', 'icon-target', '/securitytasks', configuration.roles.SECURITY_MANAGER,externalSecurityTaskObject.company, function() {});
                            if (!req.user) {
                                var mockReq = {
                                    connection: {
                                        remoteAddress: 'X.X.X.X'
                                    },
                                    method: 'SYSTEM',
                                    url: '',
                                    headers: []
                                };
                                logger.log(mockReq, 'SYSTEM', "extenalsecuritytask", "task approved successfully", externalSecurityTaskObject);
                            } else {
                                logger.log(req, req.user.company.company_name, "extenalsecuritytask", "task approved successfully", externalSecurityTaskObject);
                            }
                            return res.send(externalSecurityTaskObject);
                        }
                    });
                });
            })
        },
        /**
         * Approve or Decline of task from security manager
         */
        approvedOrdeclinedTask: function(req, res) {
            require('../models/external_securitytask')(req.companyDb);
            var ExternalSecurityTaskModel = req.companyDb.model('ExternalSecurityTask');
            var saveSecurityTask = function(callbackSave) {
                ExternalSecurityTaskModel.findOne({
                    _id: req.body.externalsecuritytaskId
                }).exec(function(err, externalSecurityTaskObject) {
                    if (err) {
                        logger.error(req, req.user.company.company_name, "extenalsecuritytask", "Failed to load  task", externalSecurityTaskObject, err);
                    } else {
                        if (req.body.externalsecuritytask_status == configuration.status.CLOSED) {
                            externalSecurityTaskObject.isClosed = true;
                        }
                        externalSecurityTaskObject.status = req.body.externalsecuritytask_status;
                        externalSecurityTaskObject.isUpdated = false;
                        externalSecurityTaskObject.isDeclined = req.body.externalsecuritytask_isDeclined;
                        externalSecurityTaskObject.comments.push(req.body.externalsecuritytask_comments);
                        externalSecurityTaskObject.save(function(err, externalTaskSaveobj) {
                            if (err) {
                                logger.error(req, req.user.company.company_name, "extenalsecuritytask", "Failed to approve or decline task", externalSecurityTaskObject, err);
                            } else {
                            	notif.notifyRole('External security task has been ['+ externalSecurityTaskObject.status  + ']' , 'icon-target', '/securitytasks', configuration.roles.SECURITY_MANAGER,externalSecurityTaskObject.company, function() {});
                                callbackSave(null, externalTaskSaveobj);
                            }
                        });
                    }
                });
            };
            var sendMail = function(externalTaskSaveobj, callbackApproved) {
                //checking this condition because,the same function is called after the external task is approved from security manager and actual hours and cost is filled
                if (externalTaskSaveobj.status == configuration.status.APPROVED && !req.body.externalsecuritytask_hours) {
                    var email = templates.external_user_approved(externalTaskSaveobj);
                    mail.mailService(email, externalTaskSaveobj.email);
                } else
                //checking this condition because,a mail needs to be sent to the external user when the security manager declines the estimates when status is DECLINED
                if (externalTaskSaveobj.status != configuration.status.COMPLETED && externalTaskSaveobj.status != configuration.status.APPROVED && externalTaskSaveobj.status != configuration.status.CLOSED) {
                    var email = templates.external_user_declined(externalTaskSaveobj);
                    mail.mailService(email, externalTaskSaveobj.email);
                }
                if (externalTaskSaveobj.status == configuration.status.CLOSED) {
                    var email = templates.external_task_closed(externalTaskSaveobj);
                    mail.mailService(email, externalTaskSaveobj.email);
                }
                callbackApproved(null, externalTaskSaveobj);
            };
            async.waterfall([saveSecurityTask, sendMail, ], function(err, result) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "extenalsecuritytask", "Failed to save security task", result, err);
                } else {
                    var obj = result;
                    obj.actual_hours = req.body.externalsecuritytask_hours;
                    obj.actual_cost = req.body.externalsecuritytask_cost;
                    obj.attach_invoice = req.body.externalsecuritytask_attach_invoice;
                    obj.save(function(err, finalObject) {
                        if (err) {
                            logger.error(req, req.user.company.company_name, "extenalsecuritytask", "Failed to save security task", obj, err);
                        } else {
                            //checking this condition because,a mail with the actuals needs to be sent to the security manager after the actual hours and cost is filled by the external user
                            if (finalObject.actual_hours && finalObject.actual_cost && finalObject.status != configuration.status.COMPLETED) {
                                UserModel.find({
                                    company: finalObject.company,
                                    role: configuration.roles.SECURITY_MANAGER
                                }).exec(function(err, managers) {
                                    if (err) {
                                        logger.error(req, req.user.company.company_name, "extenalsecuritytask", "Failed to fetch Managers", {
                                            company: finalObject.company,
                                            role: configuration.roles.SECURITY_MANAGER
                                        }, err);
                                        return res.status(500).json({
                                            error: 'Cannot list the Managers'
                                        });
                                    } else {
                                        async.each(managers, function(manager, callback) {
                                            //notify security manager when the actuals are filled by the external user 
                                            var email = templates.manager_notify(manager, finalObject);
                                            mail.mailService(email, manager.email);
                                            callback();
                                        }, function(err) {});
                                    }
                                });
                            }
                            notif.notifyRole('External security task has been ['+ finalObject.status  + ']' , 'icon-target', '/securitytasks', configuration.roles.SECURITY_MANAGER,finalObject.company,function() {});
                            return res.send(finalObject);
                        }
                    });
                }
            });
        },
        /**
         * Shows all the External Security task
         */
        all: function(req, res) {
            require('../models/external_securitytask')(req.companyDb);
            var ExternalSecurityTaskModel = req.companyDb.model('ExternalSecurityTask');
            ExternalSecurityTaskModel.find().exec(function(err, externalSecurityTasks) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "extenalsecuritytask", "Failed to fetch External Security Tasks", err);
                    return res.status(400).json({
                        error: 'Cannot list the External Security Tasks'
                    });
                }
                return res.json(externalSecurityTasks);
            });
        },
        attachInvoice: function(req, res) {
            var form = new multiparty.Form();
            form.parse(req, function(err, fields, files) {
                if (files.file[0].originalFilename.split('.').pop() !== 'pdf' && files.file[0].originalFilename.split('.').pop() !== 'jpg' && files.file[0].originalFilename.split('.').pop() !== 'jpeg') {
                    return res.status(400).json({
                        'Error': 'File Format Not Supported.'
                    });
                } else {
                	if(!req.user){
                		 upload.uploadFile(files,'SYSTEM', "/externalSecuritytaskUpload/", files.file[0].originalFilename, function(filepath) {
                             return res.send(filepath);
                         });
                	}else{
                    upload.uploadFile(files, req.user.company.database, "/externalSecuritytaskUpload/", files.file[0].originalFilename, function(filepath) {
                        return res.send(filepath);
                    });
                  }
                }
            });
        },

        alltask: function(req, res) {
            require('../models/external_securitytask')(req.companyDb);
            var ExternalSecurityTaskModel = req.companyDb.model('ExternalSecurityTask');
            ExternalSecurityTaskModel.find({ securitytask: req.query.securitytaskId }).populate('company').exec(function(err, externaltasks) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "extenalsecuritytask", "Failed to fetch External Security Tasks", err);
                    return res.status(400).json({
                        error: 'Cannot list the External Security Tasks'
                    });
                }
                return res.json(externaltasks);
            });
        },
        externaltaskUpload: function(req, res) {
            var form = new multiparty.Form();
            form.parse(req, function(err, fields, files) {
                if (files.file[0].originalFilename.split('.').pop() !== 'jpg' && files.file[0].originalFilename.split('.').pop() !== 'jpeg') {
                    return res.status(400).json({
                        'Error': 'File Format Not Supported.'
                    });
                } else {
                    upload.uploadFile(files, req.user.company.database, "/externaltaskUpload/", files.file[0].originalFilename, function(filepath) {
                        return res.send(filepath);
                    });
                }
            });
        }
    };
}
