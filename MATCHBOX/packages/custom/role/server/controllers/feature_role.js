'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    RoleModel = mongoose.model('Role'),
    FeatureRoleModel = mongoose.model('FeatureRole'),
    UserModel = mongoose.model('User'),
    _ = require('lodash');
var validation = require('../../../../core/system/server/controllers/validationUtil.js');
var MESSAGE = require('../../../../core/system/server/controllers/message.js');
var ERRORS = MESSAGE.ERRORS;
var SUCCESS = MESSAGE.SUCCESS;


module.exports = function (FeatureRoleCtrl) {

    return {
        /**
         * Find Role by id
         */

        featurerole: function (req, res, next, id) {
            FeatureRoleModel.load(id, function (err, featurerole) {
                if (err) {
                    return next(err);
                }
                if (!featurerole) {
                    return next(new Error('Failed to load featurerole ' + id));
                }
                req.featurerole = featurerole;
                next();
            });
        },
        role: function (req, res, next, id) {
            RoleModel.load(id, function (err, role) {
                if (err) {
                    return next(err);
                }
                if (!role) {
                    return next(new Error('Failed to load featurerole ' + id));
                }
                req.role = role;
                next();
            });
        },

        user: function (req, res, next, id) {
            UserModel.load(id, function (err, user) {
                if (err) {
                    return next(err);
                }
                if (!user) {
                    return next(new Error('Failed to load user ' + id));
                }
                req.user = user;
                next();
            });
        },

        useronRoles: function (req, res) {
            FeatureRoleModel.loadfeatureRoleByRoles(req.user.role, function (err, featureroles) {
                if (err) {
                    return next(err);
                }
                if (!featureroles) {
                    return next(new Error('Failed to load featurerole ' + id));
                }
                res.json(featureroles);
            });

        },

        featurerolebyRole: function (req, res) {
            FeatureRoleModel.loadfeatureRoleByRole(req.role._id, function (err, featureroles) {
                if (err) {
                    return next(err);
                }
                if (!featureroles) {
                    return next(new Error('Failed to load featurerole ' + id));
                }
                res.json(featureroles);
            });
        },


        create: function (req, res) {
            var featurerole = new FeatureRoleModel(req.body);

            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            featurerole.save(function (err) {
                if (err) {
                    return validation.exportErrorResponse(res, err, ERRORS.ERROR_1401);
                }
                res.json(featurerole);
            });
        },


        /** Update the Role
         */
        update: function (req, res) {
            var featurerole = req.featurerole;
            var featurerole = _.extend(featurerole, req.body);
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            featurerole.save(function (err) {
                if (err) {
                    return validation.exportErrorResponse(res, err, ERRORS.ERROR_1401);
                }
                res.json(featurerole);
            });
        },


        /**
         * Delete the featurerole
         */
        destroy: function (req, res) {
            var featurerole = req.featurerole;


            featurerole.remove(function (err) {
                if (err) {
                    return res.status(400).json({
                        error: 'Cannot delete the featurerole'
                    });
                }

                FeatureRoleCtrl.events.publish('remove', {
                    //  description: req.user.name + ' deleted ' + userPage.title + ' userPage.'
                });

                res.json(featurerole);
            });
        },

        /**
         * Show the Role
         */
        show: function (req, res) {
            res.json(req.featurerole);
        },
        /**
         * List of Roles
         */
        all: function (req, res) {

            FeatureRoleModel.find().populate('feature', 'name url isComponent icon color width').exec(function (err, featureroles) {
                if (err) {
                    return res.status(400).json({
                        error: 'Cannot list the featureroles'
                    });
                }

                res.json(featureroles);
            });
        }
    };
}
