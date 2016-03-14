'use strict';

/**
 * Module dependencies.
 */

var async = require('async');

var mongoose = require('mongoose'),
    CountryModel = mongoose.model('Country'),
    UserModel = mongoose.model('User'),
    CityModel = mongoose.model('City'),
    fs = require("fs"),
    ZoneModel = mongoose.model('Zone') ,
    _ = require('lodash');


var validation = require('../../../../core/system/server/controllers/validationUtil.js');
var utility = require('../../../../core/system/server/controllers/util.js');
var MESSAGE = require('../../../../core/system/server/controllers/message.js');
var ERRORS = MESSAGE.ERRORS;
var SUCCESS = MESSAGE.SUCCESS;

// In the above _book.json_ file there is a `validateBookYear` token.
// mongoose-gen uses this token to lookup an actual validator function which
// should be registered beforehand. This is how to register validators.

function updateCountry(user, country,callback) {
    CountryModel.load(country._id, function (err, country) {
        UserModel.findOne({_id: user._id}).exec(function (err, user) {
            user.country=validation.insertInArray(user.country,country);
            async.each(country.zone, function (zone, callback) {
                user.zone=validation.insertInArray(user.zone,zone);
                async.each(zone.city, function (city, callback) {
                    user.city=validation.insertInArray(user.city,city);
                    async.each(city.branch, function (branch, callback) {
                        user.branch=validation.insertInArray(user.branch,branch);
                    });
                })
            });
            user.save(function (err) {
                if (err) {
                    console.log("Inside User admin save:Error " + err);
                }
                if(callback){
                    callback();
                }
            });
        });
    });
}

module.exports = function (Country) {

    return {


        /**
         * Find country by id
         */
        country: function (req, res, next, id) {
            CountryModel.load(id, function (err, country) {
                if (err)
                    return next(err);
                if (!country)
                    return next(new Error('Failed to load country ' + id));
                req.country = country;
                next();
            });
        },

        /**
         * Create an country
         */

        create: function (req, res) {
            var adminList = req.body.adminList;
            delete req.body.adminList;
            var country = new CountryModel(req.body);

            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }

            country.save(function (err, country) {
                if (err) {
                    return validation.exportErrorResponse(res, err, ERRORS.ERROR_1104);
                }
                CountryModel.load(country._id, function (err, country) {
                    if (err)
                        return next(err);
                    if (!country)
                        return next(new Error('Failed to load country ' + id));
                    async.each(adminList, function (user, callback) {
                        updateCountry(user, country)
                    });
                    res.json(country);
                });
            });
        },

        /**
         * Update an country
         */
        update: function (req, res) {
            var adminList = req.body.adminList;
            delete req.body.adminList;
            var country = req.country;

            country = _.extend(country, req.body);

            req.assert('countryName', 'You must enter a country name').notEmpty();
            req.assert('countryCode', 'You must enter country code').notEmpty();
            req.assert('currency', 'You must enter country currency').notEmpty();
            req.assert('languageName', 'You must enter country language name').notEmpty();
            req.assert('languageCode', 'You must enter country language code').notEmpty();

            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            UserModel.find({
                country: {$elemMatch: {$in: [country._id] }}
            }).populate('role', 'name').populate('country', 'name').exec(function (err, userList) {
                for (var i = 0; i < userList.length; i++) {
                    var found = false;
                    for (var j = 0; j < adminList.length; j++) {
                        if (userList[i]._id === adminList[j]._id) {
                            found = true;
                        }
                    }
                    if (!found) {
                        updateCountry(userList[i], country)
                    }
                }
            });
            country.save(function (err, country) {
                if (err) {
                    return validation.exportErrorResponse(res, err, ERRORS.ERROR_1104);
                }
                CountryModel.load(country._id, function (err, country) {
                    if (err)
                        return next(err);
                    if (!country)
                        return next(new Error('Failed to load country ' + id));
                    async.each(adminList, function (user, callback) {
                        updateCountry(user, country)
                    });
                    res.json(country);
                });
            });
        },
        /**
         * Delete a country
         */
        destroy: function (req, res) {
            var country = req.country;
            UserModel.find({
                country: {$elemMatch: {$in: [country._id] }}
            }).populate('role', 'name').populate('country', 'name').exec(function (err, userList) {
                var counter=0;
                async.each(userList, function (user, callback) {
                    updateCountry(user, country,function(){
                        counter++;
                        if(counter == userList.length){
                            country.remove(function (err) {
                                if (err) {
                                    return res.status(500).json({
                                        error: 'Cannot delete the country'
                                    });
                                }
                                ZoneModel.remove({country: country._id }, function (err) {
                                    if (err) {
                                        console.log(err);
                                    }
                                });
                                res.json(country);
                            });
                        }
                    });
                });
            });
        },

        /**
         * Show an country
         */
        show: function (req, res) {
            res.json(req.country);
        },

        /**
         * List of Countries
         */
        all: function (req, res) {
            CountryModel.find().populate('zone', 'name').deepPopulate('zone.city.branch', 'name').exec(function (err, countries) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the countries'
                    });
                }

                res.json(countries);
            });
        },

        /**
         * List of role as by pagination
         */
        countryListByPagination: function (req, res) {
            var populateObj = {zone: 'name'};
            utility.pagination(req, res, CountryModel, {}, {}, populateObj, function (result) {
                if (utility.isEmpty(result.collection)) {
                    //res.json(result);
                }
                return res.json(result);
            });
        },

        /**
         * List of Countries
         */
        locationTreeViewJSON: function (req, res) {
            CountryModel.find().populate('zone').exec(function (err, countries) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the countries'
                    });
                }
                CityModel.find().populate('branch').exec(function (err, cities) {
                    if (err) {
                        return res.status(500).json({
                            error: 'Cannot list the cities'
                        });
                    }
                    for (var t = 0; t < cities.length; t++) {
                        for (var i = 0; i < countries.length; i++) {
                            for (var j = 0; j < countries[i].zone.length; j++) {
                                if (JSON.stringify(countries[i].zone[j]._id) === JSON.stringify(cities[t].zone)) {
                                    if (!countries[i].zone[j].cities) {
                                        countries[i].zone[j].cities = [];
                                    }
                                    countries[i].zone[j].cities.push(cities[t]);
                                    break;
                                }
                            }
                        }
                    }
                    res.json(countries);
                });
            });
        }
    };
}
