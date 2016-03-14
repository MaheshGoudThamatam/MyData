/** Admin Counselling Controller - Server Side
  * Admin can create counselling schedule.
  * @ Rajesh - Feb 17, 2016
  * @async Pradeep - Fen 20, 2016
**/
'use strict';
var async = require('async');
require('../../../../custom/branch/server/models/branch.js');
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    UserCounsellingModel = mongoose.model('UserCounselling'),
    UserModel = mongoose.model('User'),
    CounsellingScheduleModel = mongoose.model('CounsellingSchedule'),
    CounsellingModel = mongoose.model('Counselling'),
    BranchModel = mongoose.model('Branch'),
    _ = require('lodash'),
    utility = require('../../../../core/system/server/controllers/util.js'),
    nodemailer = require('nodemailer'),
    config = require('meanio').loadConfig(),
    async = require('async');

module.exports = function(UserCounselling) {
    return {
        /**
         * Find course by id
         */
        branch: function(req, res, next, id) {
            BranchModel.load(id, function(err, branchData) {
                if (err) return next(err);
                if (!branchData) return next(new Error('Failed to load ' + id));
                req.branchData = branchData;
                next();
            });
        },
        show: function(req, res) {
            res.json(req.branchData);
        },

        /**
         * Schedule create
         */
        scheduleCreate: function(req, res) {
            var errArray = [];
            var scheduleslotarray = req.body.slots;
            var cutoff = new Date(req.body.callDate);
            var modifieddate = new Date(cutoff);
            var str=modifieddate.toISOString().substr(0,10);
            str=str+"T00:00:00.000Z";
            var  str1=str.replace(/00:00:00.000/, '23:59:59.000');
            var startTimeTotalReq = (req.body.start_hr * 60) + Number(req.body.start_min);
            var endTimeTotalReq = (req.body.end_hr * 60) + Number(req.body.end_min);
            CounsellingScheduleModel.find({$and:[
                     {branch:req.body.branch},
                     {"callDate":{$gte: new Date(str)}},
                     {"callDate":{$lte: new Date(str1)}},
                     {mentorAssigned:req.body.mentorAssigned}
            ]   
            },function (err, value){
                if (err) {
                    return res.status(500).json({error: 'Not found'});
                } else { 
                    var startTimeTotal = 0;
                    var endTimeTotal = 0;
                    var flagCreate = 0;
                    for (var i = 0; i < value.length; i++) {
                        startTimeTotal = (value[i].start_hr * 60) + Number(value[i].start_min);
                        endTimeTotal = (value[i].end_hr * 60) + Number(value[i].end_min);
                        if(startTimeTotalReq >= startTimeTotal && startTimeTotalReq <= endTimeTotal){
                            flagCreate+= 1;
                            var error = {
                                msg: 'Mentor has already been assigned',
                                param: 'mentorAssignedError'
                            };
                            errArray.push(error);
                            if (errArray.length > 0) {
                                return res.status(400).send(errArray);
                            }
                        }
                        if(endTimeTotalReq >= startTimeTotal && endTimeTotalReq <= endTimeTotal){
                            flagCreate+= 1;
                            var error = {
                                msg: 'Mentor has already been assigned',
                                param: 'mentorAssignedError'
                            };
                            errArray.push(error);
                            if (errArray.length > 0) {
                                return res.status(400).send(errArray);
                            }
                        }
                        if(startTimeTotal >= startTimeTotalReq && startTimeTotal <= endTimeTotalReq){
                            flagCreate+= 1;
                            var error = {
                                msg: 'Mentor has already been assigned',
                                param: 'mentorAssignedError'
                            };
                            errArray.push(error);
                            if (errArray.length > 0) {
                                return res.status(400).send(errArray);
                            }
                        }
                        if(endTimeTotal >= startTimeTotalReq && endTimeTotal <= endTimeTotalReq){
                            flagCreate+= 1;
                            var error = {
                                msg: 'Mentor has already been assigned',
                                param: 'mentorAssignedError'
                            };
                            errArray.push(error);
                            if (errArray.length > 0) {
                                return res.status(400).send(errArray);
                            }
                        }
                    }
                    if(flagCreate <= 0){
                        var scheduleCreate = new CounsellingScheduleModel(req.body);
                        scheduleCreate.save(function(err) {
                            if (err) {
                                return res.status(500).json({
                                    error: 'Cannot save the schedule'
                                });
                            }
                            async.waterfall([
                              function(done) {

                            UserModel.find({
                                    _id: req.body.mentorAssigned
                                }, function(err, userList) {
                                var mentorMailId = userList[0].email;
                                console.log(mentorMailId);
                                var mailOptions = {
                                from: config.emailFromWelcome,
                                createTextFromHtml: true,
                                subject: 'Counselling Schedule Create'
                                };
                                mailOptions.to = mentorMailId;
                                var cutoff = new Date(req.body.callDate);
                                var cutoff = cutoff.toString();
                                var cutoff = cutoff.substring(0,15);
                                var startTimeTotalReq = req.body.start_hr+":"+req.body.start_min;
                                var endTimeTotalReq = req.body.end_hr+":"+req.body.end_min;
                                var schedulelist = ['(This email is for testing purposes only)','Dear User,','Your counselling on '+cutoff+' from '+startTimeTotalReq+' to '+endTimeTotalReq+' is scheduled.'];
                                schedulelist.push('(This email is for testing purposes only)');
                                mailOptions.html = schedulelist.join('<br><br>');
                                sendMail(mailOptions);
                                });
                            done();
                          },
                          function(done){
                            res.json(scheduleCreate);
                            done();
                          }]);
                        });
                    }
                }
            });
           
        },

        userList: function(req, res) {
            UserModel.find({
                branch: req.params.branchIdUser
            }, function(err, userList) {
                res.send(userList);
            });
        },

        listadminusercounsellingrequest: function(req, res) {
            var populateObj = {
                'studentName': 'name',
                'course': 'name',
                'branch': 'branchName'
            };
            utility.pagination(req, res, CounsellingModel, {}, {}, populateObj, function(result) {
                if (utility.isEmpty(result.collection)) {
                    //res.json(result);
                }
                return res.json(result);
            });
        },

        /**
         * Change counselling request status by counsellingId
         */
        changingCounsellingStatus: function(req, res) {
               async.waterfall([
                 function(done) {

                     CounsellingModel.findOne({
                            '_id': req.body.counsellingid
                        }, function(err, item) {
                            if (err) {
                                console.log(err);
                            } else {
                                item.status = req.body.status;
                                item.mentorAssigned = req.body.mentorAssigned;
                                item.save(function(err) {
                                    if (err) {
                                        res.send(400);
                                    } else {
                                        done(null,item);
                                    }
                                });
                            }
                        }).populate('studentName','').populate('course','');

                 },
                 function(item,done) {
                       var mailOptions = {
                                from: config.emailFromWelcome,
                                createTextFromHtml: true,
                                subject: 'Counselling Schedule Update'
                                };
                       var counsellingdate=item.counsellingDate;
                           counsellingdate=counsellingdate.toISOString().substr(0,10);                 
                        mailOptions.to = item.studentName.email;                           
                        var schedulelist = ['(This email is for testing purposes only)','Dear User,','Your counselling schedule from '+item.counsellingSlot+' on '+counsellingdate+' for course '+item.course.name+' has been Approved.'];
                        schedulelist.push('(This email is for testing purposes only)');
                        mailOptions.html = schedulelist.join('<br><br>');
                        sendMail(mailOptions);
                        done();
                  }], function(err) {res.send(200)}); 

            
        },

        /**
         * Change counselling request status (Reject) by counsellingId
         */
        changingCounsellingStatusreject: function(req, res) {
            async.waterfall([
                 function(done) {
                  CounsellingModel.findOne({
                        '_id': req.body.counsellingid
                    }, function(err, item) {
                        if (err) {
                            console.log(err);
                        } else {
                            item.status = req.body.status;
                            item.save(function(err) {
                                if (err) {
                                    res.send(400);
                                } else {
                                    done(null,item);
                                }
                            });
                        }
                    }).populate('studentName','').populate('course','');
                 },
                 function(item,done) {
                       var mailOptions = {
                                from: config.emailFromWelcome,
                                createTextFromHtml: true,
                                subject: 'Counselling Schedule Update'
                                };
                       var counsellingdate=item.counsellingDate;
                           counsellingdate=counsellingdate.toISOString().substr(0,10);                 
                        mailOptions.to = item.studentName.email;                           
                        var schedulelist = ['(This email is for testing purposes only)','Dear User,','Your counselling schedule from '+item.counsellingSlot+' on '+counsellingdate+' for course '+item.course.name+' has been Rejected.'];
                        schedulelist.push('(This email is for testing purposes only)');
                        mailOptions.html = schedulelist.join('<br><br>');
                        sendMail(mailOptions);
                        done();
                  }], function(err) {res.send(200)}); 

        },

        /**
         * Get all counselling request admin
         */
        listcompleteadminuserschedulelist: function(req, res) {
            var populateObj = {'branch':'branchName','course':'name','mentorAssigned':'name'};
            utility.pagination(req, res, CounsellingScheduleModel, {}, {}, populateObj, function(result) {
                if (utility.isEmpty(result.collection)) {
                    // res.send(400);
                }
                return res.json(result);
            });
        },

        /**
         * Get mentor detail
         */
        getMentor: function(req, res) {
            var cutoff = new Date(req.query.counsellingDate);
            var modifieddate = new Date(cutoff.setHours(cutoff.getHours() - 24));
            var dateRange = modifieddate.toISOString();
            var newDate = dateRange.replace(/00:00:00.000/, '23:59:59.000');
            var slot = req.query.counsellingSlot;
            var branch = req.query.branchId;
            CounsellingScheduleModel.find({
                $and: [
                        {'callDate': {
                           $gte: new Date(dateRange)
                        }},
                     
                        {'callDate': {
                            $lte: new Date(newDate)
                        }},
                     {
                        'branch': branch
                    }]
                },
                function(err, items) {
                    if (err) {
                        res.send(400);
                    } else {
                        res.send(items);
                    }
                }).populate('studentName','').populate('course','');
    },

    deleteAdminSchedule: function(req, res) {
                  var scheduleslotarray=JSON.parse(req.query.slots).scheduleslots;
                  var cutoff = new Date(req.query.callDate);
                  var modifieddate = new Date(cutoff.setHours(cutoff.getHours() + 24));
                   var str=modifieddate.toISOString().substr(0,10);
                       str=str+"T00:00:00.000Z";
                  var  str1=str.replace(/00:00:00.000/, '23:59:59.000');
                  var myarray=[];
                  var count=0;

                 async.waterfall([
                function(done) {

                 for(var i=0;i<scheduleslotarray.length;i++)  
                 {
                    CounsellingModel.find({$and:[
                     {"branch":req.query.branch},
                     {"counsellingSlot":scheduleslotarray[i].slotTime},
                     {"counsellingDate":{$gte: new Date(str)}},
                     {"counsellingDate":{$lte: new Date(str1)}},
                     {"mentorAssigned":req.query.mentorAssigned},
                     {"status":"Approved"}

                ]}, function(err, items) {
                    if (err) {
                        console.log(err);
                    } else {
                        count=count+1;
                       if(items.length > 0) 
                       {
                          for(var j=0;j<items.length;j++)
                          {
                             myarray.push({"counsellingId":items[j]._id});
                          }             
                        } 
                      if(count > scheduleslotarray.length-1) 
                        {
                            done(null,myarray);
                        } 
                         
                    }
                 });
                    
                  }   

                },
                function(myarray,done) {
                    res.send(myarray);
                    res.end();
                    done();
                }
            ], function(err) {});

             
    },

    confirmdeleteAdminScheduleandemail: function(req, res) { 
       var scheduleId=req.query.scheduleId;
       var useremailarray=JSON.parse(req.query.useremailarray).schedulearray;
        if(useremailarray.length > 0)  
        {

            async.waterfall([
                function(done) {
                     CounsellingScheduleModel.remove({"_id":scheduleId},function(err){
                          if(err)
                          {
                            consolse.log(err);
                          }
                          else
                           {
                            done();
                           } 

                       });
                  done();
                     
                },
                function(done) {

                  for(var i=0;i<useremailarray.length;i++) 
                       { 
                           var mailOptions = {
                                from: config.emailFromWelcome,
                                createTextFromHtml: true,
                                subject: 'Counselling Schedule Update'
                                };

                           CounsellingModel.findOne({"_id":useremailarray[i].counsellingId},function(err,items) {
                              if(err)
                              {
                                console.log(err);
                              }
                              else
                              {   
                                var counsellingdate=items.counsellingDate;
                                    counsellingdate=counsellingdate.toISOString().substr(0,10);                 
                                mailOptions.to = items.studentName.email;
                               items.status="Canceled";
                                items.save(function(err){           
                                });                           
                                var schedulelist = ['(This email is for testing purposes only)','Dear User,','Your counselling schedule from '+items.counsellingSlot+' on '+counsellingdate+' for course '+items.course.name+' has been Canceled.'];
                                schedulelist.push('(This email is for testing purposes only)');
                                mailOptions.html = schedulelist.join('<br><br>');
                                sendMail(mailOptions);
                              }

                           }).populate('studentName','').populate('course','');  
                            
                     }

                     done();
                }], function(err) {res.send(200)}); 

        }
        else
        {
           CounsellingScheduleModel.remove({"_id":scheduleId},function(err){
              if(err)
              {
                consolse.log(err);
              }
              else
               {
                 res.send(200);
               } 

           });
        }        
    },

    fetchallavailablementors: function(req, res) {
      CounsellingScheduleModel.find({"branch":req.query.branchId,"callDate":new Date(req.query.scheduledate),
        $or:[{$and:[{"start_total":{$lte:req.query.starttotal}},{"end_total":{$gte:req.query.starttotal}}]},
        {$and:[{"start_total":{$lte:req.query.endtotal}},{"end_total":{$gte:req.query.endtotal}}]},
        {$and:[{"start_total":{$gte:req.query.starttotal}},{"end_total":{$lte:req.query.endtotal}}]}]},function(err,items){
                res.send(items);
        });
    },
    updateAdminCounsellingScheduleAndUpdateCounselling: function(req, res) {
                  var scheduleslotarray=req.body.slots.scheduleslots;
                  var cutoff = new Date(req.body.callDate);
                  var modifieddate = new Date(cutoff.setHours(cutoff.getHours() + 24));
                  var str=modifieddate.toISOString().substr(0,10);
                       str=str+"T00:00:00.000Z";
                  var  str1=str.replace(/00:00:00.000/, '23:59:59.000');
                  var newmentor=req.body.newmentor;
                  var scheduleId=req.body.scheduleId;
                  var count=0;

       async.waterfall([
                 function(done) {

                   CounsellingScheduleModel.findOne({"_id":scheduleId},function(err,items){
                          if(err)
                          {
                            consolse.log(err);
                          }
                          else
                           {
                              items.mentorAssigned=newmentor;
                              items.save(function(err){
                                   if(err)
                                   {
                                     console.log(err);
                                   }
                              });
                              done();
                           } 

                       });

                },
                function(done) {

                 for(var i=0;i<scheduleslotarray.length;i++)  
                 {
                      CounsellingModel.find({$and:[
                       {"branch":req.body.branch},
                       {"counsellingSlot":scheduleslotarray[i].slotTime},
                       {"counsellingDate":{$gte: new Date(str)}},
                       {"counsellingDate":{$lte: new Date(str1)}},
                       {"mentorAssigned":req.body.mentorAssigned},
                       {"status":"Approved"}

                  ]}, function(err, items) {
                      if (err) {
                          console.log(err);
                      } else {
                         count=count+1;
                         if(items.length > 0) 
                         {
                            for(var j=0;j<items.length;j++)
                            {
                              items[j].mentorAssigned=newmentor;
                              items[j].save(function(err){
                                   if(err)
                                   {
                                     console.log(err);
                                   }
                              });   
                            }
                          }
                          if(count > scheduleslotarray.length-1) 
                         {
                          done();         
                         }       
                      }
                   });
     
                  }  
                }
            ], function(err) {res.send(200);});

    },
     mentorCounsellingScheduleList: function(req, res) {
        var mentorId=req.query.mentorId;
        var populateObj = {'branch':'','course':'','studentName':''};
            delete req.query.mentorId;
            utility.pagination(req, res, CounsellingModel, {"mentorAssigned":mentorId}, {}, populateObj, function(result) {
                if (utility.isEmpty(result.collection)) {
                    // res.send(400);
                }
                return res.json(result);
            });

     }
};
}

function sendMail(mailOptions) {
    var transport = nodemailer.createTransport(config.mailer);
    transport.sendMail(mailOptions, function(err, response) {
        if (err) return err;
        return response;
    });
};