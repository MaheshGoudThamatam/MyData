'use strict';
/**
 * Module dependencies.
 */
require('../../../../custom/skill/server/models/skill.js');

var utility = require('../../../../core/system/server/controllers/util.js');
var validation = require('../../../../core/system/server/controllers/validationUtil.js');
var MESSAGE = require('../../../../core/system/server/controllers/message.js');
var ERRORS = MESSAGE.ERRORS;
var SUCCESS = MESSAGE.SUCCESS;

var mongoose = require('mongoose'),
    SkillModel = mongoose.model('Skill'),
    SkillkeywordsModel = mongoose.model('Skillkeyword'),
    _ = require('lodash');
module.exports = function (SkillCtrl) {
    return {
        /**
         * Find skill by id
         */
        skill: function (req, res, next, id) {
            SkillModel.load(id, function (err, skill) {
                if (err) {
                    return next(err);
                }
                if (!skill) {
                    return next(new Error('Failed to load skill ' + id));
                }
                req.skill = skill;
                next();
            });
        },
        /**
         * Create an skill
         */
        create: function (req, res) {
            var skillData = req.body;
            skillData.keywords = _.pluck(skillData.keywords, 'text');
            req.assert('name', 'Please enter Skill name').notEmpty();
            req.assert('description', 'You must enter Skill description').notEmpty();
            req.assert('keywords', 'You must enter Skill keywords').notEmpty();
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }

            var skillkeywords = req.body.keywords;
            skillData.normalizedName = skillData.name.replace(/\s/g, "").toLowerCase();
            var skill = new SkillModel(skillData);

            var errArray = [];

            for (var j = 0; j < skillkeywords.length; j++) {
                SkillkeywordsModel.findOne({'normalizedKeyword': skillkeywords[j].replace(/\s/g, "").toLowerCase()}, function (err, skillKeyword) {
                    if (skillKeyword) {
                        var error = {
                            keyword: skillKeyword.keyword,
                            skill: skillKeyword.skillId,
                            msg: 'Keyword already associated with the skillId',
                            param: 'keywords'
                        };
                        errArray.push(error);
                    }
                });
            }
            if (errArray.length > 0) {
                return res.status(400).send(errArray);
            }


            skill.save(function (err, skilldetails) {
                if (err) {
                    return validation.exportErrorResponse(res, err, ERRORS.ERROR_1301);
                }
                else {
                    var ReferenceskillId = skilldetails._id;
                    for (var i = 0; i < skillkeywords.length; i++) {
                        var skillkeywordData = {'skillId': ReferenceskillId, 'keyword': skillkeywords[i], 'normalizedKeyword': skillkeywords[i].replace(/\s/g, "").toLowerCase()};
                        var skillKeywords = new SkillkeywordsModel(skillkeywordData);
                        skillKeywords.save(function (err, items) {
                            if (err) {

                            }
                        });
                    }
                    return res.json(skilldetails);
                }
            });
        },
        /**
         * Update an skill
         */
        update: function (req, res) {
            var skillData = req.body;
            skillData.keywords = _.pluck(skillData.keywords, 'text');
            var skill = req.skill;
            skill = _.extend(skill, skillData);
            req.assert('name', 'Please enter Skill name').notEmpty();
            req.assert('description', 'You must enter Skill description').notEmpty();
            req.assert('keywords', 'You must enter Skill keywords').notEmpty();
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }

            var skillkeywords = skill.keywords;


            for (var j = 0; j < skillkeywords.length; j++) {

                SkillkeywordsModel.findOne({'normalizedKeyword': skillkeywords[j].replace(/\s/g, "").toLowerCase(), 'skillId': {$ne: req.body._id}}, function (err, skillKeyword) {
                    if (skillKeyword) {
                        var error = {
                            keyword: skillKeyword.keyword,
                            skill: skillKeyword.skillId,
                            msg: 'Keyword already associated with the skillId',
                            param: 'keywords'
                        };
                        errArray.push(error);
                    }
                });
            }

            skill.normalizedName = req.body.name.replace(/\s/g, "").toLowerCase();
            skill.save(function (err) {
                if (err) {
                    return validation.exportErrorResponse(res, err, ERRORS.ERROR_1301);
                }
                else {

                    SkillkeywordsModel.remove({skillId: req.body._id}, function (err) {
                        if (err) {
                            console.log(err);
                        }
                        else {

                            for (var i = 0; i < skillkeywords.length; i++) {

                                var skillkeywordData = {'skillId': req.body._id, 'keyword': skillkeywords[i], 'normalizedKeyword': skillkeywords[i].replace(/\s/g, "").toLowerCase()};
                                var skillKeywords = new SkillkeywordsModel(skillkeywordData);
                                skillKeywords.save(function (err, items) {
                                    if (err) {

                                    }
                                });
                            }
                            res.json(skill);
                        }

                    });

                }
            });
        },
        /**
         * Delete a skill
         */
        destroy: function (req, res) {
            var skill = req.skill;
            skill.remove(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete the skill'
                    });
                }
                else {
                    SkillkeywordsModel.remove({skillId: skill._id}, function (err) {
                        if (err) {
                            console.log(err);
                        }
                        else {

                            res.json(skill);
                        }

                    });

                }

            });
        },
        /**
         * Show an skill
         */
        show: function (req, res) {
            res.json(req.skill);
        },
        /**
         * List of skills
         */
        all: function (req, res) {
            SkillModel.find().exec(function (err, skills) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the skills'
                    });
                }
                res.json(skills);
            });
        },

        /**
         * List of skill as by pagination
         */
        skillListByPagination: function (req, res) {
            var populateObj = {};
            utility.pagination(req, res, SkillModel, {}, {}, populateObj, function (result) {
                if (utility.isEmpty(result.collection)) {
                    //res.json(result);
                }

                return res.json(result);
            });
        },

    };
}