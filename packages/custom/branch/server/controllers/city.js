'use strict';

/**
 * Module dependencies.
 */
var async = require('async');
require('../models/zone.js');

var mongoose = require('mongoose'),
    CityModel = mongoose.model('City'),
    ZoneModel = mongoose.model('Zone'),
    UserModel = mongoose.model('User'),
    BranchModel = mongoose.model('Branch'),
    CountryModel = mongoose.model('Country'),
    _ = require('lodash');

var validation = require('../../../../core/system/server/controllers/validationUtil.js');
var utility = require('../../../../core/system/server/controllers/util.js');
var MESSAGE = require('../../../../core/system/server/controllers/message.js');
var ERRORS = MESSAGE.ERRORS;
var SUCCESS = MESSAGE.SUCCESS;

function updateCity(user, city, callback) {
    CityModel.load(city._id, function (err, city) {
        UserModel.findOne({_id: user._id}).exec(function (err, user) {
            user.city = validation.insertInArray(user.city, city);
            async.each(city.branch, function (branch, callback) {
                user.branch = validation.insertInArray(user.branch, branch);
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

module.exports = function (City) {

    return {

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
         * Find city by id
         */
        city: function (req, res, next, id) {
            CityModel.load(id, function (err, city) {
                if (err) return next(err);
                if (!city) return next(new Error('Failed to load city ' + id));
                req.city = city;
                next();
            });
        },
        
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
         * Create a city
         */
        create: function (req, res) {

            var adminList = req.body.adminList;
            delete req.body.adminList;

            var city = new CityModel(req.body);
            city.zone = new ZoneModel(req.zone);
            var zoneId = req.body.zoneId;

            req.assert('cityName', 'You must enter a city name').notEmpty();
            req.assert('cityCode', 'You must enter city code').notEmpty();

            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }

            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            city.save(function (err, city) {
                if (err) {
                    return validation.exportErrorResponse(res, err, ERRORS.ERROR_1104);
                }
                ZoneModel.findOne({ _id: zoneId }, function (err, zoneDocument) {
                    zoneDocument.city.push(city._id);
                    zoneDocument.save(function (err, items) {
                        if (err) {
                            console.log(err);
                        }
                    });
                    async.each(adminList, function (user, callback) {
                        updateCity(user, city)
                    });
                    res.json(city);
                });
            });
        },

        /**
         * Update a city
         */
        update: function (req, res) {
            var adminList = req.body.adminList;
            delete req.body.adminList;

            var city = req.city;
            city = _.extend(city, req.body);

            req.assert('cityName', 'You must enter a city name').notEmpty();
            req.assert('cityCode', 'You must enter city code').notEmpty();

            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            UserModel.find({
                city: {$elemMatch: {$in: [city._id] }}
            }).populate('role', 'name').populate('zone', 'name').exec(function (err, userList) {
                for (var i = 0; i < userList.length; i++) {
                    var found = false;
                    for (var j = 0; j < adminList.length; j++) {
                        if (userList[i]._id === adminList[j]._id) {
                            found = true;
                        }
                    }
                    if (!found) {
                        updateCity(userList[i], city);
                    }
                }
            });
            city.save(function (err, city) {
                if (err) {
                    console.log(err);
                    return validation.exportErrorResponse(res, err, ERRORS.ERROR_1104);
                }
                async.each(adminList, function (user, callback) {
                    updateCity(user, city)
                });
                res.json(city);
            });
        },
        /**
         * Delete a city
         */
        destroy: function (req, res) {
            var city = req.city;
            UserModel.find({
                city: {$elemMatch: {$in: [city._id] }}
            }).populate('role', 'name').populate('zone', 'name').exec(function (err, userList) {
                var counter = 0;
                async.each(userList, function (user, callback) {
                    updateCity(user, city, function () {
                        counter++;
                        if (counter == userList.length) {
                            ZoneModel.findOne({ _id: city.zone._id }).exec(function (err, zoneDocument) {
                                zoneDocument.city=validation.insertInArray(zoneDocument.city, city);
                                zoneDocument.save(function (err, items) {
                                    if (err) {
                                        console.log(err);
                                    }
                                });
                                city.remove(function (err) {
                                    if (err) {
                                        return res.status(500).json({
                                            error: 'Cannot delete the country'
                                        });
                                    }
                                    BranchModel.remove({city: city._id }, function (err) {
                                        if (err) {
                                            console.log(err);
                                        }
                                    });
                                    res.json(city);
                                });
                            });
                        }
                    });
                });
            });
        },

        /**
         * Show an city
         */
        show: function (req, res) {
            res.json(req.city);
        },

        /**
         * List of Cities
         */
        all: function (req, res) {
            var zoneId = req.zone._id;
            CityModel.find({zone: zoneId}).populate('branch').exec(function (err, cities) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the cities'
                    });
                }

                res.json(cities);
            });
        },
        
        allCity: function (req, res) {
        	CityModel.find({}).exec(function (err, cities) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the cities'
                    });
                }
                res.json(cities);
            });
        },

        loadZoneNCountry: function (req, res) {
            var zoneId = req.query.zoneId;
            ZoneModel.findOne({_id: zoneId}).exec(function (err, zone) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the zone'
                    });
                }
                res.json(zone);
            });
        },
        
        
        cityBasedOnCountry: function (req, res) {
        	var cityList = [];
            var country = req.country;
            var counter = 0;
            async.each(country.zone, function(zoneId, callback) {
            	CityModel.find({zone: zoneId}).exec(function(err, cities){
                	if(err){
                		return res.status(500).json({
                            error: 'Cannot list the cities'
                        });
                	}
                	console.log(cities);
                	
                	for(var i = 0; i < cities.length; i++){
                		cityList.push(cities[i]);
                	}
                	
                	counter++;
                	if(counter === country.zone.length){
                		res.json(cityList);
                		console.log(cityList);
                	}
                });
            	
            });
        },

        /**
         * List of role as by pagination
         */
        cityListByPagination: function (req, res) {
            var populateObj = {branch: 'name'};
            utility.pagination(req, res, CityModel, {}, {}, populateObj, function (result) {
                if (utility.isEmpty(result.collection)) {
                    //res.json(result);
                }
                return res.json(result);
            });
        }
    };
};