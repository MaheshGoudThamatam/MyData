'use strict';
/**
 * Name : Audit Controller Description : In this controller Audits are created
 * by the super admin and Security Manager for a particular company. @ <author>
 * Sanjana @ <date> 11-July-2016 @ METHODS: create, get, update, soft delete
 */
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
mail = require('../../../../contrib/meanio-system/server/services/mailService.js'),
nodemailer = require('nodemailer'),
templates = require('../../../../custom/actsec/server/config/cron_template.js'),
    _ = require('lodash');
var async = require('async');
var UserModel = mongoose.model('User');
var AuditCategoryModel = mongoose.model('AuditCategory');
var config = require('../../../../custom/actsec/server/config/config.js');
var logger = require('../../../../contrib/meanio-system/server/controllers/logs.js');
module.exports = function(AuditCtrl) {
    return {
        /**
         * load user buildings
         */
        userLocation: function(req, res) {
            require('../../../../custom/location/server/models/location.js')(req.companyDb);
            var LocationModel = req.companyDb.model('Location');
            var locArray = req.user.locations;
            var locationArray = [];
            async.each(locArray, function(loc, callback) {
                LocationModel.findOne({
                    _id: loc
                }, function(err, location) {
                    if (err) {
                        logger.error(req, req.user.company.company_name, "audit", "Failed to fetch user locations", {
                            _id: loc
                        }, err);
                        callback(err);
                    } else {
                        locationArray.push(location);
                        callback();
                    }
                });
            }, function(err) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "audit", "Failed to fetch user locations", {
                        _id: loc
                    }, err);
                    return res.status(500).json({
                        error: 'Failed to fetch user locations' + err
                    });
                }
                return res.json(locationArray);
            });
        },
        /**
         * load user locations
         */
        userBuilding: function(req, res) {
            require('../../../../custom/building/server/models/building.js')(req.companyDb);
            var BuildingModel = req.companyDb.model('Building');
            BuildingModel.find({
                location: req.query.locationId
            }, function(err, buildings) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "audit", "Failed to fetch buildings", {
                        location: req.query.locationId
                    }, err);
                    return res.status(500).json({
                        error: 'Cannot list the buildings'
                    });
                }
                var buildingArray = [];
                var userBuildings = req.user.buildings;
                async.eachSeries(buildings, function(building, callback) {
                    if (userBuildings.indexOf(building._id) > -1) {
                        buildingArray.push(building);
                        callback();
                    }
                }, function(err) {
                    return res.json(buildingArray);
                });
            });
        },
        /**
         * Loads the Audit based on id
         */
        audit: function(req, res, next, id) {
            require('../models/audit')(req.companyDb);
            var AuditModel = req.companyDb.model('Audit');
            // require('../models/audit-category')(req.companyDb);
            require('../../../../custom/location/server/models/location.js')(req.companyDb);
            var LocationModel = req.companyDb.model('Location');
            require('../../../../custom/building/server/models/building.js')(req.companyDb);
            var BuildingModel = req.companyDb.model('Building');
            AuditModel.load(id, function(err, audit) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "audit", "Failed to fetch audit", {
                        _id: id
                    }, err);
                    return next(err);
                }
                if (!audit) {
                    logger.error(req, req.user.company.company_name, "audit", "Failed to load audit", {
                        _id: id
                    }, err);
                    return next(new Error('Failed to load  Audit  ' + id));
                }
                req.auditObj = audit;
                audit = audit.toJSON();
                LocationModel.findOne({
                    _id: audit.location
                }, function(err, location) {
                    if (err) {
                        logger.error(req, req.user.company.company_name, "audit", "Failed to fetch location", {
                            _id: audit.location
                        }, err);
                        return next(err);
                    }
                    if (!location) {
                        logger.error(req, req.user.company.company_name, "audit", "Failed to load location", {
                            _id: audit.location
                        }, err);
                        return next(new Error('Failed to load  Audit  ' + id));
                    }
                    audit.location = location;
                    BuildingModel.findOne({
                        _id: audit.building
                    }, function(err, building) {
                        if (err) {
                            logger.error(req, req.user.company.company_name, "audit", "Failed to fetch building", {
                                _id: audit.building
                            }, err);
                            return next(err);
                        }
                        if (!building) {
                            logger.error(req, req.user.company.company_name, "audit", "Failed to load building", {
                                _id: audit.building
                            }, err);
                            return next(new Error('Failed to load  Audit  ' + id));
                        }
                        audit.building = building;
                        UserModel.findOne({
                            _id: audit.security_manager
                        }, function(err, manager) {
                            if (err) {
                                logger.error(req, req.user.company.company_name, "audit", "Failed to fetch user", {
                                    _id: audit.security_manager
                                }, err);
                                return next(err);
                            }
                            if (!manager) {
                                logger.error(req, req.user.company.company_name, "audit", "Failed to load user", {
                                    _id: audit.security_manager
                                }, err);
                                return next(new Error('Failed to load  Audit  ' + id));
                            }
                            audit.security_manager = manager;
                            AuditCategoryModel.findOne({
                                _id: audit.audit_category
                            }, function(err, auditCategory) {
                                if (err) {
                                    logger.error(req, req.user.company.company_name, "audit", "Failed to fetch catergory", {
                                        _id: audit.audit_category
                                    }, err);
                                    return next(err);
                                }
                                if (!auditCategory) {
                                    logger.error(req, req.user.company.company_name, "audit", "Failed to load catergory", {
                                        _id: audit.audit_category
                                    }, err);
                                    return next(new Error('Failed to load  Audit  ' + id));
                                }
                                audit.audit_category = auditCategory;
                                req.audit = audit;
                                next();
                            });
                        });
                    });
                });
            });
        },
        /**
         * load users for that building
         * */
        loadUsers: function(req, res) {
            UserModel.find({
                buildings: req.query.buildings
            }, function(err, users) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "audit", "Failed to list securityManagers", {
                        company: req.user.company,
                        role: config.roles.SECURITY_MANAGER
                    }, err);
                    return res.status(400).json({
                        error: 'Cannot list the users'
                    });
                }
                return res.json(users);
            });
        },
        /**
         * Create a new Audit
         */
        create: function(req, res) {
            require('../models/audit')(req.companyDb);
            var AuditModel = req.companyDb.model('Audit');
            var auditArray = [];
            req.assert('name', 'You must enter Audit name').notEmpty();
            req.assert('description', 'You must enter description').notEmpty();
            req.assert('location', 'You must select atleast one location').notEmpty();
            req.assert('building', 'You must select atleast one building').notEmpty();
            req.assert('security_manager', 'You must select one security_manager').notEmpty();
            var errors = [];
            var validationError = req.validationErrors()
            if (Array.isArray(validationError)) {
                errors = errors.concat(req.validationErrors());
            }
            if (!req.body.audit_category || req.body.audit_category.length == 0) {
                var errorObj = {
                    "param": "audit_category",
                    "msg": "You must select atleast one audit catergory"
                }
                errors.push(errorObj)
            }
            if (errors.length > 0) {
                return res.status(400).send(errors);
            }
            var auditCategories = req.body.audit_category;
            async.each(auditCategories, function(auditCategory, callback) {
                if (!auditCategory.auditCategoryid) {
                    var errorObj = {
                        "param": "audit_category.auditCategoryid",
                        "msg": "You must select atleast one audit catergory"
                    }
                    errors.push(errorObj)
                }
                if (!auditCategory.date) {
                    var errorObj = {
                        "param": "audit_category.date",
                        "msg": "You must enter date"
                    }
                    errors.push(errorObj)
                }
            })
            if (errors.length > 0) {
                return res.status(400).send(errors);
            }
            async.each(auditCategories, function(auditCategory, callback) {
                var auditObj = {
                    "name": req.body.name,
                    "description": req.body.description,
                    "company": req.user.company,
                    "building": req.body.building,
                    "security_manager": req.body.security_manager,
                    "audit_category": auditCategory.auditCategoryid,
                    "createdBy": req.user.company,
                    "date": auditCategory.date,
                    "location": req.body.location
                }
                var audit = new AuditModel(auditObj);
                audit.save(function(err) {
                    if (err) {
                        logger.error(req, req.user.company.company_name, "audit", "Failed to create audit", audit, err);
                        callback(err);
                    } else {
                        logger.log(req, req.user.company.company_name, "audit", "audit created successfully", audit);
                        auditArray.push(audit);
                        callback();
                    }
                });
            }, function(err) {
                if (err) {
                    return res.status(500);
                } else {
                    var resp = {
                        "auditArray": auditArray
                    }
                    return res.json(resp);
                }
            });
        },
        /**
         * Shows all the Audits
         */
        all: function(req, res) {
            require('../models/audit')(req.companyDb);
            var AuditModel = req.companyDb.model('Audit');
            var overdueArray = [];
            var immediateArray = [];
            var day7Array = [];
            var day30Array = [];
            AuditModel.find({
                building: req.query.buildingId,
                isPerformed: false
            }).exec(function(err, audits) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "audit", "Failed to create audit", {
                        building: req.query.buildingId,
                        isPerformed: false
                    }, err);
                    return res.status(400).json({
                        error: 'Cannot list the Audits'
                    });
                }
                async.eachSeries(audits, function(audit, callback) {
                    AuditCategoryModel.findOne({
                        _id: audit.audit_category
                    }, function(err, auditCategory) {
                        if (err) {
                            logger.error(req, req.user.company.company_name, "audit", "Failed to create audit", {
                                _id: audit.audit_category
                            }, err);
                            callback(err);
                        } else {
                            if (auditCategory) {
                                delete audit.audit_category;
                                audit = audit.toObject();
                                audit.audit_category = auditCategory.toObject();
                                var date = audit.date;
                                var today = new Date();
                                var diff = Math.floor(date - today);
                                var day = 1000 * 60 * 60 * 24;
                                var days = Math.floor(diff / day);
                                if (days < -1) {
                                    overdueArray.push(audit);
                                } else if (days >= -1 && days < 7) {
                                    immediateArray.push(audit);
                                } else if (days <= 30 && days >= 7) {
                                    day7Array.push(audit);
                                } else if (days > 30) {
                                    day30Array.push(audit);
                                }
                                callback();
                            } else {
                                callback();
                            }
                        }
                    });
                }, function(err) {
                    if (err) {
                        return res.status(500);
                    } else {
                        var auditAll = {
                            "overdueArray": overdueArray,
                            "immediateArray": immediateArray,
                            "day7Array": day7Array,
                            "day30Array": day30Array
                        }
                        return res.json(auditAll);
                    }
                });
            });
        },
        allAuditsPercentge: function(req, res) {
            require('../models/audit')(req.companyDb);
            var AuditModel = req.companyDb.model('Audit');
            var auditresult = {};
            auditresult.totalAudits = 0;
            auditresult.completedAudits = 0;
            auditresult.errorLog = [];
            if (req.body.month == 'all') {
                var start = new Date(req.body.year, 0, 1);
                var end = new Date(req.body.year, 11, 31);
            } else {
                var start = new Date(req.body.year, req.body.month - 1, 1);
                var d = new Date(req.body.year, req.body.month, 0);
                var end = d;
            }
            async.eachSeries(req.user.buildings, function(buildingId, callback) {
                AuditModel.find({
                    building: buildingId,
                    date: {
                        $gte: start,
                        $lt: end
                    }
                }).exec(function(err, audits) {
                    if (err) {
                        auditresult.errorLog.push('cannot list audits for' + buildingId);
                        callback();
                    } else {
                        AuditModel.find({
                            building: buildingId,
                            isPerformed: true,
                            date: {
                                $gte: start,
                                $lt: end
                            }
                        }).exec(function(err, auditsPerformed) {
                            if (err) {
                                auditresult.errorLog.push('cannot list auditsPerformed for' + buildingId);
                                callback();
                            } else {
                                auditresult.totalAudits = auditresult.totalAudits + audits.length;
                                auditresult.completedAudits = auditresult.completedAudits + auditsPerformed.length;
                                callback();
                            }
                        });
                    }
                });
            }, function(err) {
                if (err) {
                    return res.status(400).json(err);
                }
                auditresult.percentage = (auditresult.completedAudits / auditresult.totalAudits) * 100;
                res.json(auditresult);
            });
        },
        /**
         * Shows the single Audits
         */
        show: function(req, res) {
            require('../models/audit')(req.companyDb);
            var AuditModel = req.companyDb.model('Audit');
            return res.json(req.audit);
        },
        /**
         * Updates the edited Audit
         */
        update: function(req, res) {
            require('../models/audit')(req.companyDb);
            var AuditModel = req.companyDb.model('Audit');
            req.body.updatedBy = req.user._id;
            var audit_before = req.auditObj.toObject();
            var audit = req.auditObj
            audit = _.extend(audit, req.body);
            req.assert('name', 'You must enter Audit name').notEmpty();
            req.assert('description', 'You must enter description').notEmpty();
            req.assert('audit_category', 'You must select atleast one audit catergory').notEmpty();
            req.assert('location', 'You must select atleast one location').notEmpty();
            req.assert('building', 'You must select atleast one building').notEmpty();
            req.assert('security_manager', 'You must select one security manager').notEmpty();
            req.assert('date', 'You must enter date').notEmpty();
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            audit.save(function(err) {
                if (err) {
                    switch (err.code) {
                        default: var modelErrors = [];
                        if (err.errors) {
                            for (var x in err.errors) {
                                modelErrors.push({
                                    param: x,
                                    msg: err.errors[x].message,
                                    value: err.errors[x].value
                                });
                            }
                            logger.error(req, req.user.company.company_name, "audit", "Failed to update audit", audit, err);
                            return res.status(400).json(modelErrors);
                        }
                    }
                    logger.error(req, req.user.company.company_name, "audit", "Failed to update audit", audit, err);
                    return res.status(400);
                } else {
                    logger.delta(req, req.user.company.company_name, "audit", "audit updated successfully", audit_before, audit);
                    return res.json(audit);
                }
            });
        },
        /**
         * Delete a Audit
         */
        destroy: function(req, res) {
            require('../models/audit')(req.companyDb);
            var AuditModel = req.companyDb.model('Audit');
            var audit = req.audit;
            audit.remove(function(err) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "audit", "Failed to delete audit", audit, err);
                    return res.status(400).json({
                        error: 'Cannot delete the audit'
                    });
                } else {
                    logger.log(req, req.user.company.company_name, "audit", "audit removed successfully", audit);
                    return res.json(audit);
                }
            });
        },
        /**
         * load security manager
         * */
        loadSecuritymanager: function(req, res) {
            UserModel.find({
                company: req.user.company,
                role: config.roles.SECURITY_MANAGER
            }, function(err, securityManagers) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "audit", "Failed to delete audit", {
                        company: req.user.company,
                        role: config.roles.SECURITY_MANAGER
                    }, err);
                    return res.status(400).json({
                        error: 'Cannot list the securityManagers'
                    });
                }
                return res.json(securityManagers);
            });
        },

        /**
         * Shows all the Performed Audits
         */
        allPerformedAudits: function(req, res) {
            require('../models/audit')(req.companyDb);
            var AuditModel = req.companyDb.model('Audit');
            require('../models/audit-perform')(req.companyDb);
            var AuditPerformModel = req.companyDb.model('AuditPerform');
            var auditsArray = [];
            AuditModel.find({
                building: req.query.buildingId,
                isPerformed: true
            }).exec(function(err, audits) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "audit", "Failed to create audit", {
                        building: req.query.buildingId,
                        isPerformed: true
                    }, err);
                    return res.status(400).json({
                        error: 'Cannot list the Audits'
                    });
                }
                else{
                	 async.eachSeries(audits, function(audit, callback) {
                		 AuditPerformModel.findOne({
                             audit: audit._id
                         }).exec(function(err, auditperform) {
                             if (err) {
                            	 console.log(err)
                                 callback();
                             } else if(!auditperform) {
                            	 callback();
                             } else {
                            	 UserModel.findOne({_id :auditperform.performed_By},function(err,user){
                     				if(err){
                     					console.log(err);
                     					callback();
                     				}else{
                     					var obj = {
                     					    "audit":audit,
                     						"performedBy":user,
                     						"performed":auditperform
                     							
                     					}
                     					auditsArray.push(obj);
                     					callback();
                     				}
                     			})
                             }
                         });
                		 
                     }, function(err) {
                    	 res.json(auditsArray);
                     });
                  }
            });
        },
    }
};
