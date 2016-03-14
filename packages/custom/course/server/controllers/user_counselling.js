/** User Counselling Controller - Server Side
  * User can apply for counselling, list counselling based on userId, and delete request by userId.
  * @ Rajesh - Feb 17, 2016
**/
'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
   UserCounsellingModel = mongoose.model('UserCounselling'),
    UserModel = mongoose.model('User'),
    CounsellingScheduleModel = mongoose.model('CounsellingSchedule'),
    CounsellingModel = mongoose.model('Counselling'),
    _ = require('lodash');

module.exports = function (UserCounselling) {

    return {

        /**
         * Find course by id
         */
    	userCounselling: function (req, res, next, id) {
    		UserCounsellingModel.load(id, function (err, userCounselling) {
                if (err) return next(err);
                if (!userCounselling) return next(new Error('Failed to load UserCounselling ' + id));
                req.userCounselling = userCounselling;
                next();
            });
        },
        user: function (req, res, next, id) {
    		UserModel.load(id, function (err, user) {
                if (err) return next(err);
                if (!user) return next(new Error('Failed to load user ' + id));
                req.user = user;
                next();
            });
        },
         
        /**
         * Create an course
         */
        create: function (req, res) {
            var userCounselling = new UserCounsellingModel(req.body);
            userCounselling.save(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot save the UserCounselling'
                    });
                }

                res.json(userCounselling);
            });
        },
        
        /**
         * Update an UserCounselling
         */
        update: function (req, res) {
            var userCounselling = req.userCounselling;
            userCounselling = _.extend(userCounselling, req.body);
            userCounselling.save(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot update the UserCounselling'
                    });
                }

                res.json(userCounselling);
            });
        },
        
        /**
         * Delete a UserCounselling
         */
        destroy: function (req, res) {
            var userCounselling = req.userCounselling;
            
            userCounselling.remove(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete the UserCounselling'
                    });
                }

                res.json(userCounselling);
            });
        },
        
        /**
         * Show an UserCounselling
         */
        show: function (req, res) {
            res.json(req.userCounselling);
        },
        
        /**
         * List of UserCounselling
         */
        all: function (req, res) {
            UserCounsellingModel.find().exec(function (err, UserCounsellings) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the UserCounsellings'
                    });
                }

                res.json(UserCounsellings);
            });
        },


        /**
         * Display slots based on date and branchId.
         */
        slotList: function (req, res) {
            var errArray = [];
            var courseId = req.query.courseId;
            var branchId = req.query.branchId;
            var cutoff = new Date(req.query.data);
            var modifieddate = new Date(cutoff.setHours(cutoff.getHours()-24));
            var dateRange = modifieddate.toISOString();
            var newDate = dateRange.replace(/00:00:00.000/, '23:59:59.000');
            
            var reqDate = new Date(req.query.data);
            if(reqDate <= new Date()){
                var error = {
                    msg: 'Date cannot be less than current date',
                    param: 'dateError'
                };
                errArray.push(error);
                if (errArray.length > 0) {
                    return res.status(400).send(errArray);
                }
            }
            var query = CounsellingScheduleModel.find({
                $and:[{
                        callDate: { $gte: new Date(dateRange)} 
                    }, {
                        callDate: { $lte: new Date(newDate) }
                    },{
                        course: courseId
                    },{
                        branch: branchId
                    }]
                });
                query.exec(function (err, value){
                    if (err) {
                        return res.status(500).json({error: 'Not found'});
                    }
                    for (var i = 0; i < value.length; i++) {
                        var resultArray = _.reject(value[i].slots, function(removeCounter){     
                            return removeCounter.counter >= value[i].capacity;
                        });
                        value[i].slots = resultArray;               
                    };
                    res.json(value);
                });
        },

        /**
         * Create counselling request schedule.
         */
        dateCreate: function (req, res) {
            CounsellingModel.find({
                    $and:[
                    { studentName: req.body.studentName }, 
                    { course: req.body.course },
                    { branch: req.body.branch },
                    { status: { $ne: "Closed" } } ,
                    { status: { $ne: "Rejected" } }
                    ]
                }).then(function(found){
                    var errObj = {};
                    if(found.length > 0){
                        errObj.statusData = "1000";
                        res.json(errObj);
                    }
                    else{
                    var dateRange = req.body.counsellingDate;
                    var newDate = dateRange.replace(/00:00:00.000/, '23:59:59.000');
                    var cutoff = new Date(dateRange);
                    var modifieddate = new Date(cutoff.setHours(cutoff.getHours()-24));
                    modifieddate = modifieddate.toISOString();
                    var cutoffNewdate = new Date(newDate);
                    var modifieddateNewdate = new Date(cutoffNewdate.setHours(cutoffNewdate.getHours()-24));
                    modifieddateNewdate = modifieddateNewdate.toISOString();
                    console.log(modifieddate);
                    console.log(modifieddateNewdate);
                    var counsellingRequest = new CounsellingModel(req.body);
                    counsellingRequest.save(function (err) {
                        if (err) {
                            return res.status(500).json({
                                error: 'Cannot save the counselling request'
                            });
                        }
                        else
                        {
                            CounsellingScheduleModel.find({
                                $and:[{
                                    callDate: { $gte: modifieddate} 
                                    }, {
                                    callDate: { $lte: modifieddateNewdate }
                                }]
                            }).then(function(data) {
                                var newData = data;
                                var reqData = req.body.counsellingSlot;
                                for (var i = 0; i < newData.length; i++) {
                                    CounsellingScheduleModel.findOne({_id: newData[i]._id}, function(err, item){
                                        var resultArray = _.map(item.slots, function(incrementCounter){
                                            if(incrementCounter.slotTime === reqData){
                                                incrementCounter.counter = incrementCounter.counter + 1;
                                            }
                                            return incrementCounter;
                                        });
                                        /**
                                         * Required if any date issue
                                         */
                                        // var resultArray = _.map(item.slots, function(incrementCounter){
                                        //     if(incrementCounter.slotTime === reqData){
                                        //     var errObj = {};
                                        //         if(incrementCounter.counter >= 4){
                                        //             errObj.statusData = "1001";
                                        //             res.json(errObj);
                                        //         }
                                        //         else{
                                        //             incrementCounter.counter = incrementCounter.counter + 1;
                                        //         }
                                        //     }
                                        //     return incrementCounter;
                                        // });
                                        item.slots = resultArray;
                                        item.save(function(err){
                                            if(err){
                                                return res.status(500).json({
                                                    error: 'Cannot save the counselling request'
                                                });
                                            }
                                        });
                                    });
                                }
                            });
                        }
                        res.json(counsellingRequest);
                    });                            
                    }
            });
        },

        /**
         * Load counselling request by userId
         */
        dateRequestUser: function(req, res){
            CounsellingModel.loadByUser(req.query.userId, function (err, requestStatus) {
                if (err) return next(err);
                if (!requestStatus) return next(new Error('Failed to load requests'));
                res.json(requestStatus);
          });
        },

        /**
         * Load all counselling
         */
        counselling : function(req, res, next, id) {
            CounsellingModel.load(id, function (err, counselling) {
                if (err) {
                    return next(err);
                }
                if (!counselling) {
                    return next(new Error('Failed to load counselling ' + id));
                }
                req.counselling = counselling;
                next();
            });
        },

        /**
         * Delete counselling request by userId
         */
        deleteStudentRequest: function(req, res){

            var counselling = req.counselling;
            var dateRange = counselling.counsellingDate.toISOString();
            var newDate = dateRange.replace(/00:00:00.000/, '23:59:59.000');
            var cutoff = new Date(dateRange);
            var modifieddate = new Date(cutoff.setHours(cutoff.getHours()-24));
            modifieddate = modifieddate.toISOString();
            var cutoffNewdate = new Date(newDate);
            var modifieddateNewdate = new Date(cutoffNewdate.setHours(cutoffNewdate.getHours()-24));
            modifieddateNewdate = modifieddateNewdate.toISOString();
            counselling.remove(function(err){
                if(err){
                    return res.status(500).json({
                        error: 'Cannot delete request'
                    });
                }
                else
                    {
                        CounsellingScheduleModel.find({
                            $and:[{
                                callDate: { $gte: modifieddate}
                                }, {
                                callDate: { $lte: modifieddateNewdate }
                            }]
                        }).then(function(data) {
                            var newData = data;
                            var reqData = counselling.counsellingSlot;
                            for (var i = 0; i < newData.length; i++) {
                                CounsellingScheduleModel.findOne({_id: newData[i]._id}, function(err, item){
                                    var resultArray = _.map(item.slots, function(incrementCounter){
                                        if(incrementCounter.slotTime === reqData){
                                            incrementCounter.counter = incrementCounter.counter - 1;
                                        }
                                        return incrementCounter;
                                    });
                                    item.slots = resultArray;
                                    item.save(function(err){
                                        if(err){
                                            return res.status(500).json({
                                                error: 'Cannot save the counselling request'
                                            });
                                        }
                                    });
                                });
                            }
                        });
                    }
                res.json(counselling);
            });
        },
    };
}