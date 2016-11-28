'use strict';
/** Name : Risk Controller
 * Description : In this controller risks are created by the security manager.
 * @ <author> Anto Steffi 
 * @ <date> 21-June-2016
 * @ METHODS: create, get, update, soft delete
 */

/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    async = require('async'),
    UserModel = mongoose.model('User'),
    logger = require('../../../../contrib/meanio-system/server/controllers/logs.js'),
    _ = require('lodash');

var User = mongoose.model('User');

module.exports = function(RiskCtrl) {
    return {
        /**
         * Loads the risks based on id
         */
        risk: function(req, res, next, id) {
            require('../models/risks')(req.companyDb);
            var RiskModel = req.companyDb.model('Risk');
            require('../../../../custom/location/server/models/location.js')(req.companyDb);
            var LocationModel = req.companyDb.model('Location');
            require('../../../../custom/building/server/models/building.js')(req.companyDb);
            var BuildingModel = req.companyDb.model('Building');
            var userArray = [];
            RiskModel.load(id, function(err, risk) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "risk", "Failed to fetch risk", {
                        _id: id
                    }, err);
                    return next(err);
                }
                if (!risk) {
                    logger.error(req, req.user.company.company_name, "risk", "Failed to load risk", {
                        _id: id
                    }, err);
                    return next(new Error('Failed to load risk ' + id));
                }
                async.each(risk.members_participating, function(userId, callback) {
                    UserModel.findOne({
                        _id: userId
                    }, function(err, userObj) {
                        userArray.push(userObj)
                        callback();
                    })
                }, function(err) {
                    req.riskObj = risk;
                    risk = risk.toJSON();
                    LocationModel.findOne({
                        _id: risk.location
                    }, function(err, location) {
                        risk.location = location;
                        BuildingModel.findOne({
                            _id: risk.building
                        }, function(err, building) {
                            risk.building = building;
                            risk.members_participating = userArray;
                            req.risk = risk;
                            next();
                        });
                    });
                });
            });
        },

        location: function(req, res, next, id) {
            require('../../../../custom/location/server/models/location.js')(req.companyDb);
            var LocationModel = req.companyDb.model('Location');
            LocationModel.load(id, function(err, location) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "location", "Failed to fetch location", {
                        _id: id
                    }, err);
                    return next(err);
                }
                if (!location) {
                    logger.error(req, req.user.company.company_name, "location", "Failed to load location", {
                        _id: id
                    }, err);
                    return next(new Error('Failed to load location ' + id));
                }
                req.location = location;
                next();
            });
        },

        /**
         * Create a new risk
         */
        create: function(req, res) {
            require('../models/risks')(req.companyDb);
            var RiskModel = req.companyDb.model('Risk');
            req.assert('name', 'You must enter risk name').notEmpty();
            req.assert('description', 'You must enter risk description').notEmpty();
            req.assert('members_participating', 'You must enter members').notEmpty();

            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            req.body.createdBy = req.user._id;
            var risk = new RiskModel(req.body);
            risk.save(function(err) {
                if (err) {
                    var modelErrors = [];
                    if (err.errors) {
                        for (var x in err.errors) {
                            modelErrors.push({
                                param: x,
                                msg: err.errors[x].message,
                                value: err.errors[x].value
                            });
                        }
                        logger.error(req, req.user.company.company_name, "risk", "Failed to create risk", risk, err);
                        return res.status(400).json(modelErrors);
                    }
                    logger.error(req, req.user.company.company_name, "risk", "Failed to create risk", risk, err);
                    return res.status(400);
                } else {
                    logger.log(req, req.user.company.company_name, "risk", "risk created successfully", risk);
                    return res.json(risk);
                }
            });
        },

        /**
         * Shows the single risk
         */
        show: function(req, res) {
            return res.json(req.risk);
        },

        /**
         * Updates the edited risk
         */
        update: function(req, res) {
            req.assert('name', 'You must enter risk name').notEmpty();
            req.assert('description', 'You must enter risk description').notEmpty();
            req.assert('members_participating', 'You must enter members').notEmpty();

            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            req.body.updatedBy = req.user._id;
            var risk_before = req.riskObj.toObject();
            var risk = req.riskObj;
            risk = _.extend(risk, req.body);
            risk.save(function(err) {
                if (err) {
                    var modelErrors = [];
                    if (err.errors) {
                        for (var x in err.errors) {
                            modelErrors.push({
                                param: x,
                                msg: err.errors[x].message,
                                value: err.errors[x].value
                            });
                        }
                        logger.error(req, req.user.company.company_name, "risk", "Failed to update risk", risk, err);
                        return res.status(400).json(modelErrors);
                    }
                    logger.error(req, req.user.company.company_name, "risk", "Failed to update risk", risk, err);
                    return res.status(400);
                } else {
                    logger.delta(req, req.user.company.company_name, "risk", "risk updated successfully", risk_before, risk);
                    return res.json(risk);
                }
            });
        },

        /**
         * Shows all the Risks
         */
        all: function(req, res) {
            require('../models/risks')(req.companyDb);
            var RiskModel = req.companyDb.model('Risk');
            require('../../../../custom/location/server/models/location.js')(req.companyDb);
            var LocationModel = req.companyDb.model('Location');
            RiskModel.find(function(err, risks) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "risk", "Failed to fetch risks", err);
                    return res.status(400).json({
                        error: 'Cannot list the risks'
                    });
                }
                return res.json(risks);
            });
        },

        /**
         * Shows the single risk
         */
        show: function(req, res) {
            require('../models/risks')(req.companyDb);
            var RiskModel = req.companyDb.model('Risk');
            return res.json(req.risk);
        },

        /**
         * Delete a risk
         */
        destroy: function(req, res) {
            require('../models/risks')(req.companyDb);
            var RiskModel = req.companyDb.model('Risk');
            require('../../../../custom/securitytasks/server/models/securityTask.js')(req.companyDb);
            var SecurityTaskModel = req.companyDb.model('SecurityTask');
            SecurityTaskModel.find({
                "risk": req.riskObj._id
            }, function(err, securitytasks) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "risk", "Failed to delete risk", {
                        risk: req.riskObj._id
                    }, err);
                    return res.status(400).json({
                        error: 'Cannot find the securitytasks'
                    });
                } else {
                    if (securitytasks.length > 0) {
                        return res.status(400).json('Cannot Delete Risk assigned to securitytask');
                    } else {
                        var risk = req.riskObj;
                        risk.remove(function(err) {
                            if (err) {
                                logger.error(req, req.user.company.company_name, "location", "Failed to delete location", location, err);
                                return res.status(500).json({
                                    error: 'Cannot delete the risk'
                                });
                            }
                            logger.log(req, req.user.company.company_name, "risk", "risk removed successfully", risk);
                            return res.json(risk);
                        });
                    }
                }
            });
        },
        /**
         * Fetch the locations from user
         */

        loadLocations: function(req, res) {
            require('../models/risks')(req.companyDb);
            var RiskModel = req.companyDb.model('Risk');
            require('../../../../custom/location/server/models/location.js')(req.companyDb);
            var LocationModel = req.companyDb.model('Location');
            var locArray = req.user.locations;
            var locationArray = [];
            async.each(locArray, function(loc, callback) {
                LocationModel.findOne({
                    _id: loc
                }, function(err, location) {
                    if (err) {
                        logger.error(req, req.user.company.company_name, "risk", "Failed to fetch location", {
                            _id: loc
                        }, err);
                        return res.status(500).json({
                            error: 'Cannot find the locations'
                        });
                    } else {
                        locationArray.push(location);
                        callback();
                    }
                });
            }, function(err) {
                return res.json(locationArray);
            });
        },

        /**
         * Fetch the buildings based on locations
         */
        buildingBasedOnLocation: function(req, res) {
            require('../models/risks')(req.companyDb);
            var RiskModel = req.companyDb.model('Risk');
            require('../../../../custom/building/server/models/building.js')(req.companyDb);
            var BuildingModel = req.companyDb.model('Building');
            BuildingModel.find({
                location: req.params.locationId
            }, function(err, buildings) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "risk", "Failed to load building", {
                        location: req.params.locationId
                    }, err);
                    return res.status(500).json({
                        error: 'Cannot find the buildings'
                    });
                }
                return res.json(buildings);
            });
        },

        /**
         * Load all user based on company
         */
        users: function(req, res) {
            UserModel.find({
                company: req.user.company._id
            }, function(err, users) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "risk", "Failed to list users", {
                        company: req.user.company._id
                    }, err);
                    return res.status(500).json({
                        error: 'Cannot list the users'
                    });
                }
                return res.json(users);
            });
        },

        fetchLocationsBasedOnUserSelected: function(req, res) {
            var mymemberarray = JSON.parse(req.query.selecteduserarray);
            mymemberarray = mymemberarray.memberarray;
            var myfinalarray = [];
            require('../../../../custom/location/server/models/location.js')(req.companyDb);
            var LocationModel = req.companyDb.model('Location');
            async.eachSeries(mymemberarray, function(memberobject, callback) {
                User.findOne({
                    "_id": memberobject
                }, function(err, userobject) {
                    if (err) {
                        logger.error(req, req.user.company.company_name, "risk", "Failed to fetch user", {
                            _id: memberobject
                        }, err);
                        return res.status(500).json({
                            "err": "cannot load user"
                        });
                    } else {
                        async.eachSeries(userobject.locations, function(locationid, usercallback) {
                            LocationModel.findOne({
                                "_id": locationid
                            }, function(err, locationobject) {
                                if (err) {
                                    logger.error(req, req.user.company.company_name, "risk", "Failed to fetch location", {
                                        _id: locationid
                                    }, err);
                                    return res.status(500).json({
                                        "err": "cannot load locations"
                                    });
                                } else {
                                    myfinalarray.push(locationobject.toObject());
                                    usercallback();
                                }
                            });
                        }, function(err) {
                            callback();
                        });
                    }
                });
            }, function(err) {
                myfinalarray = _.uniqWith(myfinalarray, _.isEqual);
                return res.send(myfinalarray);
            });
        },

        fetchUserBasedOnBuildingSelected: function(req, res) {
            UserModel.find({
                buildings : req.query.buildingId
            }, function(err, usersArray) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "risk", "Failed to list users", {
                        buildings : req.query.buildingId
                    }, err);
                    return res.status(500).json({
                        error: 'Cannot list the users'
                    });
                }
                return res.json(usersArray);
            });
        },
    }
};
