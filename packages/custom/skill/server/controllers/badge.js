'use strict';

/**
 * Module dependencies.
 */
var utility = require('../../../../core/system/server/controllers/util.js');
var validation = require('../../../../core/system/server/controllers/validationUtil.js');
var MESSAGE = require('../../../../core/system/server/controllers/message.js');
var ERRORS = MESSAGE.ERRORS;
var SUCCESS = MESSAGE.SUCCESS;

var mongoose = require('mongoose'), BadgeModel = mongoose.model('Badge'), _ = require('lodash');
module.exports = function (BadgeCtrl) {

    return {

        /**
         * Find badge by id
         */
        badge: function (req, res, next, id) {
            BadgeModel.load(id, function (err, badge) {
                if (err) {
                    return next(err);
                }
                if (!badge) {
                    return next(new Error('Failed to load badge ' + id));
                }
                req.badge = badge;
                next();
            });
        },

        /**
         * Create an badge
         */
        create: function (req, res) {
            var badge = new BadgeModel(req.body);
            req.assert('badgeName', 'You must enter a Badge Name').notEmpty();
            req.assert('description', 'You must enter the Description').notEmpty();
            req.assert('qualifySkills', 'You must enter the Qualified Skills').notEmpty();
            req.assert('qualifyPoints', 'You must enter the Qualified Points').notEmpty();
            var errors = req.validationErrors();
            if (errors) {
                res.status(400).send(errors);
            }
            badge.save(function (err) {
                if (err) {
                    return validation.exportErrorResponse(res, err, ERRORS.ERROR_1201);
                }
                res.json(badge);
            });
        },

        /**
         * Update an badge
         */
        update: function (req, res) {
            var badge = req.badge;
            badge = _.extend(badge, req.body);
            req.assert('badgeName', 'You must enter a Badge Name').notEmpty();
            req.assert('description', 'You must enter the Description').notEmpty();
            req.assert('qualifySkills', 'You must enter the Qualified Skills').notEmpty();
            req.assert('qualifyPoints', 'You must enter the Qualified Points').notEmpty();

            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }

            badge.save(function (err) {
                if (err) {
                    return validation.exportErrorResponse(res, err, ERRORS.ERROR_1201);
                }

                res.json(badge);
            });
        },

        /**
         * Delete a badge
         */
        destroy: function (req, res) {
            var badge = req.badge;
            badge.remove(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete the badge'
                    });
                }

                res.json(badge);
            });
        },

        /**
         * Show an badge
         */
        show: function (req, res) {
            res.json(req.badge);
        },

        /**
         * List of badges
         */
        all: function (req, res) {
            BadgeModel.find().exec(function (err, badges) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the badges'
                    });
                }

                res.json(badges);
            });
        },

        /**
         * List of badge as by pagination
         */
        badgeListByPagination: function (req, res) {
            var populateObj = {};
            utility.pagination(req, res, BadgeModel, {}, {}, populateObj, function (result) {
                if (utility.isEmpty(result.collection)) {
                    //res.json(result);
                }
                return res.json(result);
            });
        },

    };
}
