'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    IncidentTypeModel = mongoose.model('IncidentType'),
    CompanyModel = mongoose.model('Company'),
    configuration = require('../../../actsec/server/config/config.js'),
    upload = require('../../../../contrib/meanio-system/server/services/bulkUpload.js'),
    multiparty = require('multiparty'),
    fs = require('fs'),
    async = require('async'),
    logger = require('../../../../contrib/meanio-system/server/controllers/logs.js'),
    _ = require('lodash');
var path = require('path');
var mime = require('mime');

module.exports = function(Incidents, actsec, io) {

    var notif = require('../../../actsec/server/controllers/notification.js')(actsec, io);

    return {
        attachIncidentPhoto: function(req, res) {
            var form = new multiparty.Form();
            form.parse(req, function(err, fields, files) {
                if (files.file[0].originalFilename.split('.').pop() !== 'jpg' && files.file[0].originalFilename.split('.').pop() !== 'jpeg') {
                    return res.status(400).json({
                        'Error': 'File Format Not Supported.'
                    });
                } else {
                    upload.uploadFile(files, req.query.companyName, "/incidentsUpload/", files.file[0].originalFilename, function(filepath) {
                        res.send(filepath);
                    });
                }
            });
        },
        companyLocationAndBuilding: function(req, res) {
            var buildingArray = [],
                locationArray = [],
                array = [],
                uniqueLocation = [],
                companyBuildings = [];
            require('../../../../custom/building/server/models/building.js')(req.companyDb);
            var BuildingModel = req.companyDb.model('Building');
            require('../../../../custom/location/server/models/location.js')(req.companyDb);
            var LocationModel = req.companyDb.model('Location');
            BuildingModel.find({
                company: req.params.companyId
            }).exec(function(err, buildings) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "incident", "Failed to fetch building", {
                        company: req.params.companyId
                    }, err);
                    return res.status(500).json({
                        error: 'Cannot fetch buildings'
                    });
                }
                async.eachSeries(buildings, function(building, callback) {
                    BuildingModel.findOne({
                        _id: building
                    }, function(err, buildingObj) {
                        if (err) {
                            logger.error(req, req.user.company.company_name, "incident", "Failed to fetch building", {
                                _id: building
                            }, err);
                            res.status(400).send(err);
                            callback();
                        } else {
                            buildingArray.push(buildingObj);
                            LocationModel.findOne({
                                _id: buildingObj.location
                            }, function(err, locationObj) {
                                if (err) {
                                    logger.error(req, req.user.company.company_name, "incident", "Failed to fetch location", {
                                        _id: buildingObj.location
                                    }, err);
                                    res.status(400).send(err);
                                    callback();
                                } else {
                                    locationArray.push(locationObj);
                                }
                                callback();
                            });
                        }
                    })
                }, function(err) {
                    //removing duplicates from array
                    uniqueLocation = _.map(_.groupBy(locationArray, function(obj) {
                        return obj._id;
                    }), function(grouped) {
                        return (grouped[0])
                    });
                    var counter = 0;
                    async.each(uniqueLocation, function(location, locationCallback) {
                        location = location.toJSON();
                        location.buildings = [];
                        async.each(buildingArray, function(building, buildingCallback) {
                            if (JSON.stringify(building.location) == JSON.stringify(location._id)) {
                                location.buildings.push(building);
                            }
                            buildingCallback();
                        }, function(err) {
                            array.push(location)
                            locationCallback();
                        })
                    }, function(err) {
                        res.json(array);
                    })
                });
            });
        },
        buildingsonLocation: function(req, res) {
            require('../../../../custom/building/server/models/building.js')(req.companyDb);
            var BuildingModel = req.companyDb.model('Building');
            BuildingModel.find({
                location: req.query.locationId
            }, function(err, buildings) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "incident", "Failed to fetch buildings", {
                        location: req.query.locationId
                    }, err);
                    return res.status(400).json({
                        error: 'Cannot list the buildings'
                    });
                }
                return res.json(buildings);
            });
        },
        create: function(req, res) {
            require('../models/incident')(req.companyDb);
            var IncidentModel = req.companyDb.model('Incident');
            require('../../../../custom/securitytasks/server/models/securityTask')(req.companyDb);
            var SecurityTaskModel = req.companyDb.model('SecurityTask');
            require('../../../../custom/securitytasks/server/models/subtask')(req.companyDb);
            var SubTaskModel = req.companyDb.model('SubTask');
            req.assert('name', 'You must enter risk name').notEmpty();
            req.assert('description', 'You must enter risk description').notEmpty();
            req.assert('building', 'You must enter building').notEmpty();
            req.assert('location', 'You must enter location').notEmpty();
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            } else {
                var securitytask = {};
                securitytask.task_name = req.body.name;
                securitytask.description = req.body.description;
                securitytask.building = req.body.building;
                securitytask.location = req.body.location;
                securitytask.company = req.body.company;
                securitytask.cost = 0;
                securitytask.deadline = new Date();
                securitytask.source = 'INCIDENT';
                securitytask.attachments = req.body.photo;
                var securitytasks = new SecurityTaskModel(securitytask);
                securitytasks.save(function(err) {
                    if (err) {
                        var modelErrors = [];
                        if (err.errors) {
                            for (var x in err.errors) {
                                modelErrors.push({
                                    param: x,
                                    msg: err.errors[x].message,
                                    value: err.errors[x].value
                                });
                            }
                        }
                        logger.error(req, req.company.company_name, "securitytasks", "Failed to create securitytasks", securitytasks, err);
                        return res.status(400).json(modelErrors);
                    } else {
                        req.body.securitytask = securitytasks._id;
                        var subtask = {};
                        subtask.name = req.body.name;
                        subtask.description = req.body.description;
                        subtask.company = req.body.company;
                        subtask.security_task = req.body.securitytask;
                        subtask.building = req.body.building;
                        var subtasks = new SubTaskModel(subtask);
                        subtasks.save(function(err) {
                            if (err) {
                                var modelErrors = [];
                                if (err.errors) {
                                    for (var x in err.errors) {
                                        modelErrors.push({
                                            param: x,
                                            msg: err.errors[x].message,
                                            value: err.errors[x].value
                                        });
                                    }
                                }
                                logger.error(req, req.company.company_name, "securitytasks", "Failed to create securitytasks", securitytasks, err);
                                return res.status(400).json(modelErrors);
                            } else {
                                var incident = new IncidentModel(req.body);
                                incident.save(function(err) {
                                    if (err) {
                                        var modelErrors = [];
                                        if (err.errors) {
                                            for (var x in err.errors) {
                                                modelErrors.push({
                                                    param: x,
                                                    msg: err.errors[x].message,
                                                    value: err.errors[x].value
                                                });
                                            }
                                        }
                                        logger.error(req, req.company.company_name, "incident", "Failed to create incident", incident, err);
                                        return res.status(400).json(modelErrors);
                                    } else {
                                        require('../../../../custom/securitytasks/server/models/securityTask')(req.companyDb);
                                        var SecurityTaskModel = req.companyDb.model('SecurityTask');
                                        SecurityTaskModel.findOne({
                                            _id: securitytasks._id
                                        }, function(err, securitytaskObj) {
                                            if (err) {
                                                logger.error(req, req.company.company_name, "securitytask", "Failed to fetch securitytask", {
                                                    _id: securitytasks._id
                                                }, err);
                                                return res.status(400).send(err);
                                            } else {
                                                var securityTask = securitytaskObj;
                                                var sectsknew = securitytaskObj;
                                                sectsknew.sourceId = incident._id;
                                                securityTask = _.extend(securityTask, sectsknew);
                                                securityTask.save(function(err) {
                                                    if (err) {
                                                        logger.error(req, req.company.company_name, "incident", "Failed to create securityTask", securityTask, err);
                                                        return res.status(500).send(err);
                                                    } else {
                                                        require('../../../../custom/building/server/models/building.js')(req.companyDb);
                                                        var BuildingModel = req.companyDb.model('Building');
                                                        BuildingModel.findOne({
                                                            _id: incident.building
                                                        }, function(err, building) {
                                                            if (err) {
                                                            	if(!req.user){
                                                            		var mockReqObj = {
                                                                            connection: {
                                                                                remoteAddress: 'X.X.X.X'
                                                                            },
                                                                            method: 'INCIDENT',
                                                                            url: '',
                                                                            headers: []
                                                                        };
                                                            		logger.error(mockReqObj, 'SUPERADMIN', "incident", "Failed to fetch building", {
                                                                        _id: incident.building
                                                                    }, err);
                                                            	}else{
                                                                logger.error(req, req.user.company.company_name, "incident", "Failed to fetch building", {
                                                                    _id: incident.building
                                                                }, err);
                                                             }
                                                            } else {
                                                            	if(!req.user){
                                                            		var mockReqObj = {
                                                                            connection: {
                                                                                remoteAddress: 'X.X.X.X'
                                                                            },
                                                                            method: 'INCIDENT',
                                                                            url: '',
                                                                            headers: []
                                                                        };
                                                            		logger.log(mockReqObj, 'SUPERADMIN', "incident", "Incident created successfully", incident);
                                                            	}else{
                                                            		logger.log(req, req.user.company.company_name, "incident", "Incident created successfully", incident);
                                                            	}
                                                                notif.notifyRole('New incident reported in [' + building.building_name + ']', 'icon-exclamation', '/incidents', configuration.roles.SECURITY_MANAGER,incident.company, function() {});
                                                                return res.json(incident);
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        },
        all: function(req, res) {
            require('../models/incident')(req.companyDb);
            var IncidentModel = req.companyDb.model('Incident');
            IncidentModel.find({}).sort({
                createdAt: -1
            }).populate('securitytask').exec(function(err, incidents) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "incident", "Failed to fetch incidents", err);
                    return res.status(400).json({
                        error: 'Cannot list the incidents'
                    });
                }
                var securityTaskArray = [];
                async.each(incidents, function(incident, callback) {
                    require('../../../../custom/securitytasks/server/models/securityTask')(req.companyDb);
                    var SecurityTaskModel = req.companyDb.model('SecurityTask');
                    SecurityTaskModel.findOne({
                        sourceId: incident._id
                    }, function(err, securitytask) {
                        if (err) {
                            logger.error(req, req.user.company.company_name, "incident", "Failed to fetch securitytask", {
                                sourceId: incident._id
                            }, err);
                            res.status(400).send(err);
                            callback();
                        } else {
                            var securityTaskobj = securitytask;
                            incident = incident.toObject();
                            incident.securitytask = securityTaskobj;
                            securityTaskArray.push(incident);
                            callback();
                        }
                    });
                }, function(err) {
                    if (err) {
                        logger.error(req, req.user.company.company_name, "incident", "Failed to fetch incident", securityTaskArray, err);
                        return res.status(400);
                    } else {
                        return res.json(securityTaskArray);
                    }
                });
            });
        },
        getallGroupedIncidents: function(req, res) {
            var incidentCounts = {};
            IncidentTypeModel.find({}, function(err, incidenttypes) {
                if (err) {} else {
                    async.eachSeries(incidenttypes, function(incidenttype, cb) {
                        incidentCounts[incidenttype._id] = {};
                        incidentCounts[incidenttype._id]['name'] = incidenttype.incidenttype;
                        incidentCounts[incidenttype._id]['count'] = 0;
                        cb();
                    }, function(err) {
                        require('../models/incident')(req.companyDb);
                        var IncidentModel = req.companyDb.model('Incident');
                        var incidentresult = {};
                        incidentresult.totalIncidents = 0;
                        incidentresult.errorLog = [];
                        incidentresult.incidentsfound = [];
                        var incidentsAppendtype = {};
                        incidentsAppendtype.list = [];
                        incidentsAppendtype.error = [];
                        if (req.body.month == 'all') {
                            var start = new Date(req.body.year, 1, 1);
                            var end = new Date(req.body.year, 12, 31);
                        } else {
                            var start = new Date(req.body.year, req.body.month - 1, 1);
                            var d = new Date(req.body.year, req.body.month, 0);
                            var end = d;
                        }
                        async.eachSeries(req.user.buildings, function(buildingId, callback) {
                            IncidentModel.find({
                                building: buildingId,
                                createdAt: {
                                    $gte: start,
                                    $lt: end
                                }
                            }).exec(function(err, incidentsfetch) {
                                if (err) {
                                    incidentresult.errorLog.push('cannot list incidents for' + buildingId);
                                    callback();
                                } else {
                                    incidentresult.incidentsfound = incidentresult.incidentsfound.concat(incidentsfetch);
                                    callback();
                                }
                            });
                        }, function(err) {
                            if (err) {
                                return res.status(400).json(err);
                            }
                            incidentresult.incidentsfound = incidentresult.incidentsfound.filter(function(item) {
                                return item.toObject();
                            });
                            var result = _.groupBy(incidentresult.incidentsfound, "incidenttype");
                            var resultKeys = Object.keys(result);
                            async.eachSeries(resultKeys, function(incidenttype, cb) {
                                IncidentTypeModel.findOne({
                                    _id: incidenttype,
                                }, function(err, incidenttypefound) {
                                    if (err) {
                                        cb();
                                    } else {
                                        var count = result[incidenttype].length;
                                        incidentCounts[incidenttypefound._id]['count'] = count;
                                        cb();
                                    }
                                });
                            }, function(err) {
                                return res.json(incidentCounts);
                            });
                        });
                    });
                }
            });
        },
        /**
         * Find Company by id
         */
        initCompany: function(req, res, next, id) {
            CompanyModel.load(id, function(err, company) {
                if (err) {
                    if (req.user) {
                        logger.error(req, req.user.company.company_name, "company", "Failed to fetch company", {
                            _id: id
                        }, err);
                    } else {
                        logger.error(req, "GUEST", "company", "Failed to fetch company", {
                            _id: id
                        }, err);
                    }
                    return next(err);
                }
                if (!company) {
                    if (req.user) {
                        logger.error(req, req.user.company.company_name, "company", "Failed to load company", {
                            _id: id
                        }, err);
                    } else {
                        logger.error(req, "GUEST", "company", "Failed to load company", {
                            _id: id
                        }, err);
                    }
                    return next(new Error('Failed to load company ' + id));
                }
                req.company = company;
                next();
            });
        },
    };
}