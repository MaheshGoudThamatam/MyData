require('../../../../custom/skill/server/models/skill.js');
require('../../../../custom/skill/server/models/skillkeywords.js');
var utility = require('../../../../core/system/server/controllers/util.js');
var mongoose = require('mongoose');
var jobModel = mongoose.model('job');
var skillModel = mongoose.model('Skill');
var http = require('http');
var querystring = require('querystring');
var requestify = require('requestify');
var async = require('async');
var SkillkeywordsModel = mongoose.model('Skillkeyword');
var Sites = mongoose.model('Site');
var _ = require('lodash');
var usermodel = mongoose.model('User');
var nodemailer = require('nodemailer');
var config = require('meanio').loadConfig();
var skillsetModel = mongoose.model('skillset');
module.exports = function(Jobs, app) {
    return {
        skillset: function(req, res, next, id) {
            skillsetModel.load(id, function(err, skillset) {
                if (err) {
                    return next(err);
                }
                if (!skillset) {
                    return next(new Error('Failed to load skillset ' + id));
                }
                req.skillset = skillset;
                next();
            });
        },
        create: function(req, res) {
            req.assert('name', 'Please enter Skill Set name').notEmpty();
            req.assert('cost', 'Please enter Skill Set cost').notEmpty();
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }

            var autocompletfieldemptyerror = [];
            for (var i = 0; i < req.body.skill.length; i++) {
                if (req.body.skill[i].skillid == undefined) {
                    autocompletfieldemptyerror.push({});
                }
            }
            if (autocompletfieldemptyerror.length > 0) {
                return res.status(400).send([{
                    msg: "Please select the skill from auto complete",
                    param: "autocompleteemptyerror"
                }]);
            }

            var skilluniqueerrors = [];
            var skillList = _.pluck(req.body.skill, 'skillid');
            var uniqueChc = _.uniq(skillList, JSON.stringify).length === skillList.length;
            if (!uniqueChc) {
                var valError2 = {
                    msg: "Skills Should be unique",
                    param: "skillserror"
                };
                skilluniqueerrors.push(valError2);
            }
            if (skilluniqueerrors.length > 0) {
                return res.status(400).send(skilluniqueerrors);
            }
            
            var skillsetcreate = new skillsetModel(req.body);
            skillsetcreate.save(function(err, items) {
                if (err) {
                    switch (err.code) {
                        case 11000:
                        case 11001:
                            res.status(400).json([{
                                msg: 'Skill Set already exists',
                                param: 'name'
                            }]);
                            break;
                        default:
                            var modelErrors = [];
                            if (err.errors) {
                                for (var x in err.errors) {
                                    modelErrors.push({
                                        param: x,
                                        msg: err.errors[x].message,
                                        value: err.errors[x].value
                                    });
                                }
                                res.status(400).json(modelErrors);
                            }
                    }
                    return res.status(400);
                } else {
                    res.send(items);
                }
            });
        },
        fetchallskillset: function(req, res) {
            var populateObj = {'skill.skillid':'name'};
            utility.pagination(req, res, skillsetModel, {}, {}, populateObj, function(result) {
                if (utility.isEmpty(result.collection)) {
                    //res.json(result);
                }
                return res.json(result);
            });
        },
        skillsetdelete: function(req, res) {
            var skillset = req.skillset;
            skillset.remove(function(err, deletedskillset) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete the skillset'
                    });
                } else {
                    res.send(deletedskillset);
                }
            });
        },
        singleskillsetdetail: function(req, res) {
            res.send(req.skillset);
        },
        skillsetupdate: function(req, res) {
            req.assert('name', 'Please enter Skill Set name').notEmpty();
            req.assert('cost', 'Please enter Skill Set cost').notEmpty();
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }

            var autocompletfieldemptyerror = [];
            for (var i = 0; i < req.body.skill.length; i++) {
                if (req.body.skill[i].skillid == undefined) {
                    autocompletfieldemptyerror.push({});
                }
            }
            if (autocompletfieldemptyerror.length > 0) {
                return res.status(400).send([{
                    msg: "Please select the skill from auto complete",
                    param: "autocompleteemptyerror"
                }]);
            }

            var skilluniqueerrors = [];
            var skillList = _.pluck(req.body.skill, 'skillid');
            var uniqueChc = _.uniq(skillList, JSON.stringify).length === skillList.length;
            if (!uniqueChc) {
                var valError2 = {
                    msg: "Skills Should be unique",
                    param: "skillserror"
                };
                skilluniqueerrors.push(valError2);
            }
            if (skilluniqueerrors.length > 0) {
                return res.status(400).send(skilluniqueerrors);
            }

            var skillset = req.skillset;
            var savingskillset = _.extend(skillset, req.body);
            savingskillset.save(function(err, items) {
                if (err) {
                    switch (err.code) {
                        case 11000:
                        case 11001:
                            res.status(400).json([{
                                msg: 'Skill Set already exists',
                                param: 'name'
                            }]);
                            break;
                        default:
                            var modelErrors = [];
                            if (err.errors) {
                                for (var x in err.errors) {
                                    modelErrors.push({
                                        param: x,
                                        msg: err.errors[x].message,
                                        value: err.errors[x].value
                                    });
                                }
                                res.status(400).json(modelErrors);
                            }
                    }
                    return res.status(400);
                } else {
                    res.send(items);
                }
            });
        }
    }
};