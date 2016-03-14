'use strict';

/**
 * Module dependencies.
 */
var validation = require('../../../../core/system/server/controllers/validationUtil.js');
var MESSAGE = require('../../../../core/system/server/controllers/message.js');
var ERRORS = MESSAGE.ERRORS;
var SUCCESS = MESSAGE.SUCCESS;
var utility = require('../../../../core/system/server/controllers/util.js');

var async = require('async');
var mongoose = require('mongoose'),

    UserModel = mongoose.model('User'),
    RoleModel = mongoose.model('Role'),
    FeatureroleModel = mongoose.model('Featurerole'),

//UserModel = mongoose.model('User'),
    _ = require('lodash');

module.exports = function (RoleCtrl) {

    return {
        /**
         * Find Role by id
         */

        role: function (req, res, next, id) {
            RoleModel.load(id, function (err, role) {
                if (err) {
                    return next(err);
                }
                if (!role) {
                    return next(new Error('Failed to load role ' + id));
                }
                req.role = role;
                next();
            });
        },


        create: function (req, res) {
            var features = req.body.features;
            delete req.body.features;
            var role = new RoleModel(req.body);
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            var roleFeatures=[];
            for(var i=0;i<features.length;i++ ){
                roleFeatures.push(features[i].feature);
            }
            role.features=roleFeatures;
            role.save(function (err) {
                if (err) {
                    return validation.exportErrorResponse(res, err, ERRORS.ERROR_1401);
                }

                async.each(features, function (feature, callback) {

                    var featureRoleData = {
                        role: role._id,
                        feature: feature.feature,
                        isWrite: feature.isWrite,
                        isDelete: feature.isDelete,
                        isRead: feature.isRead,
                        isUpdate: feature.isUpdate
                    };
                    var featureRole = new FeatureroleModel(featureRoleData);
                    featureRole.save(function (err) {
                        if (err) {
                            console.log("Inside feature role save:Error " + err);
                        }
                    });
                });
                res.json(role);
            });
        },


        /** Update the Role
         */
        update: function (req, res) {
            var features = req.body.features;
            delete req.body.features;
            var role = req.role;
            var role = _.extend(role, req.body);
            req.assert('description', 'You must enter role description').notEmpty();
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            var roleFeatures=[];
            for(var i=0;i<features.length;i++ ){
                roleFeatures.push(features[i].feature);
            }
            role.features=roleFeatures;
            role.save(function (err) {
                if (err) {
                    return validation.exportErrorResponse(res, err, ERRORS.ERROR_1401);
                }
                FeatureroleModel.remove({role: role._id}, function () {
                    async.each(features, function (feature, callback) {
                        var featureRoleData = {
                            role: role._id,
                            feature: feature.feature,
                            isWrite: feature.isWrite,
                            isDelete: feature.isDelete,
                            isRead: feature.isRead,
                            isUpdate: feature.isUpdate
                        };
                        var featureRole = new FeatureroleModel(featureRoleData);
                        featureRole.save(function (err) {
                            if (err) {
                                console.log("Inside feature role save:Error " + err);
                            }
                        });
                    });
                    res.json(role);
                });
            });
        },


        /**
         * Delete the Role
         */
        destroy: function (req, res) {
            var role = req.role;


            role.remove(function (err) {
                if (err) {
                    return res.status(400).json({
                        error: 'Cannot delete the role'
                    });
                }

                RoleCtrl.events.publish('remove', {
                    //  description: req.user.name + ' deleted ' + userPage.title + ' userPage.'
                });

                res.json(role);
            });
        },

        /**
         * Show the Role
         */
        show: function (req, res) {

            /*  role.events.publish('view', {
             description: req.user.name + ' read ' + req.role.title + ' role.'
             });
             */
            res.json(req.role);
        },
        /**
         * List of Roles
         */
        all: function (req, res) {

            RoleModel.find().populate('features', 'name').sort({ name: 'asc' }).exec(function (err, roles) {
                if (err) {
                    return res.status(400).json({
                        error: 'Cannot list the Roles'
                    });
                }

                res.json(roles);
            });
        },


        /**
         * List of role as by pagination
         */
        roleListByPagination: function (req, res) {
            var populateObj = {role: 'role'};
            utility.pagination(req, res, RoleModel, {}, {}, populateObj, function (result) {
                if (utility.isEmpty(result.collection)) {
                    //res.json(result);
                }

                return res.json(result);
            });
        },

        loadRoleOfAdmin: function (req, res) {
            RoleModel.findOne({'name': 'Admin'}, function (err, roleId) {

                res.json(roleId);
            });
        },

        loadUserBasedOnRole: function (req, res) {
            var populateObj = {role: 'role'};
            var query = {};
            console.log("query:" + query);
            RoleModel.findOne({'name': 'admin'}, function (err, role) {
                query.role = {};
                console.log("query" + query.role);
                query.role.$in = [];
                query.role.$in.push(role._id);
                utility.pagination(req, res, UserModel, query, {}, populateObj, function (result) {
                    if (utility.isEmpty(result.collection)) {
                        //res.json(result);
                    }

                    return res.json(result);
                    console.log("result:" + result);
                });
            });
        }
    };
}

