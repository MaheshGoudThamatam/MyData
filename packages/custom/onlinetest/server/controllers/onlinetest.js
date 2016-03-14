'use strict';

/**
 * Module dependencies.
 */
require('../../../skill/server/models/skill.js');
var utility = require('../../../../core/system/server/controllers/util.js');
var validation = require('../../../../core/system/server/controllers/validationUtil.js');
var MESSAGE = require('../../../../core/system/server/controllers/message.js');
var ERRORS = MESSAGE.ERRORS;
var SUCCESS = MESSAGE.SUCCESS;

var mongoose = require('mongoose'),
    OnlineTestModel = mongoose.model('Onlinetest'),
    SkillModel = mongoose.model('Skill'),
    _ = require('lodash');


module.exports = function (OnlineTestCtrl) {
    return {

        /**
         * Find online test by id
         */
         onlinetest : function(req,res,next,id) {
         	OnlineTestModel.load( id , function(err, onlinetest){
         		if(err){
         			return next(err);
         		}
         		if(!onlinetest){
         			return next(new Error('Failed to load onlinetest'+ id));
         		}
         		req.onlinetest = onlinetest;
         		next();

         	});
         },
         skill : function(req,res,next,id) {
        	 SkillModel.load( id , function(err, skill){
          		if(err){
          			return next(err);
          		}
          		if(!skill){
          			return next(new Error('Failed to load skill'+ id));
          		}
          		req.skillId = skill;
          		next();

          	});
          },
         
         create : function(req, res) {
          var errors = [];
          var skillList = _.pluck(req.body.testSkills, 'subSkillName');
          var uniqueChc =  _.uniq(skillList , JSON.stringify).length === skillList.length;
           if(!uniqueChc)
            { 
              var valError2 = {
                 msg: "Sub skill names must be unique",
                 param: "subSkillError"    
              };
              errors.push(valError2);
            }
      var onlinetest = new OnlineTestModel(req.body);
             // because we set our user.provider to local our models/user.js validation will always be true
      req.assert('name', 'Please enter  Name').notEmpty();
      req.assert('description', 'You must enter description').notEmpty();
      req.assert('instructions', 'You must enter instructions').notEmpty();
      req.assert('duration', 'You must enter duration').notEmpty();
      req.assert('numberOfQuestions', 'You must enter numberOfQuestions').notEmpty();
      req.assert('passMark', 'You must enter passMark').notEmpty();
            errors.concat(req.validationErrors());
            onlinetest.testSkills.map(function(cSkill) {
                if(cSkill.complexityend <= cSkill.complexitystart) {
                    var valError = {
                        msg: "Complexity end must be greater than complexity start",
                        param: "complexityend"
                    };
                    errors.push(valError);
                }
                return cSkill;
            });
 			if (errors.length > 0) {
 				return res.status(400).send(errors);
 			}
 			onlinetest.save(function(err) {
 				if (err) {
 					switch (err.code) {
 					case 11000:
 					case 11001:
 						res.status(400).json([ {
 							msg : ' Name already exists',
 							param : 'name'
 						} ]);
 						break;
 					    default:
 						var modelErrors = [];
 					    
 						if (err.errors) {
 							for ( var x in err.errors) {
 								modelErrors.push({
 									param : x,
 									msg : err.errors[x].message,
 									value : err.errors[x].value
 								});
 							}
 							console.log('mod'+modelErrors);
 							res.status(400).json(modelErrors);
 						}
 					}
 					return res.status(400);
 				    }
 				res.json(onlinetest);
 			});
 		},
         /**
          * delete the test
          */
         
        destroy: function (req, res) {
             var onlinetest = req.onlinetest;
             
             onlinetest.remove(function (err) {
                 if (err) {
                     return res.status(500).json({
                         error: 'Cannot delete the course'
                     });
                 }
                 res.json(onlinetest);
             });
         },
         /**
          * List of Articles
          */
         all: function (req, res) {

             
        	 OnlineTestModel.find().exec(function (err, onlinetest) {
                 if (err) {
                     return res.status(500).json({
                         error: 'Cannot list the onlinetest'
                     });
                 }

                 res.json(onlinetest);
             });

         },
         /**
          * update the test
          */
           
         update : function(req, res) {
          var errors = [];
          var skillList = _.pluck(req.body.testSkills, 'subSkillName');
          var uniqueChc =  _.uniq(skillList , JSON.stringify).length === skillList.length;
           if(!uniqueChc)
            { 
              var valError2 = {
                 msg: "Sub skill names must be unique",
                 param: "subSkillError"    
              };
              errors.push(valError2);
            }
 			var onlinetest = req.onlinetest;
 			onlinetest = _.extend(onlinetest, req.body);
 			// because we set our user.provider to local our models/user.js validation will always be true
 			
 			req.assert('name', 'Please enter  Name').notEmpty();
 			req.assert('description', 'You must enter description').notEmpty();
 			req.assert('instructions', 'You must enter instructions').notEmpty();
 			req.assert('duration', 'You must enter duration').notEmpty();
 			req.assert('numberOfQuestions', 'You must enter numberOfQuestions')
 					.notEmpty();
 			req.assert('passMark', 'You must enter passMark')
 					.notEmpty();      
            errors.concat(req.validationErrors());
            onlinetest.testSkills.map(function(cSkill) {
                if(cSkill.complexityend <= cSkill.complexitystart) {
                    var valError = {
                        msg: "Complexity end must be greater than complexity start",
                        param: "complexityend"
                    };
                    errors.push(valError);
                }
                return cSkill;
            });
 			if (errors.length > 0) {
 				return res.status(400).send(errors);
 			}
 			onlinetest.save(function(err) {
 				if (err) {
 					switch (err.code) {
 					case 11000:
 					case 11001:
 						res.status(400).json([ {
 							msg : 'Name already exists',
 							param : 'name'
 						} ]);
 						break;
 					    default:
 						var modelErrors = [];
 						if (err.errors) {
 							for ( var x in err.errors) {
 								modelErrors.push({
 									param : x,
 									msg : err.errors[x].message,
 									value : err.errors[x].value
 								});
 							}
 							console.log('mod'+modelErrors);
 							res.status(400).json(modelErrors);
 						}
 					}
 					return res.status(400);
 				    }
 				res.json(onlinetest);
 			});
 		},
         /**
          * Show an theme
          */
         show: function (req, res) {

             res.json(req.onlinetest);
         },
         
         //loading online test based on skills
         loadOnlineTest:function(req, res){
        	 OnlineTestModel.find({skill:req.skillId}).exec(function (err, onlinetests) {
                 if (err) {
                     return res.status(500).json({
                         error: 'Cannot list the onlinetest'
                     });
                 }

                 res.json(onlinetests);
             });
         },
         onlinetestListByPagination: function (req, res) {
             var populateObj = {};
             utility.pagination(req, res, OnlineTestModel, {}, {}, populateObj, function(result){
                 if(utility.isEmpty(result.collection)){
                 }
                 
                 return res.json(result);
             });
         },

	};
}