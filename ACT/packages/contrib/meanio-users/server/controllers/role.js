'use strict';
/** Name : Role Controller
 * Description : This controller defines predefined roles created by the super admin.
 * @ <author> Anto Steffi 
 * @ <date> 14-Jun-2016
 * @ METHODS: create, Update, get, delete
 */
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    RoleModel = mongoose.model('Role'),
    FeatureModel = mongoose.model('Feature'),
    UserModel = mongoose.model('User'),
    logger = require('../../../../contrib/meanio-system/server/controllers/logs.js'),
    _ = require('lodash'),
    async = require('async');
var auth = require('../../authorization.js');
var configuration = require('../../../../custom/actsec/server/config/config.js');

module.exports = function(RoleCtrl) {
    return {
        /**
         * Loads the Role based on id
         */
        role: function(req, res, next, id) {
            RoleModel.load(id, function(err, role) {
                if (err) {
                    if ((req.user.role._id + '') !== configuration.roles.SUPER_ADMIN) {
                        logger.error(req, req.user.company.company_name, "role", "Failed to fetch role", {
                            _id: id
                        }, err);
                    } else {
                        logger.error(req, "SUPERADMIN", "role", "Failed to fetch role", {
                            _id: id
                        }, err);
                    }
                    return next(err);
                }
                if (!role) {
                    if ((req.user.role._id + '') !== configuration.roles.SUPER_ADMIN) {
                        logger.error(req, req.user.company.company_name, "role", "Failed to fetch role", {
                            _id: id
                        }, err);
                    } else {
                        logger.error(req, "SUPERADMIN", "role", "Failed to fetch role", {
                            _id: id
                        }, err);
                    }
                    return next(new Error('Failed to load role ' + id));
                }
                req.role = role;
                next();
            });
        },
        /**
         * Create the Role
         */
        create: function(req, res) {
            if ((req.user.role._id + '') !== configuration.roles.SUPER_ADMIN) { //For users other than SUPER_ADMIN
                if (auth.companyAuthentication(req, req.user.company._id)) {
                    var role = new RoleModel(req.body);
                    role.company = req.user.company;
                    if ((req.user.role._id + '') == configuration.roles.SUPER_ADMIN) {
                        role.pristine = true;
                    }
                    var features = req.body.feature;
                    var dashboards = req.body.dashboard;
                    var roleFeatures = [];
                    var roleDashboards = [];
                    role.save(function(err) {
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
                                    }
                                    logger.error(req, req.user.company.company_name, "role", "Failed to create role", role, err);
                                    return res.status(400).json(modelErrors);
                            }
                            logger.error(req, req.user.company.company_name, "role", "Failed to create role", role, err);
                            return res.status(500).json(err);
                        } else {
                            if (dashboards) {
                                for (var d = 0; d < dashboards.length; d++) {
                                    roleDashboards.push(dashboards[d]._id);
                                }
                                role.dashboards = roleDashboards;
                            }
                            logger.log(req, req.user.company.company_name, "role", "role created successfully", role);
                            return res.json(role);
                        }
                    });
                } else {
                    return res.status(403).send([{
                        "permission": 'Access denied'
                    }]);
                }
            } else { //For SUPER_ADMIN users
                var role = new RoleModel(req.body);
                role.admin = true;
                role.pristine = true;
                var features = req.body.feature;
                var dashboards = req.body.dashboard;
                var roleFeatures = [];
                var roleDashboards = [];
                role.save(function(err) {
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
                                }
                                logger.error(req, "SUPERADMIN", "role", "Failed to create role", role, err);
                                return res.status(400).json(modelErrors);
                        }
                        logger.error(req, "SUPERADMIN", "role", "Failed to create role", role, err);
                        return res.status(500).json(err);
                    } else {
                        if (dashboards) {
                            for (var d = 0; d < dashboards.length; d++) {
                                roleDashboards.push(dashboards[d]._id);
                            }
                            role.dashboards = roleDashboards;
                        }
                        logger.log(req, "SUPERADMIN", "role", "role created successfully", role);
                        return res.json(role);
                    }
                });
            }
        },
        /**
         * Update the Role
         */
        update: function(req, res) {
            if ((req.user.role._id + '') !== configuration.roles.SUPER_ADMIN) { //For users other than SUPER_ADMIN
                if (auth.companyAuthenticationRole(req, req.role.company._id) || !req.role.pristine || !req.role.admin || !req.role.system) {
                    //Users do not have access to edit roles that:
                    //  * do not belong to the same company as themselves
                    //  * are pristine roles
                    //  * are system roles
                    //  * are admin created roles
                    var role_before = req.role.toObject();
                    var role = req.role;
                    role = _.extend(role, req.body);
                    req.assert('name', 'You must enter role name').notEmpty();
                    req.assert('description', 'You must enter role description').notEmpty();
                    var errors = req.validationErrors();
                    if (errors) {
                        return res.status(400).send(errors);
                    }
                    var features = req.body.feature;
                    var dashboards = req.body.dashboard;
                    var roleFeatures = [];
                    var roleDashboards = [];
                    role.save(function(err) {
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
                                    }
                                    logger.error(req, req.user.company.company_name, "role", "Failed to update role", role, err);
                                    return res.status(400).json(modelErrors);
                            }
                            logger.error(req, req.user.company.company_name, "role", "Failed to update role", role, err);
                            return res.status(500).json(err);
                        } else {
                            if (dashboards) {
                                for (var d = 0; d < dashboards.length; d++) {
                                    roleDashboards.push(dashboards[d]._id);
                                }
                                role.dashboards = roleDashboards;
                            }
                            logger.delta(req, req.user.company.company_name, "role", "role updated successfully", role_before, role);
                            return res.json(role);
                        }
                    });
                } else {
                    return res.status(403).send([{
                        "permission": 'Access denied'
                    }]);
                }
            } else {
                if (!req.role.system) {
                    var role_before = req.role.toObject();
                    var role = req.role;
                    role = _.extend(role, req.body);
                    req.assert('name', 'You must enter role name').notEmpty();
                    req.assert('description', 'You must enter role description').notEmpty();
                    var errors = req.validationErrors();
                    if (errors) {
                        return res.status(400).send(errors);
                    }
                    var features = req.body.feature;
                    var dashboards = req.body.dashboard;
                    var roleFeatures = [];
                    var roleDashboards = [];
                    role.save(function(err) {
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
                                    }
                                    logger.error(req, "SUPERADMIN", "role", "Failed to update role", role, err);
                                    return res.status(400).json(modelErrors);
                            }
                            logger.error(req, "SUPERADMIN", "role", "Failed to update role", role, err);
                            return res.status(500).json(err);
                        } else {
                            if (dashboards) {
                                for (var d = 0; d < dashboards.length; d++) {
                                    roleDashboards.push(dashboards[d]._id);
                                }
                                role.dashboards = roleDashboards;
                            }
                            logger.delta(req, "SUPERADMIN", "role", "role updated successfully", role_before, role);
                            return res.json(role);
                        }
                    });
                } else {
                    return res.status(403).send([{
                        "permission": 'Access denied'
                    }]);
                }
            }
        },
        /**
         * Show the Role
         */
        show: function(req, res) {
            if (req.role.admin == true || req.role.pristine == true) {
                return res.json(req.role);
            } else {
                if (auth.companyAuthenticationRole(req, req.role.company._id)) {
                    return res.json(req.role);
                } else {
                    return res.status(403).send([{
                        "permission": 'Access denied'
                    }]);
                }
            }
        },
        /**
         * List of Roles
         */
        all: function(req, res) {
            if ((req.user.role._id + '') !== configuration.roles.SUPER_ADMIN) { //For users other than SUPER_ADMIN
                var roleQuery = {
                    "company": req.user.company._id
                };
                RoleModel.find(roleQuery).populate('feature', 'name').populate('dashboard', 'name').sort({
                    name: 'asc'
                }).exec(function(err, roles) {
                    if (err) {
                        logger.error(req, req.user.company.company_name, "role", "Failed to fetch roles", {
                            company: req.user.company._id
                        }, err);
                        return res.status(500).json({
                            error: 'Cannot list the roles'
                        });
                    } else {
                        RoleModel.find({
                            "pristine": true,
                            "system": false,
                        }).populate('feature', 'name').populate('dashboard', 'name').sort({
                            name: 'asc'
                        }).exec(function(err, pristines) {
                            if (err) {
                                logger.error(req, req.user.company.company_name, "role", "Failed to fetch pristine roles", {
                                    "pristine": true,
                                    "system": false,
                                }, err);
                                return res.status(500).json({
                                    error: 'Cannot list the pristine roles'
                                });
                            }
                            var results = {};
                            results.pristine = pristines;
                            results.roles = roles;
                            return res.json(results);
                        });
                    }
                });
            } else { // For SUPER_ADMIN users
                var roleQuery = {
                    "admin": true,
                    "system": false
                };
                RoleModel.find(roleQuery).populate('feature', 'name').populate('dashboard', 'name').sort({
                    name: 'asc'
                }).exec(function(err, roles) {
                    if (err) {
                        logger.error(req, "SUPERADMIN", "role", "Failed to fetch role", {
                            "admin": true,
                            "system": false
                        }, err);
                        return res.status(500).json({
                            error: 'Cannot list the roles'
                        });
                    } else {
                        RoleModel.find({
                            "pristine": true,
                            "admin": false,
                        }).populate('feature', 'name').populate('dashboard', 'name').sort({
                            name: 'asc'
                        }).exec(function(err, pristines) {
                            if (err) {
                                logger.error(req, "SUPERADMIN", "role", "Failed to fetch role", {
                                    "pristine": true,
                                    "admin": false,
                                }, err);
                                return res.status(500).json({
                                    error: 'Cannot list the pristine roles'
                                });
                            }
                            var results = {};
                            results.pristine = pristines;
                            results.roles = roles;
                            return res.json(results);
                        });
                    }
                });
            }
        },
        /**
         * Delete the Role
         */
        destroy: function(req, res) {
            if ((req.user.role._id + '') !== configuration.roles.SUPER_ADMIN) { //For users other than SUPER_ADMIN
                if (auth.companyAuthentication(req, req.role.company._id) || !req.role.admin) {
                    var role = req.role;
                    UserModel.find({
                        "role": req.role._id
                    }, function(err, users) {
                        if (err) {
                            logger.error(req, req.user.company.company_name, "role", "Failed to fetch users", {
                                role: req.role._id
                            }, err);
                            return res.status(400).json({
                                error: 'Cannot find the users'
                            });
                        } else {
                            if (users.length > 0) {
                                return res.status(400).json('Cannot Delete Role assigned to user');
                            } else {
                                role.remove(function(err) {
                                    if (err) {
                                        logger.error(req, req.user.company.company_name, "role", "Failed to delete role", role, err);
                                        return res.status(400).json({
                                            error: 'Cannot delete the role'
                                        });
                                    } else {
                                        logger.log(req, req.user.company.company_name, "role", "Role deleted successfully", role);
                                        return res.json(role);
                                    }
                                });
                            }
                        }
                    });
                } else {
                    return res.status(403).send([{
                        "permission": 'Access denied'
                    }]);
                }
            } else {
                if (req.role.admin) {
                    var role = req.role;
                    UserModel.find({
                        "role": req.role._id
                    }, function(err, users) {
                        if (err) {
                            logger.error(req, "SUPERADMIN", "role", "Failed to fetch users", {
                                role: req.role._id
                            }, err);
                            return res.status(400).json({
                                error: 'Cannot find the users'
                            });
                        } else {
                            if (users.length > 0) {
                                return res.status(400).json('Cannot Delete Role assigned to user');
                            } else {
                                role.remove(function(err) {
                                    if (err) {
                                        logger.error(req, "SUPERADMIN", "role", "Failed to delete role", role, err);
                                        return res.status(400).json({
                                            error: 'Cannot delete the role'
                                        });
                                    } else {
                                        logger.log(req, "SUPERADMIN", "role", "Role deleted successfully", role);
                                        return res.json(role);
                                    }
                                });
                            }
                        }
                    });
                } else {
                    return res.status(403).send([{
                        "permission": 'Access denied'
                    }]);
                }
            }
        },

        /**
         * [getSelect] Function is invoked from /api/roleSelect
         * To be used to fetch roles for displaying in <select> elements
         * Fetches all non-system roles
         */
        getSelect: function(req, res) {
            if ((req.user.role._id + '') !== configuration.roles.SUPER_ADMIN) { //For users other than SUPER_ADMIN
                RoleModel.find({
                    $or: [{
                        "company": req.user.company._id
                    }, {
                        "system": false,
                        "pristine": true
                    }]
                }).sort({
                    name: 'asc'
                }).exec(function(err, roles) {
                    if (err) {
                        logger.error(req, req.user.company.company_name, "role", "Failed to fetch roles", {
                            $or: [{
                                "company": req.user.company._id
                            }, {
                                "system": false,
                                "pristine": true
                            }]
                        }, err);
                        return res.status(500).json({
                            error: 'Cannot fetch roles'
                        });
                    }
                    return res.json(roles);
                });
            } else {
                // No scenario where SUPER_ADMIN needs roleSelect, hence returning empty array for him.
                return res.json([]);
            }
        }
    }
};