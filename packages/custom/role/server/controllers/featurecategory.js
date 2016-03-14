'use strict';

/**
 * Module dependencies.
 */
var utility = require('../../../../core/system/server/controllers/util.js');
var validation = require('../../../../core/system/server/controllers/validationUtil.js');
var MESSAGE = require('../../../../core/system/server/controllers/message.js');
var ERRORS = MESSAGE.ERRORS;
var SUCCESS = MESSAGE.SUCCESS;

var mongoose = require('mongoose'),
    FeatureCategoryModel = mongoose.model('FeatureCategory'),
    _ = require('lodash');

module.exports = function (FeatureCategory) {

    return {

        /**
         * Find JobSite by id
         */
        featureCategory: function (req, res, next, id) {
            FeatureCategoryModel.load(id, function (err, featureCategory) {
                if (err) return next(err);
                if (!featureCategory) return next(new Error('Failed to load featureCategory ' + id));
                req.featureCategory = featureCategory;
                next();
            });
        },

        /**
         * Create an jobSite
         */
        create: function (req, res) {
            var featureCategory = new FeatureCategoryModel(req.body);
            req.assert('name', 'You must enter name').notEmpty();
            req.assert('icon', 'You must enter icon').notEmpty();
            req.assert('description', 'You must enter description').notEmpty();
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            featureCategory.save(function (err) {
                if (err) {
                    return validation.exportErrorResponse(res, err, ERRORS.ERROR_1401);
                }
                res.json(featureCategory);
            });
        },


        /**
         * Update an jobSite
         */

        update: function (req, res) {
            var featureCategory = req.featureCategory;
            featureCategory = _.extend(featureCategory, req.body);
            // because we set our user.provider to local our models/user.js validation will always be true
            req.assert('name', 'You must enter name').notEmpty();
            req.assert('icon', 'You must enter icon').notEmpty();
            req.assert('description', 'You must enter description').notEmpty();
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            featureCategory.save(function (err) {
                if (err) {
                    return validation.exportErrorResponse(res, err, ERRORS.ERROR_1401);
                }
                res.json(featureCategory);
            });
        },

        /**
         * Delete a jobSite
         */
        destroy: function (req, res) {
            var featureCategory = req.featureCategory;

            featureCategory.remove(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete the featureCategory'
                    });
                }

                res.json(featureCategory);
            });
        },

        /**
         * Show an jobSite
         */
        show: function (req, res) {
            res.json(req.featureCategory);
        },

        /**
         * List of jobSite
         */
        all: function (req, res) {
            FeatureCategoryModel.find().exec(function (err, featureCategory) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the featureCategory'
                    });
                }
                res.json(featureCategory);
            });
        },

        /**
         * List of feature category as by pagination
         */
        featureCategoryListByPagination: function (req, res) {
            var populateObj = {};
            utility.pagination(req, res, FeatureCategoryModel, {}, {}, populateObj, function (result) {
                if (utility.isEmpty(result.collection)) {
                    //res.json(result);
                }

                return res.json(result);
            });
        }

    };
}