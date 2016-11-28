'use strict';
/** Name : Feature Controller
 * Description : This controller retrieves the features created by the super admin.
 * @ <author> Anto Steffi 
 * @ <date> 15-Jun-2016
 * @ METHODS: get
 */

/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    FeatureModel = mongoose.model('Feature'),
    logger = require('../../../../contrib/meanio-system/server/controllers/logs.js'),
    _ = require('lodash');

module.exports = function(FeatureCtrl) {

    return {
        /**
         * Loads the Feature based on id
         */

        feature: function(req, res, next, id) {
            FeatureModel.load(id, function(err, feature) {
                if (err) {
                    if ((req.user.role._id + '') !== configuration.roles.SUPER_ADMIN) {
                        logger.error(req, req.user.company.company_name, "feature", "Failed to fetch feature", {
                            _id: id
                        }, err);
                    } else {
                        logger.error(req, "SUPERADMIN", "feature", "Failed to fetch feature", {
                            _id: id
                        }, err);
                    }
                    return next(err);
                }
                if (!feature) {
                    if ((req.user.role._id + '') !== configuration.roles.SUPER_ADMIN) {
                        logger.error(req, req.user.company.company_name, "feature", "Failed to fetch feature", {
                            _id: id
                        }, err);
                    } else {
                        logger.error(req, "SUPERADMIN", "feature", "Failed to fetch feature", {
                            _id: id
                        }, err);
                    }
                    return next(new Error('Failed to load feature ' + id));
                }
                req.feature = feature;
                next();
            });
        },

        /**
         * Show the Feature
         */
        show: function(req, res) {

            res.json(req.feature);
        },

        /**
         * List of Features
         */
        all: function(req, res) {
            FeatureModel.find({ system: false }).sort({
                name: 'asc'
            }).exec(function(err, features) {
                if (err) {
                    if ((req.user.role._id + '') !== configuration.roles.SUPER_ADMIN) {
                        logger.error(req, req.user.company.company_name, "feature", "Failed to fetch feature", {
                            system: false
                        }, err);
                    } else {
                        logger.error(req, "SUPERADMIN", "feature", "Failed to fetch feature", {
                            system: false
                        }, err);
                    }
                    return res.status(500).json({
                        error: 'Cannot list the features'
                    });
                } else {
                    return res.json(features);
                }
            });
        }

    }
};
