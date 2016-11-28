'use strict';

/*
 * <Author:Akash Gupta>
 * <Date:22-06-2016>
 * <Functions: Create, Update, GetAll, GetSingle, Soft Delete for buildings>
 * @params: req.body & req.building       Contain new or updated details of buildings
 */

/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    async = require('async'),
    User = mongoose.model('User'),
    config = require('../../../actsec/server/config/config.js'),
    logger = require('../../../../contrib/meanio-system/server/controllers/logs.js'),
    _ = require('lodash');

module.exports = function(Building,actsec, io) {
	
	var notif = require('../../../actsec/server/controllers/notification.js')(actsec, io);
	
    return {
        /**
         * Find Building by id
         */
        building: function(req, res, next, id) {
            require('../models/building')(req.companyDb);
            var BuildingModel = req.companyDb.model('Building');
            BuildingModel.load(id, function(err, building) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "building", "Failed to fetch building", {
                        _id: id
                    }, err);
                    return next(err);
                }
                if (!building) {
                    logger.error(req, req.user.company.company_name, "building", "Failed to load building", {
                        _id: id
                    }, err);
                    return next(new Error('Failed to load building ' + id));
                }
                req.building = building;
                next();
            });
        },

        /**
         * Create of Building
         */
        create: function(req, res) {
            require('../models/building')(req.companyDb);
            var BuildingModel = req.companyDb.model('Building');
            req.body.createdBy = req.user._id;
            req.body.company = req.user.company._id;
            var building = new BuildingModel(req.body);
            req.assert('building_name', 'Please enter Building name').notEmpty();
            req.assert('address_line_1', 'Please enter address').notEmpty();
            req.assert('city', 'Please enter city').notEmpty();
            req.assert('country', 'Please enter country').notEmpty();
            req.assert('zipcode', 'Please enter zipcode').notEmpty();
            req.assert('contact_number', 'Please enter Contact number').notEmpty();
            req.assert('location', 'Please enter location').notEmpty();
            req.assert('contact_number', 'Please enter valid Contact Number').matches('^[0-9]+$');
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            building.save(function(err) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "building", "Failed to create building", building, err);
                    return res.status(500).send(err);
                } else {
                    User.find({
                        company: req.user.company._id,
                        role: config.roles.SECURITY_MANAGER
                    }).exec(function(err, managers) {
                        async.each(managers, function(manager, callback) {
                            var buildingArray = manager.buildings
                            buildingArray.push(building._id)
                            manager.update({
                                buildings: buildingArray
                            }, function(err) {
                                if (err) {
                                    logger.error(req, req.user.company.company_name, "building", "Failed to update security managers", manager, err);
                                }
                            })
                        })
                    })
                    notif.notifyRole('New building [' + building.building_name + '] created.', 'icon-grid', '/buildings', config.roles.SECURITY_MANAGER,req.user.company._id, function() {});
                    logger.log(req, req.user.company.company_name, "building", "Building created successfully", building);
                    return res.json(building);
                }
            });
        },

        /**
         * Update a Building
         */

        update: function(req, res) {
            require('../models/building')(req.companyDb);
            var BuildingModel = req.companyDb.model('Building');
            req.body.updatedBy = req.user._id;
            var building_before = req.building.toObject();
            var building = req.building;
            building = _.extend(building, req.body);

            req.assert('building_name', 'Please enter Building Name').notEmpty();
            req.assert('address_line_1', 'Please enter address').notEmpty();
            req.assert('city', 'Please enter city').notEmpty();
            req.assert('country', 'Please enter country').notEmpty();
            req.assert('zipcode', 'Please enter zipcode').notEmpty();
            req.assert('contact_number', 'Please enter Contact Number').notEmpty();
            req.assert('location', 'Please enter location').notEmpty();
            req.assert('contact_number', 'Please enter valid Contact Number').matches('^[0-9]+$');
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            building.save(function(err) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "building", "Failed to update building", building, err);
                    return res.status(500).send(err);
                } else {
                    logger.delta(req, req.user.company.company_name, "building", "Building updated successfully", building_before, building);
                    return res.json(building);
                }
            })
        },

        /**
         * Show a Building
         */
        show: function(req, res) {
            require('../models/building')(req.companyDb);
            var BuildingModel = req.companyDb.model('Building');
            return res.json(req.building);
        },

        /**
         * List of Companies
         */
        all: function(req, res) {
            require('../models/building')(req.companyDb);
            var BuildingModel = req.companyDb.model('Building');
            BuildingModel.find(function(err, building) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "building", "Failed to update building", err);
                    return res.status(400).json({
                        error: 'Cannot list the building'
                    });
                }
                return res.json(building);
            });
        },

        /**
         * Hard delete building
         */
        destroy: function(req, res) {
            require('../models/building')(req.companyDb);
            var BuildingModel = req.companyDb.model('Building');
            require('../../../assets/server/models/accessControl')(req.companyDb);
            var AccessControlModel = req.companyDb.model('AccessControl');
            require('../../../assets/server/models/burglarAlarm')(req.companyDb);
            var BurglarAlarmModel = req.companyDb.model('BurglarAlarm');
            require('../../../assets/server/models/cameraSystem')(req.companyDb);
            var CameraSyatemModel = req.companyDb.model('CameraSystem');
            require('../../../assets/server/models/guarding')(req.companyDb);
            var GuardingModel = req.companyDb.model('Guarding');

            var building = req.building;
            var buildingId = building._id;
            //Removing all assets
            var deleteAssets = function(builcallbackAssets) {
                AccessControlModel.find({
                    building: buildingId
                }).exec(function(err, accessControls) {
                    async.each(accessControls, function(accessControl, accessCallback) {
                        accessControl.remove(function(err) {
                            if (err) {
                                logger.error(req, req.user.company.company_name, "building", "Failed to delete accesscontrol", accessControl, err);
                            }
                        })
                        accessCallback();
                    }, function(err) {

                    })
                })

                BurglarAlarmModel.find({
                    building: buildingId
                }).exec(function(err, burglarAlarms) {
                    async.each(burglarAlarms, function(burglarAlarm, callback) {
                        burglarAlarm.remove(function(err) {
                            if (err) {
                                logger.error(req, req.user.company.company_name, "building", "Failed to delete burglar alarm", burglarAlarm, err);
                            }
                        })
                        callback();
                    }, function(err) {

                    })
                })

                CameraSyatemModel.find({
                    building: buildingId
                }).exec(function(err, cameraSystems) {
                    async.each(cameraSystems, function(cameraSystem, callback) {
                        cameraSystem.remove(function(err) {
                            if (err) {
                                logger.error(req, req.user.company.company_name, "building", "Failed to delete camara system", cameraSystem, err);
                            }
                        })
                        callback();
                    }, function(err) {

                    })
                })

                GuardingModel.find({
                    building: buildingId
                }).exec(function(err, guardings) {
                    async.each(guardings, function(guarding, callback) {
                        guarding.remove(function(err) {
                            if (err) {
                                logger.error(req, req.user.company.company_name, "building", "Failed to delete guarding", guarding, err);
                            }
                        })
                        callback();
                    }, function(err) {

                    })
                })
                builcallbackAssets();
            };

            //Removing building Id from security managers user object
            var removeUser = function(userCallback) {
                User.find({
                    company: req.user.company._id
                }).exec(function(err, managers) {
                    async.each(managers, function(manager, callback) {
                        var counter = 0;
                        var buildingArray = manager.buildings;
                        async.each(buildingArray, function(buildingId, buildingCallback) {
                            if (JSON.stringify(buildingId) === JSON.stringify(building._id)) {
                                buildingArray.splice(counter, 1);
                            }
                            counter = counter + 1
                            buildingCallback();
                        }, function(err) {
                            manager.update({
                                buildings: buildingArray
                            }, function(err) {
                                if (err) {
                                    logger.error(req, req.user.company.company_name, "building", "Failed to delete manager", manager, err);
                                }
                            });
                            callback();
                        });
                    }, function(err) {

                    });
                });
                userCallback();
            };

            async.waterfall([
                deleteAssets,
                removeUser,
            ], function(error) {
                building.remove(function(err) {
                    if (err) {
                        logger.error(req, req.user.company.company_name, "building", "Failed to delete manager", manager, err);
                        return res.status(400).json({
                            error: 'Cannot delete the Building'
                        });
                    } else {
                        logger.log(req, req.user.company.company_name, "building", "Building removed successfully", building);
                        return res.json(building);
                    }
                });
            })
        },

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
                        logger.error(req, req.user.company.company_name, "building", "Failed to delete manager", {
                            _id: loc
                        }, err);
                        return res.status(500).json({
                            error: 'Cannot list the location'
                        });
                    }
                    locationArray.push(location);
                    callback();
                });
            }, function(err) {
                return res.json(locationArray);
            });
        },
    };
}
