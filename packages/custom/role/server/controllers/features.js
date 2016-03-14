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
    FeatureModel = mongoose.model('Feature'),
    _ = require('lodash');

module.exports = function (FeatureCtrl) {

    return {
        /**
         * Find Feature by id
         */

        feature: function (req, res, next, id) {
            FeatureModel.load(id, function (err, feature) {
                if (err) {
                    return next(err);
                }
                if (!feature) {
                    return next(new Error('Failed to load role ' + id));
                }
                req.feature = feature;
                next();
            });
        },

        /**
         * Create the Feature
         */

        create: function (req, res) {
            var feature = new FeatureModel(req.body);
            req.assert('name', 'You must enter a Name').notEmpty();
            req.assert('url', 'You must enter a URL').notEmpty();
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            feature.save(function (err) {
                if (err) {
                    return validation.exportErrorResponse(res, err, ERRORS.ERROR_1401);
                }
                res.json(feature);
            });
        },
        /** Update the Feature*/
        update: function (req, res) {
            var feature = req.feature;
            if(!req.body.featureCategory){

                console.log("===================================================");
                feature.featureCategory=undefined;
                delete feature.featureCategory;
            }
            console.log(feature);
            feature = _.extend(feature, req.body);


            feature.save(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot update the feature'
                    });
                }

                res.json(feature);
            });
        },


        /**
         * Delete the Feature
         */
        destroy: function (req, res) {
            var feature = req.feature;


            feature.remove(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete the feature'
                    });
                }

                FeatureCtrl.events.publish('remove', {
                    //  description: req.user.name + ' deleted ' + userPage.title + ' userPage.'
                });

                res.json(feature);
            });
        },

        /**
         * Show the Feature
         */
        show: function (req, res) {

            res.json(req.feature);
        },

        /**
         * List of Features
         */
        all: function (req, res) {

            FeatureModel.find().sort({ name: 'asc' }).exec(function (err, features) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the features'
                    });
                }

                res.json(features);
            });
        },
        /**
         * List of role as by pagination
         */
        roleListByPagination: function (req, res) {
            var populateObj = {};
            utility.pagination(req, res, FeatureModel, {}, {}, populateObj, function (result) {
                if (utility.isEmpty(result.collection)) {
                    //res.json(result);
                }

                return res.json(result);
            });
        }
    };
}
