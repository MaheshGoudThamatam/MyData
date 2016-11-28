'use strict';
/**
 * <Author:Akash Gupta>
 * <Date:30-06-2016>
 * <Functions: Create, Update, GetAll, GetSingle, Soft Delete, Hard Delete for Company>
 * @params: {req.body}, {req.company}       Contain new or updated details of Company
 */
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    CompanyModel = mongoose.model('Company'),
    async = require('async'),
    userController = require('../../../../contrib/meanio-users/server/controllers/users.js')(userController),
    UserModel = mongoose.model('User'),
    configuration = require('../../../../custom/actsec/server/config/config.js'),
    logger = require('../../../../contrib/meanio-system/server/controllers/logs.js'),
    _ = require('lodash'),
    templates = require('../../../actsec/server/config/user_template.js'),
    mail = require('../../../../contrib/meanio-system/server/services/mailService.js');

/**
 * Delete User if company creation is failed
 * @params: {user} contain user object
 */
var deleteUser = function(user) {
    var user = user;
    user.remove({
        _id: user._id
    }, function(err) {
        if (err) {
            return err
        }
    });
}

module.exports = function(Company, actsec, io) {

    var notif = require('../../../actsec/server/controllers/notification.js')(actsec, io);

    return {
        /**
         * Find Company by id
         */
        company: function(req, res, next, id) {
            CompanyModel.load(id, function(err, company) {
                if (err) {
                    if ((req.user.role._id + '') !== configuration.roles.SUPER_ADMIN) {
                        logger.error(req, req.user.company.company_name, "company", "Failed to fetch company", {
                            _id: id
                        }, err);
                    } else {
                        logger.error(req, "SUPERADMIN", "company", "Failed to fetch company", {
                            _id: id
                        }, err);
                    }
                    return next(err);
                }
                if (!company) {
                    if ((req.user.role._id + '') !== configuration.roles.SUPER_ADMIN) {
                        logger.error(req, req.user.company.company_name, "company", "Failed to load company", {
                            _id: id
                        }, err);
                    } else {
                        logger.error(req, "SUPERADMIN", "company", "Failed to load company", {
                            _id: id
                        }, err);
                    }
                    return next(new Error('Failed to load company ' + id));
                }
                req.company = company;
                next();
            });
        },
        /**
         * Find company by token
         */
        loadbyToken: function(req, res, next, token) {
            CompanyModel.loadToken(token, function(err, company) {
                if (err) {
                    if ((req.user.role._id + '') !== configuration.roles.SUPER_ADMIN) {
                        logger.error(req, req.user.company.company_name, "company", "Failed to fetch company by token", {
                            token: token
                        }, err);
                    } else {
                        logger.error(req, "SUPERADMIN", "company", "Failed to fetch company by token", {
                            token: token
                        }, err);
                    }
                    return next(err);
                }
                if (!company) {
                    if ((req.user.role._id + '') !== configuration.roles.SUPER_ADMIN) {
                        logger.error(req, req.user.company.company_name, "company", "Failed to fetch company by token", {
                            token: token
                        }, err);
                    } else {
                        logger.error(req, "SUPERADMIN", "company", "Failed to fetch company by token", {
                            token: token
                        }, err);
                    }
                    return next(new Error('Failed to load company '));
                }
                req.companybyToken = company;
                next();
            });
        },
        /**
         * Create of Company
         */
        create: function(req, res) {
            var proceed = false
            req.body.createdBy = req.user._id;
            req.body.token = 'i' + new Date().getTime();
            var company = new CompanyModel(req.body);
            /**
             * check validations
             * @params: function, contain callback function
             */
            var validation = function(callbackValidation) {
                    req.assert('company_name', 'Please enter Company name').notEmpty();
                    req.assert('address_line_1', 'Please enter address').notEmpty();
                    req.assert('city', 'Please enter city').notEmpty();
                    req.assert('country', 'Please enter country').notEmpty();
                    req.assert('zipcode', 'Please enter zipcode').notEmpty();
                    req.assert('contact_number', 'Please enter valid Contact Number').matches('^[0-9]');
                    req.assert('registration_number', 'Please enter registration number').notEmpty();
                    req.assert('customer_reference', 'Please enter customer reference').notEmpty();
                    var errors = [];
                    var validationError = req.validationErrors()
                    if (Array.isArray(validationError)) {
                        errors = errors.concat(req.validationErrors());
                    }
                    if (!req.body.security_manager) {
                        var valError = {
                            param: 'security_manager',
                            msg: 'Please enter Security Manager Details'
                        };
                        errors.push(valError)
                    }
                    if (errors.length > 0) {
                        return res.status(400).send(errors);
                    }
                    var securityManager = req.body.security_manager;
                    var userCredentialToken = req.body.token;
                    var userObj = { //Creating user object with given fields & pass to user create function on user controller
                        firstname: securityManager.firstname,
                        lastname: securityManager.lastname,
                        email: securityManager.email,
                        company: company._id,
                        createdBy: req.user._id,
                        title: securityManager.title,
                        profile: {
                            phone: securityManager.phone
                        }
                    }
                    callbackValidation(null, userObj, userCredentialToken);
                }
                //Get response after user creation
            var errorResponse = function(userCreateStatus, callbackError) {
                if (userCreateStatus.status == 400 || userCreateStatus.status == undefined) {
                    return res.status(400).send(userCreateStatus)
                } else
                if (userCreateStatus.status == 200) {
                    proceed = true
                    callbackError(null, userCreateStatus, proceed)
                }
            }
            async.waterfall([
                validation,
                userController.createManagers,
                errorResponse,
            ], function(error, userCreateStatus, proceed) {
                if (proceed == true) {
                    var ticks = new Date().getTime();
                    company.database = company.company_name.replace(/\W/g, '').substring(0, 5) + ticks;
                    company.save(function(err) {
                        if (err) {
                            if (userCreateStatus) {
                                deleteUser(userCreateStatus.data); //Removing security manager from usertable if error occurs
                            }
                            switch (err.code) {
                                case 11000:
                                case 11001:
                                    return res.status(400).json([{
                                        msg: ' Company already exists',
                                        param: 'company_name'
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
                                            logger.error(req, req.user.company.company_name, "company", "Failed to save company", company, err);
                                        } else {
                                            logger.error(req, "SUPERADMIN", "company", "Failed to save company", company, err);
                                        }
                                        return res.status(400).json(modelErrors);
                                    }
                            }
                            if ((req.user.role._id + '') !== configuration.roles.SUPER_ADMIN) {
                                logger.error(req, req.user.company.company_name, "company", "Failed to save company", company, err);
                            } else {
                                logger.error(req, "SUPERADMIN", "company", "Failed to save company", company, err);
                            }
                            return res.status(400);
                        } else {
                            notif.notifyRole('New company [' + company.company_name + '] created.', 'icon-organization', '/company', configuration.roles.SUPER_ADMIN, function() {});

                            if ((req.user.role._id + '') !== configuration.roles.SUPER_ADMIN) {
                                logger.log(req, req.user.company.company_name, "company", "company created successfully", company);
                            } else {
                                logger.log(req, "SUPERADMIN", "company", "company created successfully", company);
                            }
                            return res.json(company);
                        }
                    });
                }
            })
        },
        /**
         * Update a Company
         */
        update: function(req, res) {
            var proceed = false;
            req.body.updatedBy = req.user._id;

            var validation = function(callbackValidation) {
                    req.assert('company_name', 'Please enter Company name').notEmpty();
                    req.assert('address_line_1', 'Please enter address').notEmpty();
                    req.assert('city', 'Please enter city').notEmpty();
                    req.assert('country', 'Please enter country').notEmpty();
                    req.assert('zipcode', 'Please enter zipcode').notEmpty();
                    req.assert('contact_number', 'Please enter valid Contact Number').matches('^[0-9]');
                    req.assert('registration_number', 'Please enter registration number').notEmpty();
                    req.assert('customer_reference', 'Please enter customer reference').notEmpty();
                    var errors = [];
                    var validationError = req.validationErrors()
                    if (Array.isArray(validationError)) {
                        errors = errors.concat(req.validationErrors());
                    }
                    if (!req.body.managers) {
                        var valError = {
                            param: 'security_manager',
                            msg: 'Please enter Security Manager Details'
                        };
                        errors.push(valError)
                    }

                    if (errors.length > 0) {
                        return res.status(400).send(errors);
                    }
                    var securityManagers = req.body.managers;
                    callbackValidation(null, securityManagers)
                }
                //Get response after user updation
            var errorResponse = function(userCreateStatus, callbackError) {
                async.each(userCreateStatus, function(userObject, userCallback) {
                    if (userObject.status != 200) {
                        return res.status(userObject.status).send(userCreateStatus)
                    } else
                    if (userObject.status == 200) {
                        proceed = true;
                        callbackError(null, userCreateStatus, proceed)
                    }
                    userCallback();
                }, function(err) {})

            }
            async.waterfall([
                validation,
                userController.updateManagers,
                errorResponse,
            ], function(error, userCreateStatus, proceed) {
                if (proceed == true) {
                    var company_before = req.company.toObject();
                    var company = req.company;
                    company = _.extend(company, req.body);
                    company.save(function(err) {
                        if (err) {
                            switch (err.code) {
                                case 11000:
                                case 11001:
                                    return res.status(400).json([{
                                        msg: ' Company already exists',
                                        param: 'company_name'
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
                                            logger.error(req, req.user.company.company_name, "company", "Failed to update company", company, err);
                                        } else {
                                            logger.error(req, "SUPERADMIN", "company", "Failed to update company", company, err);
                                        }

                                        return res.status(400).json(modelErrors);
                                    }

                            }
                            if ((req.user.role._id + '') !== configuration.roles.SUPER_ADMIN) {
                                logger.error(req, req.user.company.company_name, "company", "Failed to update company", company, err);
                            } else {
                                logger.error(req, "SUPERADMIN", "company", "Failed to update company", company, err);
                            }
                            return res.status(400);
                        } else {
                            if ((req.user.role._id + '') !== configuration.roles.SUPER_ADMIN) {
                                logger.delta(req, req.user.company.company_name, "company", "company updated successfully", company_before, company);
                            } else {
                                logger.delta(req, "SUPERADMIN", "company", "company updated successfully", company_before, company);
                            }
                            async.each(userCreateStatus, function(user, callbaclUser) {
                                var email = templates.userNotify(user.data)
                                mail.mailService(email, user.data.email)
                                callbaclUser();
                            });
                            return res.json(company);
                        }
                    });
                }
            })

        },
        /**
         * Hard Delete the Company
         */
        destroy: function(req, res) {
            var company = req.company;
            //TODO: mongodb connection is hardcaded but can be changed later
            var companyDb = mongoose.createConnection('mongodb://localhost:27017/' + company.database);
            var buildingIdArray = [];
            require('../../../location/server/models/location')(companyDb);
            var LocationModel = companyDb.model('Location');
            require('../../../building/server/models/building')(companyDb);
            var BuildingModel = companyDb.model('Building');
            require('../../../assets/server/models/accessControl')(companyDb);
            var AccessControlModel = companyDb.model('AccessControl');
            require('../../../assets/server/models/burglarAlarm')(companyDb);
            var BurglarAlarmModel = companyDb.model('BurglarAlarm');
            require('../../../assets/server/models/cameraSystem')(companyDb);
            var CameraSyatemModel = companyDb.model('CameraSystem');
            require('../../../assets/server/models/guarding')(companyDb);
            var GuardingModel = companyDb.model('Guarding');
            var deleteLocation = function(callbackLocation) {
                LocationModel.find({
                    company: company._id
                }).exec(function(err, locations) {
                    async.each(locations, function(location, callback) {
                        location.remove(function(err) {

                            if (err) {
                                if ((req.user.role._id + '') !== configuration.roles.SUPER_ADMIN) {
                                    logger.error(req, req.user.company.company_name, "company", "Failed to delete location", location, err);
                                } else {
                                    logger.error(req, "SUPERADMIN", "company", "Failed to delete location", location, err);
                                }
                            }
                        })
                        callback();
                    }, function(err) {})
                    callbackLocation();
                })
            }
            var deleteBuilding = function(callbackBuilding) {
                BuildingModel.find({
                    company: company._id
                }).exec(function(err, buildings) {
                    async.each(buildings, function(building, callback) {
                        buildingIdArray.push(building._id)
                        building.remove(function(err) {

                            if (err) {
                                if ((req.user.role._id + '') !== configuration.roles.SUPER_ADMIN) {
                                    logger.error(req, req.user.company.company_name, "company", "Failed to delete building", building, err);
                                } else {
                                    logger.error(req, "SUPERADMIN", "company", "Failed to delete building", building, err);
                                }
                            }
                        })
                        callback();
                    }, function(err) {})
                    callbackBuilding(null, buildingIdArray)
                })
            }
            var deleteAssets = function(buildingIdArray, builcallbackAssets) {
                async.each(buildingIdArray, function(buildingId, callback) {
                    AccessControlModel.find({
                        building: buildingId
                    }).exec(function(err, accessControls) {
                        async.each(accessControls, function(accessControl, accessCallback) {
                            accessControl.remove(function(err) {

                                if (err) {
                                    if ((req.user.role._id + '') !== configuration.roles.SUPER_ADMIN) {
                                        logger.error(req, req.user.company.company_name, "company", "Failed to delete access control", accessControl, err);
                                    } else {
                                        logger.error(req, "SUPERADMIN", "company", "Failed to delete access control", accessControl, err);
                                    }

                                }
                            })
                            accessCallback();
                        }, function(err) {
                            callback();
                        })
                    })
                    BurglarAlarmModel.find({
                        building: buildingId
                    }).exec(function(err, burglarAlarms) {
                        async.each(burglarAlarms, function(burglarAlarm, callback) {
                            burglarAlarm.remove(function(err) {
                                if (err) {
                                    if ((req.user.role._id + '') !== configuration.roles.SUPER_ADMIN) {
                                        logger.error(req, req.user.company.company_name, "company", "Failed to delete burglar alarm", burglarAlarm, err);
                                    } else {
                                        logger.error(req, "SUPERADMIN", "company", "Failed to delete burglar alarm", burglarAlarm, err);
                                    }

                                }
                            })
                            callback();
                        }, function(err) {})
                    })
                    CameraSyatemModel.find({
                        building: buildingId
                    }).exec(function(err, cameraSyatemModels) {
                        async.each(cameraSyatemModels, function(cameraSyatemModel, callback) {
                            cameraSyatemModel.remove(function(err) {

                                if (err) {
                                    if ((req.user.role._id + '') !== configuration.roles.SUPER_ADMIN) {
                                        logger.error(req, req.user.company.company_name, "company", "Failed to delete camera system", cameraSyatemModel, err);
                                    } else {
                                        logger.error(req, "SUPERADMIN", "company", "Failed to delete camera system", cameraSyatemModel, err);
                                    }

                                }
                            })
                            callback();
                        }, function(err) {})
                    })
                    GuardingModel.find({
                        building: buildingId
                    }).exec(function(err, guardingModels) {
                        async.each(guardingModels, function(guardingModel, callback) {
                            guardingModel.remove(function(err) {

                                if (err) {
                                    if ((req.user.role._id + '') !== configuration.roles.SUPER_ADMIN) {
                                        logger.error(req, req.user.company.company_name, "company", "Failed to delete guarding", guardingModel, err);
                                    } else {
                                        logger.error(req, "SUPERADMIN", "company", "Failed to delete guarding", guardingModel, err);
                                    }

                                }
                            })
                            callback();
                        }, function(err) {})
                    })
                })
                builcallbackAssets();
            }
            var deleteManagers = function(callbackManagers) {
                UserModel.find({
                    company: req.company._id
                }).exec(function(err, managers) {
                    async.each(managers, function(manager, callback) {
                        manager.remove(function(err) {

                            if (err) {
                                if ((req.user.role._id + '') !== configuration.roles.SUPER_ADMIN) {
                                    logger.error(req, req.user.company.company_name, "company", "Failed to delete manager", manager, err);
                                } else {
                                    logger.error(req, "SUPERADMIN", "company", "Failed to delete manager", manager, err);
                                }

                            }
                        })
                    })
                })
                callbackManagers();
            }
            async.waterfall([
                deleteLocation,
                deleteBuilding,
                deleteAssets,
                deleteManagers,
            ], function(error) {
                company.remove(function(err) {
                    if (err) {
                        return res.status(400).json({
                            error: 'Cannot delete the Company'
                        });
                    } else {

                        if ((req.user.role._id + '') !== configuration.roles.SUPER_ADMIN) {
                            logger.log(req, req.user.company.company_name, "company", "company deleted successfully", company);
                        } else {
                            logger.log(req, "SUPERADMIN", "company", "company deleted successfully", company);
                        }

                        return res.json(company);
                    }
                });
            });
        },
        /**
         * Show a Company
         */
        show: function(req, res) {
            return res.json(req.company);
        },
        /**
         * List of Companies
         */
        all: function(req, res) {
            CompanyModel.find().exec(function(err, company) {
                if (err) {
                    if ((req.user.role._id + '') !== configuration.roles.SUPER_ADMIN) {
                        logger.error(req, req.user.company.company_name, "company", "Failed to list Company", err);
                    } else {
                        logger.error(req, "SUPERADMIN", "company", "Failed to list Company", err);
                    }
                    return res.status(400).json({
                        error: 'Cannot list the Company'
                    });
                }
                return res.json(company);
            });
        },
        /**
         * Find all security Manager of company
         */
        manager: function(req, res) {
            UserModel.find({
                company: req.company._id,
                role: configuration.roles.SECURITY_MANAGER
            }).exec(function(err, managers) {
                if (err) {
                    if ((req.user.role._id + '') !== configuration.roles.SUPER_ADMIN) {
                        logger.error(req, req.user.company.company_name, "company", "Failed to list managers", {
                            company: req.company._id,
                            role: configuration.roles.SECURITY_MANAGER
                        }, err);
                    } else {
                        logger.error(req, "SUPERADMIN", "company", "Failed to list managers", {
                            company: req.company._id,
                            role: configuration.roles.SECURITY_MANAGER
                        }, err);
                    }
                    return res.status(400).json({
                        error: 'Cannot list the Managers'
                    });
                }
                return res.json(managers);
            });
        },
        /**
         * update Token 
         */
        updateToken: function(req, res) {
            req.companybyToken.token = 'i' + new Date().getTime();
            var company = req.companybyToken;
            company = _.extend(company, req.companybyToken);
            company.save(function(err) {
                if (err) {
                    switch (err.code) {
                        case 11000:
                        case 11001:
                            return res.status(400).json([{
                                msg: ' Company already exists',
                                param: 'company_name'
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
                                return res.status(400).json(modelErrors);
                            }
                    }
                    return res.status(400);
                }
                return res.json(company);
            });
        },
        getLoggedUserCompany: function(req, res) {
            var ide = mongoose.Types.ObjectId(req.user.company._id);
            CompanyModel.findOne({
                _id: ide
            }).exec(function(err, company) {
                if (err) {
                    if ((req.user.role._id + '') !== configuration.roles.SUPER_ADMIN) {
                        logger.error(req, req.user.company.company_name, "company", "Failed to list company", {
                           _id: ide
                        }, err);
                    } else {
                        logger.error(req, "SUPERADMIN", "company", "Failed to list company", {
                           _id: ide
                        }, err);
                    }
                    return res.status(400);
                } else {
                    return res.json(company);
                }
            })
        },
        loadCompany: function(req, res) {
            return res.json(req.companybyToken);
        }
    };
}