'use strict';

/**
 * Module dependencies.
 */
var validation = require('../../../../core/system/server/controllers/validationUtil.js');
var MESSAGE = require('../../../../core/system/server/controllers/message.js');
var ERRORS = MESSAGE.ERRORS;
var SUCCESS = MESSAGE.SUCCESS;
var utility = require('../../../../core/system/server/controllers/util.js');

var mongoose = require('mongoose'),

RiskFactorModel = mongoose.model('RiskFactors'),

//UserModel = mongoose.model('User'),
    _ = require('lodash');

module.exports = function (RiskFactorCtrl) {

    return {
        /**
         * Find RiskFactor by id
         */

        riskfactor: function (req, res, next, id) {
            RiskFactorModel.load(id, function (err, riskfactor) {
                if (err) {
                    return next(err);
                }
                if (!riskfactor) {
                    return next(new Error('Failed to load riskfactor ' + id));
                }
                req.riskfactor = riskfactor;
                next();
            });
        },
        /* Create RiskFactor*/
        create: function (req, res) {
            console.log(req.body);
            var riskfactor = new RiskFactorModel(req.body);
            req.assert('name', 'You must enter a Name').notEmpty();
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            riskfactor.save(function (err) {
                if (err) {
                    return validation.exportErrorResponse(res, err, ERRORS.ERROR_1401);
                }
                res.json(riskfactor);
            });
        },
        /**
         * Update an RiskFactor
         */

        update: function (req, res) {
            var riskfactor = req.riskfactor;
            riskfactor = _.extend(riskfactor, req.body);
            // because we set our user.provider to local our models/user.js validation will always be true
            req.assert('name', 'You must enter name').notEmpty();
            /*req.assert('icon', 'You must enter icon').notEmpty();
            req.assert('description', 'You must enter description').notEmpty();*/
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            riskfactor.save(function (err) {
                if (err) {
                    return validation.exportErrorResponse(res, err, ERRORS.ERROR_1401);
                }
                res.json(riskfactor);
            });
        },
        
        /**
         * Delete the RiskFactor
         */
        destroy: function (req, res) {
            var riskfactor = req.riskfactor;


            riskfactor.remove(function (err) {
                if (err) {
                    return res.status(400).json({
                        error: 'Cannot delete the riskfactor'
                    });
                }

                
                RiskFactorCtrl.events.publish('remove', {
                    //  description: req.user.name + ' deleted ' + userPage.title + ' userPage.'
                });

                res.json(riskfactor);
            });
        },

        /**
         * Show the RiskFactor
         */
        show: function (req, res) {

            /*  riskfactor.events.publish('view', {
             description: req.user.name + ' read ' + req.riskfactor.title + ' riskfactor.'
             });
             */
            res.json(req.riskfactor);
        },
        /**
         * List of RiskFactors
         */
        all: function (req, res) {

            RiskFactorModel.find().exec(function (err, riskfactors) {
                if (err) {
                    return res.status(400).json({
                        error: 'Cannot list the riskfactors'
                    });
                }

                res.json(riskfactors);
            });
        },
        /**
        *Technology Risk Faactors
        */
         technologyRiskfactors: function (req, res) {
            RiskFactorModel.find({technology: true}).exec(function (err, riskfactors) {
                if (err) {
                    return res.status(400).json({
                        error: 'Cannot list the riskfactors'
                    });
                }

                res.json(riskfactors);
            });
        },


        /**
         * List of riskfactors as by pagination
         */
        riskFactorListByPagination: function (req, res) {
            var populateObj = {};
            utility.pagination(req, res, RiskFactorModel, {}, {}, populateObj, function (result) {
                if (utility.isEmpty(result.collection)) {
                    //res.json(result);
                }

                return res.json(result);
            });
        },
    };
}

