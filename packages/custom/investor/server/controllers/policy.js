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

PolicyModel = mongoose.model('Policy'),

//UserModel = mongoose.model('User'),
    _ = require('lodash');

module.exports = function (PolicyCtrl) {

    return {
        /**
         * Find Policy by id
         */

        policy: function (req, res, next, id) {
            PolicyModel.load(id, function (err, policy) {
                if (err) {
                    return next(err);
                }
                if (!policy) {
                    return next(new Error('Failed to load policy ' + id));
                }
                req.policy = policy;
                next();
            });
        },
        /* Create Policy*/
        create: function (req, res) {
            console.log(req.body);
            var policy = new PolicyModel(req.body);
            req.assert('name', 'You must enter a Name').notEmpty();
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }

            var errors = [];
            errors.concat(req.validationErrors());
            if (req.body.policyduration < req.body.policynoticeperiod) {
                console.log("Inside if");
                var policydurationError = {
                    msg: "Policy duration notice period should not be greater than actual policy duration.",
                    param: "Duration"
                };
                errors.push(policydurationError);
            } 
            if (req.body.mininvestment > req.body.maxinvestment) {
                console.log("Inside if");
                var investmentError = {
                    msg: "Max Investment should not be less than minimum investment.",
                    param: "maxInvestment"
                };
                errors.push(investmentError);
            } 
               if (errors.length > 0) {
                return res.status(400).send(errors);
            }
            policy.save(function (err) {
                if (err) {
                    return validation.exportErrorResponse(res, err, ERRORS.ERROR_1401);
                }
                res.json(policy);
            });
        },
        /**
         * Update an Policy
         */

        update: function (req, res) {
            var policy = req.policy;
            policy = _.extend(policy, req.body);
            // because we set our user.provider to local our models/user.js validation will always be true
            req.assert('name', 'You must enter name').notEmpty();
            /*req.assert('icon', 'You must enter icon').notEmpty();
            req.assert('description', 'You must enter description').notEmpty();*/
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }

            var errors = [];
            errors.concat(req.validationErrors());
            if (req.body.policyduration < req.body.policynoticeperiod) {
                console.log("Inside if");
                var policydurationError = {
                    msg: "Policy duration notice period should not be greater than actual policy duration.",
                    param: "Duration"
                };
                errors.push(policydurationError);
            } 
            if (req.body.mininvestment > req.body.maxinvestment) {
                console.log("Inside if");
                var investmentError = {
                    msg: "Max Investment should not be less than minimum investment.",
                    param: "Investment"
                };
                errors.push(investmentError);
            } 
               if (errors.length > 0) {
                return res.status(400).send(errors);
            }
            policy.save(function (err) {
                if (err) {
                    return validation.exportErrorResponse(res, err, ERRORS.ERROR_1401);
                }
                res.json(policy);
            });
        },
        
        /**
         * Delete the Policy
         */
        destroy: function (req, res) {
            var policy = req.policy;


            policy.remove(function (err) {
                if (err) {
                    return res.status(400).json({
                        error: 'Cannot delete the policy'
                    });
                }

                
                PolicyCtrl.events.publish('remove', {
                    //  description: req.user.name + ' deleted ' + userPage.title + ' userPage.'
                });

                res.json(policy);
            });
        },

        /**
         * Show the Policy
         */
        show: function (req, res) {

            /*  policy.events.publish('view', {
             description: req.user.name + ' read ' + req.policy.title + ' policy.'
             });
             */
            res.json(req.policy);
        },
        /**
         * List of Policies
         */
        all: function (req, res) {

            PolicyModel.find().populate('riskfactors.name').populate('technologyriskfactors.name').exec(function (err, policies) {
                if (err) {
                    return res.status(400).json({
                        error: 'Cannot list the Policies'
                    });
                }

                res.json(policies);
            });
        },


        /**
         * List of policy as by pagination
         */
        PolicyListByPagination: function (req, res) {
            var populateObj = {
                'riskfactors.name':'',
                'technologyriskfactors.name' : ''
            };
            utility.pagination(req, res, PolicyModel, {}, {}, populateObj, function (result) {
                if (utility.isEmpty(result.collection)) {
                    //res.json(result);
                }

                return res.json(result);
            });
        },
    };
}

