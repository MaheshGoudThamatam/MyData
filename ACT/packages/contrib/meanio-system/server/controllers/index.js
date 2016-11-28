'use strict';

var mean = require('meanio');
var mongoose = require('mongoose');
require('../../../../custom/company/server/models/company');
var companyModel = mongoose.model('Company');
var config = require('../../../../custom/actsec/server/config/config.js');

module.exports = function(System) {
    return {
        render: function(req, res) {
            res.render('index', {
                locals: {
                    config: System.config.clean
                }
            });
        },

        aggregatedList: function(req, res) {
            res.send(res.locals.aggregatedassets);
        },

        initCompanyDb: function(req, res, next) {
            if (req.user) {
                //Do not initialize the companyDB for superadmin
                if ((req.user.role._id + '') !== config.roles.SUPER_ADMIN) {
                    if (!req.companyDb) {
                        var companyDb = mongoose.createConnection('mongodb://localhost:27017/' + req.user.company.database);
                        companyDb.on('connected', function() {
                            req.companyDb = companyDb;
                            next();
                        });
                    } else {
                        next();
                    }
                } else {
                    next();
                }
            } else {
                next();
            }
        },

        initCompanyDbExt: function(req, res, next, id) {
            if (!req.user && id) {
                companyModel.findOne({
                    _id: id
                }, function(err, company) {
                    if (err || !company) {
                        return res.status(500).json({
                            error: 'Cannot proceed at this time. Please try again or contact administrator.'
                        });
                    } else {
                        if (!req.companyDb) {
                            var companyDb = mongoose.createConnection('mongodb://localhost:27017/' + company.database);
                            companyDb.on('connected', function() {
                                req.companyDb = companyDb;
                                next();
                            });
                        } else {
                            next();
                        }
                    }
                });
            } else {
                next();
            }
        }
    };
};