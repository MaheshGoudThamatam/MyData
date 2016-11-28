'use strict';
/** Name : Audit Category Controller
 * Description : In this controller Audit Categories are created by the super admin and Security Manager.
 * @ <author> Anto Steffi 
 * @ <date> 24-June-2016
 * @ METHODS: create, get, update, soft delete
 */
/** Modification
 * @ <author> Anto Steffi 
 * @ <date> 13-July-2016
 * @ METHODS: modified destroy method
 */
/** Modification
 * @ <author> Anto Steffi 
 * @ <date> 14-July-2016, 15-July-2016
 * @ METHODS: modified create method, fetching audit questions based on audit category id, update method
 */
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    AuditCategoryModel = mongoose.model('AuditCategory'),
    AuditQuestionModel = mongoose.model('AuditQuestion'),
    _ = require('lodash'),
    uuid = require('node-uuid'),
    fs = require('fs'),
    XLSX = require('xlsx'),
    async = require('async'),
    upload = require('../../../../contrib/meanio-system/server/services/bulkUpload.js'),
    multiparty = require('multiparty'),
    mime = require('mime'),
    logger = require('../../../../contrib/meanio-system/server/controllers/logs.js'),
    path = require('path');
var finalCategory = {};
finalCategory.result = [];
var configuration = require('../../../../custom/actsec/server/config/config.js');
var validateAuditObj = function(auditcategory, callbackUO) {
    auditcategory.errors = [];
    auditcategory.warnings = [];
    async.waterfall([
        async.apply(validAuditQuestion, auditcategory)
    ], function(err) {
        if (auditcategory) {
            delete auditcategory.companyDB;
            finalCategory.result.push(auditcategory);
            callbackUO();
        }
    });
};
var validAuditQuestion = function(auditcategory, callbackQuestion) {
    if ((auditcategory.audit_question).trim().length > 0) {
        callbackQuestion(null, auditcategory);
    } else {
        auditcategory.errors.push('Audit question cannot be blank');
        callbackQuestion(null, auditcategory);
    }
};
module.exports = function(AuditCategoryCtrl) {
    return {
        /**
         * Loads the Audit Categories based on id
         */
        auditCategory: function(req, res, next, id) {
            AuditCategoryModel.load(id, function(err, auditCategory) {
                if (err) {
                    if ((req.user.role._id + '') !== configuration.roles.SUPER_ADMIN) {
                        logger.error(req, req.user.company.company_name, "audit-category", "Failed to fetch audit ctagory", {
                            _id: id
                        }, err);
                    } else {
                        logger.error(req, "SUPERADMIN", "audit-category", "Failed to fetch audit category", {
                            _id: id
                        }, err);
                    }
                    return next(err);
                }
                if (!auditCategory) {
                    return next(new Error('Failed to load  Audit Category ' + id));
                }
                req.auditCategory = auditCategory;
                next();
            });
        },
        /**
         * Create a new Audit Category
         */
        create: function(req, res) {
            if ((req.user.role._id + '') !== configuration.roles.SUPER_ADMIN) {
                //For users other than SUPER_ADMIN
                req.assert('name', 'You must enter Audit Category name').notEmpty();
                req.assert('description', 'You must enter description').notEmpty();
                var errors = req.validationErrors();
                if (errors) {
                    return res.status(400).send(errors);
                }
                var auditCategoryObj = {
                    "name": req.body.name,
                    "description": req.body.description,
                    "company": req.user.company._id,
                    "questionscount": req.body.questionscount,
                    "createdBy": req.user._id
                };
                var auditCategory = new AuditCategoryModel(auditCategoryObj);
                auditCategory.save(function(err, docs) {
                    if (err) {
                        switch (err.code) {
                            case 11000:
                            case 11001:
                                return res.status(400).json([{
                                    msg: ' Name already exists',
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

                                    logger.error(req, req.user.company.company_name, "audit-category", "Failed to create audit ctagory", auditCategory, err);
                                    return res.status(400).json(modelErrors);
                                }
                        }
                    } else {
                        async.each(req.body.auditQuestions, function(auditQuestionsObj, callbackAuditcategory) {
                            var auditQuestionObj = {
                                "audit_question": auditQuestionsObj.audit_question,
                                "audit_category": docs._id,
                                "company": req.user.company._id,
                                "sequence": auditQuestionsObj.sequence,
                                "securityTask": auditQuestionsObj.securityTask
                            };
                            var auditQuestion = new AuditQuestionModel(auditQuestionObj);
                            auditQuestion.save(function(err) {
                                if (err) {
                                    logger.error(req, req.user.company.company_name, "audit-category", "Failed to save audit question", auditQuestion, err);
                                    return res.status(400).json({
                                        error: 'Could not save question'
                                    });
                                } else {
                                    callbackAuditcategory();
                                }
                            });
                        }, function(err) {
                            if (err) {} else {
                                logger.log(req, req.user.company.company_name, "audit-category", "audit-category created successfully", auditCategory);
                                return res.json(200);
                            }
                        });
                    }
                });
            } else { //For SUPER_ADMIN users
                req.assert('name', 'You must enter Audit Category name').notEmpty();
                req.assert('description', 'You must enter description').notEmpty();
                var errors = req.validationErrors();
                if (errors) {
                    return res.status(400).send(errors);
                }
                var auditCategoryObj = {
                    "name": req.body.name,
                    "description": req.body.description,
                    "questionscount": req.body.questionscount,
                    "admin": true,
                    "createdBy": req.user._id
                };
                var auditCategory = new AuditCategoryModel(auditCategoryObj);
                auditCategory.save(function(err, docs) {
                    if (err) {
                        switch (err.code) {
                            case 11000:
                            case 11001:
                                return res.status(400).json([{
                                    msg: ' Name already exists',
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
                                    logger.error(req, "SUPERADMIN", "audit-category", "Failed to create audit ctagory", auditCategory, err);
                                    return res.status(400).json(modelErrors);
                                }
                        }
                    } else {
                        async.each(req.body.auditQuestions, function(auditQuestionsObj, callbackAuditcategory) {
                            var auditQuestionObj = {
                                "audit_question": auditQuestionsObj.audit_question,
                                "audit_category": docs._id,
                                "sequence": auditQuestionsObj.sequence,
                                "securityTask": auditQuestionsObj.securityTask
                            };
                            var auditQuestion = new AuditQuestionModel(auditQuestionObj);
                            auditQuestion.save(function(err) {
                                if (err) {
                                    logger.error(req, "SUPERADMIN", "audit-category", "Failed to save audit question", auditQuestion, err);
                                    return res.status(400);
                                    callbackAuditcategory();
                                } else {
                                    callbackAuditcategory();
                                }
                            });
                        }, function(err) {
                            if (err) {} else {
                                logger.log(req, "SUPERADMIN", "audit-category", "audit-category created successfully", auditCategory);
                                return res.json(200);
                            }
                        });
                    }
                });
            }
        },
        /**
         * Shows all the Audit Categories
         */
        all: function(req, res) {
            if ((req.user.role._id + '') !== configuration.roles.SUPER_ADMIN) { //For users other than SUPER_ADMIN
                var auditQuery = {
                    "company": req.user.company._id
                };
                AuditCategoryModel.find(auditQuery).sort({
                    name: 'asc'
                }).exec(function(err, auditCategories) {
                    if (err) {
                        logger.error(req, req.user.company.company_name, "audit-category", "Failed to list auditCategories", {
                            company: req.user.company._id
                        }, err);
                        return res.status(500).json({
                            error: 'Cannot list the audit auditCategories'
                        });
                    } else {
                        AuditCategoryModel.find({
                            "admin": true
                        }).sort({
                            name: 'asc'
                        }).exec(function(err, adminAudits) {
                            if (err) {
                                logger.error(req, req.user.company.company_name, "audit-category", "Cannot list the pristine roles", {
                                    admin: true
                                }, err);
                                return res.status(500).json({
                                    error: 'Cannot list the pristine roles'
                                });
                            } else {
                                var results = {};
                                results.adminAudits = adminAudits;
                                results.auditCategories = auditCategories;
                                return res.json(results);
                            }
                        });
                    }
                });
            } else { // For SUPER_ADMIN users
                var auditQuery = {
                    "admin": true
                };
                AuditCategoryModel.find(auditQuery).sort({
                    name: 'asc'
                }).exec(function(err, auditCategories) {
                    if (err) {
                        logger.error(req, "SUPERADMIN", "audit-category", "Failed to list auditCategories", {
                            admin: true
                        }, err);
                        return res.status(500).json({
                            error: 'Cannot list the auditCategories'
                        });
                    } else {
                        AuditCategoryModel.find({
                            "admin": false,
                        }).sort({
                            name: 'asc'
                        }).exec(function(err, pristines) {
                            if (err) {
                                logger.error(req, "SUPERADMIN", "audit-category", "Failed to list pristine roles", {
                                    admin: false
                                }, err);
                                return res.status(500).json({
                                    error: 'Cannot list the pristine roles'
                                });
                            } else {
                                var results = {};
                                results.auditCategories = auditCategories;
                                return res.json(results);
                            }
                        });
                    }
                });
            }
        },
        /**
         * Shows the single Audit Category
         */
        show: function(req, res) {
            return res.json(req.auditCategory);
        },
        /**
         * Updates the edited Audit Category
         */
        update: function(req, res) {
            var allowUpdate = true;
            req.body.updatedBy = req.user._id;
            req.assert('name', 'You must enter Audit Category name').notEmpty();
            req.assert('description', 'You must enter description').notEmpty();
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            var auditCategory_before = req.auditCategory.toObject();
            var auditCategory = req.auditCategory;
            auditCategory = _.extend(auditCategory, req.body);
            if (auditCategory.admin) {
                if ((req.user.role._id + '') === configuration.roles.SUPER_ADMIN) {
                    allowUpdate = true;
                } else {
                    allowUpdate = false;
                }
            }
            if (allowUpdate) {
                auditCategory.save(function(err) {
                    if (err) {
                        switch (err.code) {
                            case 11000:
                            case 11001:
                                return res.status(400).json([{
                                    msg: ' Name already exists',
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
                                    if ((req.user.role._id + '') !== configuration.roles.SUPER_ADMIN) {
                                        logger.error(req, req.user.company.company_name, "audit-category", "Failed to update audit questions", auditCategory, err);
                                    } else {
                                        logger.error(req, "SUPERADMIN", "audit-category", "Failed to update audit questions", auditCategory, err);
                                    }
                                    return res.status(400).json(modelErrors);
                                }
                        }
                        return res.status(400);
                    } else {
                        async.waterfall([function(done) {
                            AuditQuestionModel.remove({
                                "audit_category": req.params.auditCategoryId,
                                $softRemove: false
                            }, function(err) {
                                if (err) {
                                    if ((req.user.role._id + '') !== configuration.roles.SUPER_ADMIN) {
                                        logger.error(req, req.user.company.company_name, "audit-category", "Failed to remove audit questions", {
                                            audit_category: req.params.auditCategoryId,
                                            $softRemove: false
                                        }, err);
                                    } else {
                                        logger.error(req, "SUPERADMIN", "audit-category", "Failed to remove audit questions", {
                                            audit_category: req.params.auditCategoryId,
                                            $softRemove: false
                                        }, err);
                                    }
                                    done(err);
                                } else {
                                    done();
                                }
                            });
                        }, function(done) {
                            async.each(req.body.auditQuestions, function(auditQuestionsObj, callbackAuditcategory) {
                                if ((req.user.role._id + '') !== configuration.roles.SUPER_ADMIN) {
                                    var auditQ = {
                                        "audit_question": auditQuestionsObj.audit_question,
                                        "audit_category": req.params.auditCategoryId,
                                        "company": req.user.company._id,
                                        "sequence": auditQuestionsObj.sequence,
                                        "securityTask": auditQuestionsObj.securityTask,
                                    };
                                } else {
                                    //No company field for super admin added categories
                                    var auditQ = {
                                        "audit_question": auditQuestionsObj.audit_question,
                                        "audit_category": req.params.auditCategoryId,
                                        "sequence": auditQuestionsObj.sequence,
                                        "securityTask": auditQuestionsObj.securityTask
                                    };
                                }
                                var auditQuestion = new AuditQuestionModel(auditQ);
                                auditQuestion.save(function(err) {
                                    if (err) {
                                        if ((req.user.role._id + '') !== configuration.roles.SUPER_ADMIN) {
                                            logger.error(req, req.user.company.company_name, "audit-category", "Failed to save audit question", auditQuestion, err);
                                        } else {
                                            logger.error(req, "SUPERADMIN", "audit-category", "Failed to save audit question", auditQuestion, err);
                                        }
                                        callbackAuditcategory(err);
                                    } else {
                                        callbackAuditcategory();
                                    }
                                });
                            }, function(err) {
                                if (err) {
                                    done(err);
                                } else {
                                    done();
                                }
                            });
                        }], function(err) {
                            if (err) {
                                return res.status(400).json({
                                    'error': err
                                });
                            } else {
                                if ((req.user.role._id + '') !== configuration.roles.SUPER_ADMIN) {
                                    logger.delta(req, req.user.company.company_name, "audit-category", "audit-category updated successfully", auditCategory_before, auditCategory);
                                } else {
                                    logger.delta(req, "SUPERADMIN", "audit-category", "audit-category updated successfully", auditCategory_before, auditCategory);
                                }
                                return res.json({
                                    success: true
                                });
                            }
                        });
                    }
                });
            } else {
               return res.status(403).json('unauthorized')
            }
        },
        /**
         * Delete a Audit Category
         */
        destroy: function(req, res) {
            require('../models/audit')(req.companyDb);
            var AuditModel = req.companyDb.model('Audit');
            require('../models/audit-perform')(req.companyDb);
            var AuditPerformModel = req.companyDb.model('AuditPerform');
            AuditModel.find({
                "audit_category": req.auditCategory._id,
                "isPerformed": false
            }, function(err, audit) {
                if (err) {
                    return res.status(400).json({
                        error: 'Cannot find the Audit'
                    });
                } else {
                    if (audit.length > 0) {
                        return res.status(400).json('Cannot Delete Audit Category assigned to audit which is not performed yet');
                    } else {
                        async.waterfall([function(done) {
                            var auditCategory = req.auditCategory;
                            auditCategory.remove(function(err) {
                                if (err) {
                                    return res.status(400).json({
                                        error: 'Cannot delete the Audit Category'
                                    });
                                } else {
                                    done();
                                }
                            });
                        }, function(done) {
                            AuditQuestionModel.find({
                                "audit_category": req.auditCategory._id
                            }, function(err, questionsArray) {
                                if (err) {
                                    if ((req.user.role._id + '') !== configuration.roles.SUPER_ADMIN) {
                                        logger.error(req, req.user.company.company_name, "audit-category", "Failed to fetch audit question", {
                                            audit_category: req.auditCategory._id
                                        }, err);
                                    } else {
                                        logger.error(req, "SUPERADMIN", "audit-category", "Failed to fetch audit question", {
                                            audit_category: req.auditCategory._id
                                        }, err);
                                    }
                                    return res.status(400).json({
                                        error: 'Cannot delete the Audit questions'
                                    });
                                } else {
                                    done(null, questionsArray);
                                }
                            });
                        }, function(auditquestionsArray, done) {
                            async.each(auditquestionsArray, function(questionobject, callbackquestions) {
                                AuditQuestionModel.remove({
                                    "audit_category": questionobject.audit_category
                                }, function(err) {
                                    if (err) {
                                        if ((req.user.role._id + '') !== configuration.roles.SUPER_ADMIN) {
                                            logger.error(req, req.user.company.company_name, "audit-category", "Failed to delete audit question", {
                                                audit_category: questionobject.audit_category
                                            }, err);
                                        } else {
                                            logger.error(req, "SUPERADMIN", "audit-category", "Failed to delete audit question", {
                                                audit_category: questionobject.audit_category
                                            }, err);
                                        }
                                        return res.status(400).json({
                                            error: 'Cannot delete the Audit questions'
                                        });
                                    } else {
                                        callbackquestions();
                                    }
                                });
                            }, function(err) {
                                done();
                            });
                        }], function(err) {
                            if ((req.user.role._id + '') !== configuration.roles.SUPER_ADMIN) {
                                logger.log(req, req.user.company.company_name, "audit-category", "audit-category deleted successfully", req.auditCategory);
                            } else {
                                logger.log(req, "SUPERADMIN", "audit-category", "audit-category deleted successfully", req.auditCategory);

                            }

                            return res.sendStatus(200);
                        });
                    }
                }
            });
        },
        /**
         * Fetching audit questions based on audit category id
         */
        auditQuestionsBasedOnAuditCategory: function(req, res) {
            AuditQuestionModel.find({
                audit_category: req.params.auditCategoryId
            }).sort({
                sequence: 'asc'
            }).exec(function(err, auditQuestions) {
                if (err) {
                    if ((req.user.role._id + '') !== configuration.roles.SUPER_ADMIN) {
                        logger.error(req, req.user.company.company_name, "audit-category", "Failed to find audit question", {
                            audit_category: req.params.auditCategoryId
                        }, err);
                    } else {
                        logger.error(req, "SUPERADMIN", "audit-category", "Failed to find audit question", {
                            audit_category: req.params.auditCategoryId
                        }, err);
                    }
                    return res.status(500).json({
                        error: 'Cannot find the audit questions'
                    });
                }
                return res.json(auditQuestions);
            });
        },
        auditCategoryBulkUpload: function(req, res) {
            var result = {};
            var error = [];
            finalCategory.result = [];
            async.waterfall([function(done) {
                    var form = new multiparty.Form();
                    form.parse(req, function(err, fields, files) {
                        if (files.file[0].originalFilename.split('.').pop() !== 'xls' && files.file[0].originalFilename.split('.').pop() !== 'xlsx') {
                            return res.status(400).json({
                                'Error': 'File Format Not Supported.'
                            });
                        } else {
                            if ((req.user.role._id + '') !== configuration.roles.SUPER_ADMIN) {
                                var folderPath = req.user.company.database;
                            } else {
                                var folderPath = 'Super Admin';
                            }
                            upload.uploadFile(files, folderPath, "/auditquestionsbulkupload/", files.file[0].originalFilename, function(filepath) {
                                var workbook = XLSX.readFile(filepath);
                                var roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets.Sheet1);
                                if (roa.length > 0) {
                                    var keysArray = Object.keys(roa[0]);
                                    if (keysArray[0] == 'audit_question') {
                                        result.auditCategories = roa;
                                        done(null, result)
                                    } else {
                                        done('Missing fields or file format is incorrect.');
                                    }
                                } else {
                                    done('Empty File');
                                }
                            });
                        }
                    });
                },
                function(result, done) {
                    async.each(result.auditCategories, function(auditcategory, callbackAsync) {
                        auditcategory.companyDB = req.companyDb;
                        validateAuditObj(auditcategory, callbackAsync);
                    }, function(err) {
                        if (err) {} else {
                            done(null, finalCategory);
                        }
                    });
                },
                function(finalCategory, done) {
                    if ((req.user.role._id + '') !== configuration.roles.SUPER_ADMIN) {
                        async.eachSeries(finalCategory.result, function(successObj, callbackSuccess) {
                            if (successObj.errors.length <= 0) {
                                AuditCategoryModel.findOne({
                                    "_id": req.params.auditCategoryId,
                                    "company": req.user.company._id,
                                    "admin": false
                                }, function(err, docs) {
                                    if (err) {
                                        logger.error(req, req.user.company.company_name, "audit-category", "Failed to load audit category", {
                                            _id: req.params.auditCategoryId,
                                            company: req.user.company._id,
                                            admin: false
                                        }, err);
                                        successObj.errors.push(err);
                                        callbackSuccess();
                                    } else {
                                        if (!docs) {
                                            successObj.errors.push("Audit category not present");
                                            callbackSuccess();
                                        } else {
                                            var auditQuestionObj = {
                                                "audit_question": successObj.audit_question,
                                                "audit_category": docs._id,
                                                "company": req.user.company._id
                                            };
                                            var auditQuestion = new AuditQuestionModel(auditQuestionObj);
                                            auditQuestion.save(function(err, docs) {
                                                if (err) {
                                                    logger.error(req, req.user.company.company_name, "audit-category", "Failed to save audit question", auditQuestion, err);
                                                    callbackSuccess();
                                                } else {
                                                    AuditQuestionModel.count({
                                                        "audit_category": docs.audit_category
                                                    }, function(err, count) {
                                                        AuditCategoryModel.findOne({
                                                            "_id": docs.audit_category
                                                        }, function(err, categorydocument) {
                                                            if (err) {
                                                                callbackSuccess();
                                                            } else {
                                                                categorydocument.questionscount = count;
                                                                categorydocument.save(function(err) {
                                                                    if (err) {
                                                                        callbackSuccess();
                                                                    } else {
                                                                        docs.sequence = count;
                                                                        docs.save(function(err) {
                                                                            if (err) {
                                                                                callbackSuccess();
                                                                            } else {
                                                                                callbackSuccess();
                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    });
                                                }
                                            });
                                        }
                                    }
                                });
                            } else {
                                callbackSuccess();
                            }
                        }, function(err) {
                            done(null, finalCategory);
                        });
                    } else {
                        async.eachSeries(finalCategory.result, function(successObj, callbackSuccess) {
                            if (successObj.errors.length <= 0) {
                                AuditCategoryModel.findOne({
                                    "_id": req.params.auditCategoryId,
                                    "admin": true
                                }, function(err, docs) {
                                    if (err) {
                                        logger.error(req, "SUPERADMIN", "audit-category", "Failed to load audit category", {
                                            _id: req.params.auditCategoryId,
                                            admin: true
                                        }, err);
                                        successObj.errors.push(err);
                                        callbackSuccess();
                                    } else {
                                        if (!docs) {
                                            successObj.errors.push("Audit category not present");
                                            callbackSuccess();
                                        } else {
                                            var auditQuestionObj = {
                                                "audit_question": successObj.audit_question,
                                                "audit_category": docs._id,
                                            };
                                            var auditQuestion = new AuditQuestionModel(auditQuestionObj);
                                            auditQuestion.save(function(err, docs) {
                                                if (err) {
                                                    logger.error(req, "SUPERADMIN", "audit-category", "Failed to save audit question", auditQuestion, err);
                                                    callbackSuccess();
                                                } else {
                                                    AuditQuestionModel.count({
                                                        "audit_category": docs.audit_category
                                                    }, function(err, count) {
                                                        AuditCategoryModel.findOne({
                                                            "_id": docs.audit_category
                                                        }, function(err, categorydocument) {
                                                            if (err) {
                                                                callbackSuccess();
                                                            } else {
                                                                categorydocument.questionscount = count;
                                                                categorydocument.save(function(err) {
                                                                    if (err) {
                                                                        callbackSuccess();
                                                                    } else {
                                                                        docs.sequence = count;
                                                                        docs.save(function(err) {
                                                                            if (err) {
                                                                                callbackSuccess();
                                                                            } else {
                                                                                callbackSuccess();
                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    });
                                                }
                                            });
                                        }
                                    }
                                });
                            } else {
                                callbackSuccess();
                            }
                        }, function(err) {
                            if (error.length > 0) {
                                finalCategory.errors.push(err);
                                done(null, finalCategory);
                            } else {
                                done(null, finalCategory);
                            }
                        });
                    }
                }
            ], function(err, result) {
                if (err) {
                    return res.status(400).json({
                        error: 'Error while creating questions ' + err
                    });
                } else {
                    return res.send(result);
                }
            });
        },
        auditBulkUploadTemplate: function(req, res) {
            var file = path.resolve(__dirname, '../../../../custom/actsec/public/assets/static/bulkupload_auditquestions_template.xlsx');
            var filename = path.basename(file);
            var mimetype = mime.lookup(file);
            res.setHeader('Content-disposition', 'attachment; filename=' + filename);
            res.setHeader('Content-type', mimetype);
            var filestream = fs.readFileSync(file, 'binary');
            res.write(filestream, 'binary');
            res.end();
        }
    }
};
