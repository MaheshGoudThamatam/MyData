'use strict';
/**
 * Module dependencies.
 */

var validation = require('../../../../core/system/server/controllers/validationUtil.js');
var MESSAGE = require('../../../../core/system/server/controllers/message.js');
var ERRORS = MESSAGE.ERRORS;
var SUCCESS = MESSAGE.SUCCESS;
var async = require('async');

var mongoose = require('mongoose'),
    CoursematerialModel = mongoose.model('Coursematerial'),
    CoursematerialPageModel = mongoose.model('CoursematerialPage'),
    CoursemateriallistModel = mongoose.model('Coursemateriallist'),
    CourseModel = mongoose.model('Course'),
    _ = require('lodash');
module.exports = function (CoursematerialchapterCtrl) {
    return {
        /**
         * Find material by id
         */
        materials: function(req, res, next, id) {
            CoursematerialModel.load(id, function(err, material) {
                if (err) {
                    return next(err);
                }
                if (!material) {
                    return next(new Error('Failed to load material ' + id));
                }
                req.material = material;
                next();
            });
        },

        /**
         * Find materialTitle by id
         */
        materialTitle: function(req, res, next, id) {
            CoursemateriallistModel.load(id, function(err, materialTitle) {
                if (err) {
                    return next(err);
                }
                if (!materialTitle) {
                    return next(new Error('Failed to load materialTitle ' + id));
                }
                req.materialTitle = materialTitle;
                next();
            });
        },

        /**
         * Find Subtopic by id
         */
        subTopicDetails: function(req, res, next, id) {
            CoursematerialPageModel.load(id, function(err, subTopic) {
                if (err) {
                    return next(err);
                }
                if (!subTopic) {
                    return next(new Error('Failed to load subTopic ' + id));
                }
                req.subTopic = subTopic;
                next();
            });
        },

        /**
         * Find Course by id
         */
        course: function(req, res, next, id) {
            CourseModel.load(id, function(err, course) {
                if (err) {
                    return next(err);
                }
                if (!course) {
                    return next(new Error('Failed to load course ' + id));
                }
                req.course = course;
                next();
            });
        },
        /**
         * Create an course chapter
         */
        create: function(req, res) {
            var chapters = req.body.chapters;
            var Id = "";
            if (!req.body.parent){
                var materialHeader = req.body;
                var materialhead = {
                    title: materialHeader.title,
                    skills:materialHeader.skills,
                    description:materialHeader.description
                };
                var materialheadObj = new CoursemateriallistModel(materialhead);
                Id = materialheadObj
                materialheadObj.save(function(err) {
                    if (err) {
                        return validation.exportErrorResponse(res, err, ERRORS.ERROR_1401);
                    }
                });
            } else
            if(req.body.parent){
                Id = req.body.parent;
            }
            async.each(chapters, function(chapterArray, callback) {
                var chapter = {
                    name: chapterArray.name,
                    level: 'chapter',
                    material: Id
                }
                var chapterObj = new CoursematerialModel(chapter);
                    if (!req.body.parent){
                        materialheadObj.childId.push(chapterObj._id);
                        materialheadObj.save(function (err) {
                            if (err) {
                                console.log(err);
                            }
                        });
                    } else
                    if (req.body.parent){
                        CoursemateriallistModel.findOne({ _id: Id}, function (err, materialheadObj) {
                            materialheadObj.childId.push(chapterObj._id);
                            materialheadObj.save(function (err) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        });
                    }
                chapterObj.save(function(err) {
                    if (err) {
                        return validation.exportErrorResponse(res, err, ERRORS.ERROR_1401);
                    }
                    async.each(chapterArray.lessons, function(lessonArray, callback) {
                        var lesson = {
                            name: lessonArray.name,
                            level: 'lesson',
                            parentId: chapterObj._id
                        }
                        var lessonObj = new CoursematerialModel(lesson);
                        CoursematerialModel.findOne({ _id: chapterObj._id}, function (err, chapterDocument) {
                            chapterDocument.childId.push(lessonObj._id);
                            chapterDocument.save(function (err) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        });
                        lessonObj.save(function(err) {
                            if (err) {
                                return validation.exportErrorResponse(res, err, ERRORS.ERROR_1401);
                            }
                            async.each(lessonArray.topics, function(topicArray, callback) {
                                var topic = {
                                    name: topicArray.name,
                                    level: 'topic',
                                    parentId: lessonObj._id
                                }
                                var topicObj = new CoursematerialModel(topic);
                                CoursematerialModel.findOne({ _id: lessonObj._id}, function (err, lessonDocument) {
                                    lessonDocument.childId.push(topicObj._id);
                                    lessonDocument.save(function (err) {
                                        if (err) {
                                            console.log(err);
                                        }
                                    });
                                });
                                topicObj.save(function(err) {
                                    if (err) {
                                        return validation.exportErrorResponse(res, err, ERRORS.ERROR_1401);
                                    }
                                    var x = [];
                                    var i=1;
                                    async.each(topicArray.subTopics, function(subTopicArray, callback) {
                                        var subTopic = {
                                            name: subTopicArray.name,
                                            topic: topicObj._id
                                        }
                                        var subTopicObj = new CoursematerialPageModel(subTopic);
                                        CoursematerialModel.findOne({ _id: topicObj._id}, function (err, topicDocument) {
                                            topicDocument.pages.push(subTopicObj._id);
                                            topicDocument.save(function (err) {
                                                if (err) {
                                                    console.log(err);
                                                }
                                            });
                                        });
                                        subTopicObj.save(function(err) {
                                            if (err) {
                                                return validation.exportErrorResponse(res, err, ERRORS.ERROR_1401);
                                            }
                                        });
                                        x.push(subTopicObj);
                                    });
                                    for(var s=0;s<x.length;s++){
                                        x[s].pageNo = i;
                                        i=i+1;
                                        x[s].save(function(err){
                                           if (err) {
                                                return validation.exportErrorResponse(res, err, ERRORS.ERROR_1401);
                                            } 
                                        })
                                    }
                                });
                            });
                        });
                    });           
                });
            res.json(chapterObj[0]);
            });
        },
        /**
         * Update a material
         */
        update: function(req, res) {
            if (req.material){
                var material = req.material;
            } else
            if (req.subTopic){
                var material = req.subTopic;
            } else
            if (req.materialTitle){
                var material = req.materialTitle;
            }
            material = _.extend(material, req.body);
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            material.save(function(err) {
                if (err) {
                    return validation.exportErrorResponse(res, err, ERRORS.ERROR_1401);
                }
                res.json(material);
            });
        },
        /**
         * Delete a material
         */
        destroy: function(req, res) {
            if (req.materialTitle){
                var material = req.materialTitle;
                if (material.childId){
                    async.each(material.childId, function(chapterId, callback) {
                        CoursematerialModel.findOne({ _id: chapterId}, function (err, chapterDocument) {
                            if (chapterDocument.childId){
                                async.each(chapterDocument.childId, function(lessonId, callback) {
                                    CoursematerialModel.findOne({ _id: lessonId}, function (err, lessonDocument) {
                                        if (lessonDocument.childId){
                                            async.each(lessonDocument.childId, function(topicId, callback) {
                                                CoursematerialModel.findOne({ _id: topicId}, function (err, topicDocument) {
                                                    if (topicDocument.pages){
                                                        async.each(topicDocument.pages, function(subTopicId, callback) {
                                                            CoursematerialPageModel.findOne({ _id: subTopicId}, function (err, subTopicDocument) {
                                                                subTopicDocument.remove(function (err) {
                                                                    if (err) {
                                                                        return res.status(500).json({
                                                                            error: 'Cannot delete the subTopic'
                                                                        });
                                                                    }
                                                                });
                                                            });
                                                        });
                                                    }
                                                    topicDocument.remove(function (err) {
                                                        if (err) {
                                                            return res.status(500).json({
                                                                error: 'Cannot delete the topic'
                                                            });
                                                        }
                                                    });
                                                });
                                            });
                                        }
                                        lessonDocument.remove(function (err) {
                                            if (err) {
                                                return res.status(500).json({
                                                    error: 'Cannot delete the lesson'
                                                });
                                            }
                                        });
                                    });
                                });
                            }
                            chapterDocument.remove(function (err) {
                                if (err) {
                                    return res.status(500).json({
                                        error: 'Cannot delete the chapter'
                                    });
                                }
                            });
                        });
                    });
                }
                material.remove(function(err) {
                    if (err) {
                        return res.status(500).json({
                            error: 'Cannot delete the material'
                        });
                    }
                });
            res.json(material);
        } else
        if (req.material){
            var materials = req.material;
            if (materials.level == "chapter"){
                CoursemateriallistModel.findOne({ _id: materials.material}, function (err, materialTitle) {
                    for (var i=0;i<materialTitle.childId.length;i++){
                        if (JSON.stringify(materialTitle.childId[i]) === JSON.stringify(materials._id)) {
                            materialTitle.childId.splice(i, 1);
                            break;
                        }
                    }
                    materialTitle.save(function(err) {
                        if (err) {
                            return validation.exportErrorResponse(res, err, ERRORS.ERROR_1401);
                        }
                    });
                });
                materials.remove(function (err) {
                    if (err) {
                        return res.status(500).json({
                            error: 'Cannot delete the chapter'
                        });
                    }
                    res.json(materials);
                });
            } else
            if (materials.level == "lesson"){
                CoursematerialModel.findOne({ _id: materials.parentId}, function (err, Chapter) {
                    for (var j=0;j<Chapter.childId.length;j++){
                        if (JSON.stringify(Chapter.childId[j]) === JSON.stringify(materials._id)) {
                            Chapter.childId.splice(j, 1);
                            break;
                        }
                    }
                    Chapter.save(function(err) {
                        if (err) {
                            return validation.exportErrorResponse(res, err, ERRORS.ERROR_1401);
                        }
                    });
                });
                materials.remove(function (err) {
                    if (err) {
                        return res.status(500).json({
                            error: 'Cannot delete the lesson'
                        });
                    }
                    res.json(materials);
                });
            } else
            if (materials.level == "topic"){
                CoursematerialModel.findOne({ _id: materials.parentId}, function (err, Lesson) {
                    for (var k=0;k<Lesson.childId.length;k++){
                        if (JSON.stringify(Lesson.childId[k]) === JSON.stringify(materials._id)) {
                            Lesson.childId.splice(k, 1);
                            break;
                        }
                    }
                    Lesson.save(function(err) {
                        if (err) {
                            return validation.exportErrorResponse(res, err, ERRORS.ERROR_1401);
                        }
                    });
                });
                materials.remove(function (err) {
                    if (err) {
                        return res.status(500).json({
                            error: 'Cannot delete the topic'
                        });
                    }
                    res.json(materials);
                });
            }
        }
        if (req.subTopic){
            var material = req.subTopic;
            CoursematerialModel.findOne({ _id: material.topic}, function (err, topic) {
                    for (var k=0;k<topic.pages.length;k++){
                        if (JSON.stringify(topic.pages[k]) === JSON.stringify(material._id)) {
                            topic.pages.splice(k, 1);
                            break;
                        }
                    }
                    topic.save(function(err) {
                        if (err) {
                            return validation.exportErrorResponse(res, err, ERRORS.ERROR_1401);
                        }
                    });
                });

            var curr = material.pageNo;
            var SubTopictopicId = material.topic;
            var SubTopics = [];
            CoursematerialPageModel.find({}).exec(function(err, subTopicDocuments) {
                for (var a=0;a<subTopicDocuments.length;a++){
                    if (JSON.stringify(SubTopictopicId) === JSON.stringify(subTopicDocuments[a].topic)) {
                        SubTopics.push(subTopicDocuments[a]);
                    }
                }
                for (var p=curr-1;p<SubTopics.length;p++){
                    SubTopics[p].pageNo = SubTopics[p].pageNo - 1;
                    SubTopics[p].save(function() {});
                }
            });
            material.remove(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete the subtopic'
                    });
                }
                res.json(material);
            });
        }
    },

        /**
         * Show an material
         */
        show: function(req, res) {
            res.json(req.material);
        },

        /**
         * List of all material
         */
        all: function(req, res) {
            CoursematerialModel.find({}).exec(function(err, material) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the material'
                    });
                }
                res.json(material);
            });
        },

        /**
         * List of all Subtopic
         */
        subTopic: function(req, res) {
            CoursematerialPageModel.find().exec(function(err, subTopics) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the subTopics'
                    });
                }
                res.json(subTopics);
            });
        },

        /**
         * List of Subtopic by Id
         */
        findOneSubTopic: function(req, res) {
            CoursematerialPageModel.findOne({_id:req.subTopic._id}).exec(function(err, subTopics) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the subTopics'
                    });
                }
                res.json(subTopics);
            });
        },

        /**
         * List of all material List
         */
        materialList: function(req, res) {
            CoursemateriallistModel.find().exec(function(err, materials) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the materials'
                    });
                }
                res.json(materials);
            });
        },

        /**
         * List of all material List
         */
        materialfindOne: function(req, res) {
            CoursemateriallistModel.findOne({_id:req.materialTitle._id}).deepPopulate(['childId','childId.childId','childId.childId.childId','childId.childId.childId.pages']).exec(function(err, material) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the material'
                    });
                }
                res.json(material);
            });
        },

    };

}