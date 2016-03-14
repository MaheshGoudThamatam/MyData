'use strict';

/**
 * Module dependencies.
 */
var async = require('async');
require('../models/country.js');

var mongoose = require('mongoose'),
    ZoneModel = mongoose.model('Zone'),
    CountryModel = mongoose.model('Country'),
    UserModel = mongoose.model('User'),
    CityModel = mongoose.model('City'),
    _ = require('lodash');

var validation = require('../../../../core/system/server/controllers/validationUtil.js');
var utility = require('../../../../core/system/server/controllers/util.js');
var MESSAGE = require('../../../../core/system/server/controllers/message.js');
var ERRORS = MESSAGE.ERRORS;
var SUCCESS = MESSAGE.SUCCESS;

function updateZone(user, zone, callback) {
    ZoneModel.load(zone._id, function (err, zone) {
        UserModel.findOne({_id: user._id}).exec(function (err, user) {
            user.zone = validation.insertInArray(user.zone, zone);
            async.each(zone.city, function (city, callback) {
                user.city = validation.insertInArray(user.city, city);
                async.each(city.branch, function (branch, callback) {
                    user.branch = validation.insertInArray(user.branch, branch);
                });
            });
            user.save(function (err) {
                if (err) {
                    console.log("Inside User admin save:Error " + err);
                }
                if (callback) {
                    callback();
                }
            });
        });
    });
}

module.exports = function (Zone) {
    return {
        /**
         * Find country by id
         */
        country: function (req, res, next, id) {
            CountryModel.load(id, function (err, country) {
                if (err) return next(err);
                if (!country) return next(new Error('Failed to load country ' + id));
                req.country = country;
                next();
            });
        },

        /**
         * Find zone by id
         */
        zone: function (req, res, next, id) {
            ZoneModel.load(id, function (err, zone) {
                if (err) return next(err);
                if (!zone) return next(new Error('Failed to load zone ' + id));
                req.zone = zone;
                next();
            });
        },

        /**
         * Create a zone
         */
        create: function (req, res) {
            var adminList = req.body.adminList;
            delete req.body.adminList;

            var zone = new ZoneModel(req.body);
            zone.country = new CountryModel(req.country);
            var countryId = req.body.countryId;

            //validations
            req.assert('zoneName', 'You must enter a zone name').notEmpty();
            req.assert('zoneCode', 'You must enter zone code').notEmpty();

            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            zone.save(function (err, zone) {
                if (err) {
                    return validation.exportErrorResponse(res, err, ERRORS.ERROR_1104);
                }
                CountryModel.findOne({ _id: countryId }, function (err, countryDocument) {
                    countryDocument.zone.push(zone._id);
                    countryDocument.save(function (err, items) {
                        if (err) {
                            console.log(err);
                        }
                    });
                    async.each(adminList, function (user, callback) {
                        updateZone(user, zone)
                    });
                    res.json(zone);
                });
            });
        },

        /**
         * Update a zone
         */
        update: function (req, res) {
            var adminList = req.body.adminList;
            delete req.body.adminList;

            var zone = req.zone;
            zone = _.extend(zone, req.body);

            req.assert('zoneName', 'You must enter a zone name').notEmpty();
            req.assert('zoneCode', 'You must enter zone code').notEmpty();

            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            UserModel.find({
                zone: {$elemMatch: {$in: [zone._id] }}
            }).populate('role', 'name').populate('zone', 'name').exec(function (err, userList) {
                for (var i = 0; i < userList.length; i++) {
                    var found = false;
                    for (var j = 0; j < adminList.length; j++) {
                        if (userList[i]._id === adminList[j]._id) {
                            found = true;
                        }
                    }
                    if (!found) {
                        updateZone(userList[i], zone);
                    }
                }
            });
            zone.save(function (err, zone) {
                if (err) {
                    console.log(err);
                    return validation.exportErrorResponse(res, err, ERRORS.ERROR_1104);
                }
                async.each(adminList, function (user, callback) {
                    updateZone(user, zone)
                });
                res.json(zone);
            });
        },

        /**
         * Delete a zone
         */
        destroy: function (req, res) {
            var zone = req.zone;
            UserModel.find({
                zone: {$elemMatch: {$in: [zone._id] }}
            }).populate('role', 'name').populate('country', 'name').exec(function (err, userList) {
                var counter = 0;
                async.each(userList, function (user, callback) {
                    updateZone(user, zone, function () {
                        counter++;
                        if (counter == userList.length) {
                            CountryModel.findOne({ _id: zone.country._id }).exec(function (err, countryDocument) {
                                countryDocument.zone=validation.insertInArray(countryDocument.zone, zone);
                                countryDocument.save(function (err, items) {
                                    if (err) {
                                        console.log(err);
                                    }
                                });
                                zone.remove(function (err) {
                                    if (err) {
                                        return res.status(500).json({
                                            error: 'Cannot delete the country'
                                        });
                                    }
                                    CityModel.remove({zone: zone._id }, function (err) {
                                        if (err) {
                                            console.log(err);
                                        }
                                    });
                                    res.json(zone);
                                });
                            });
                        }
                    });
                });
            });
        },
        /**
         * Show a zone
         */
        show: function (req, res) {
            res.json(req.zone);
        },
        /**
         * List of Zones
         */
        all: function (req, res) {

            var countryId = req.params.countryId;
            ZoneModel.find({country: countryId}).populate('city').exec(function (err, zones) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the zones'
                    });
                }
                res.json(zones);
            });
        },

        /**
         * List of role as by pagination
         */
        zoneListByPagination: function (req, res) {
            var populateObj = {city: 'name'};
            utility.pagination(req, res, ZoneModel, {}, {}, populateObj, function (result) {
                if (utility.isEmpty(result.collection)) {
                    //res.json(result);
                }
                return res.json(result);
            });
        }

    };
}