'use strict';
/**
 * Module dependencies.
 */
require('../../../search/server/models/search.js');
require('../../../amenity/server/models/amenities.js');
require('../../../amenity/server/models/partOf.js');
require('../../../booking/server/models/booking.js');
require('../../../role/server/models/role.js');
require('../../../space_type/server/models/space_types.js');
var mongoose = require('mongoose');
var RoomsSchemaModel = mongoose.model('Rooms');
var Spaces = require('../../../space/server/models/space.js');
var SpaceModel = mongoose.model('Space');
var RoomtypeModel = mongoose.model('Roomstype');
var _ = require('lodash');
var async = require('async');
var AmenityModel = mongoose.model('Amenities');
var PartOfModel = mongoose.model('PartOf');
var ScheduleModel = mongoose.model("Schedule");
var BookingModel = mongoose.model("Booking");
var nodemailer = require('nodemailer');
var templates = require('../template');
var config = require('meanio').loadConfig();
var logger = require('../../../../core/system/server/controllers/logs.js');
var RoleModel = mongoose.model("Role");
 var notify = require('../../../notification/server/controllers/notify.js');
 var UserModel = mongoose.model('User');


function sendMail(mailOptions) {
    var transport = nodemailer.createTransport(config.mailer);
    transport.sendMail(mailOptions, function(err, response) {
        if (err) return err;
        return response;
    });
}

module.exports = function(Rooms) {
    return {
        room: function(req, res, next, id) {
            RoomsSchemaModel.load(id, function(err, room) {
                if (err) {
                    return next(err);
                }
                if (!room) {
                    return next(new Error('Failed to load roomdetails ' + id));
                }
                req.room = room;
                next();
            });
        },
         gettingAllRoomsAdmin:function(req,res){

            RoomsSchemaModel.find({}).sort({created:-1}).deepPopulate(['spaceId', 'spaceId.space_type']).populate("roomtype","").populate("createdBy","").exec(function (err, docs) {
               if (err) {
                    logger.log('error', 'GET '+req._parsedUrl.pathname+' Fetching all rooms is failed '+err+'');
                    res.send(400);
                } else {  
                    logger.log('info', 'GET '+req._parsedUrl.pathname+' Fetching all rooms is successful');  
                    res.send(docs);
                }
                     
              });

        },
        gettingroomtypename:function(req,res){
            var roomTypeId=req.query.roomTypeId;
            RoomtypeModel.findOne({"_id":roomTypeId},function(err, item) {
                if (err) {
                    res.send(400);
                } else {
                    res.send(item);
                }
            });
        },

        approveRoom:function(req,res)
        {
           var roomId=req.body.roomId;
           var status=req.body.status;
           RoomsSchemaModel.findOne({"_id":roomId},function(err,item){
                if(err)
                {
                  logger.log('error', 'PUT '+req._parsedUrl.pathname+' Failed to approve room  '+err+'');
                    res.send(400);
                }
                else
                {             
                    item.status=status;
                    item.save(function(err){
                      if(err)
                      {
                         logger.log('error', 'PUT '+req._parsedUrl.pathname+' Failed to approve room  '+err+'');
                          res.send(400);
                      }
                      else
                      {
                          logger.log('info', 'PUT '+req._parsedUrl.pathname+' Room approved successfully '); 

                          if(item.status == 'approved' && item.isAdminAdded){
                                    UserModel.findOne({
                                           _id : item.partner
                                        }, function(err, user) {
                                            notify.addNotificationURL('Approved',item.name+' room is approved.',user,'/space/room/list');
                                      });
                          }
                          else
                          {
                            UserModel.findOne({
                                           _id : item.createdBy
                                        }, function(err, user) {
                                            notify.addNotificationURL('Approved',item.name+' room is approved.',user,'/space/room/list');
                                    });
                          }

                          res.send(200);
                      }
                    });
                }

           }); 

        },
        rejectRoom:function(req,res)
        {
           var roomId=req.body.roomId;
           var status=req.body.status;
           RoomsSchemaModel.findOne({"_id":roomId},function(err,item){
                if(err)
                {
                  logger.log('error', 'PUT '+req._parsedUrl.pathname+' Failed to update room status '+err+'');
                    res.send(400);
                }
                else
                {             
                    item.status=status;
                    item.sentToAdminApproval=false;
                    item.isPublished=false;
                    item.save(function(err){
                      if(err)
                      {
                         logger.log('error', 'PUT '+req._parsedUrl.pathname+' Failed to update room status '+err+'');
                          res.send(400);
                      }
                      else
                      {          
                          if(item.status == 'pending' && item.isAdminAdded) {
                            UserModel.findOne({
                                           _id : item.createdBy
                                        }, function(err, user) {
                                            notify.addNotificationURL('Not Approved',item.name+' room is not approved. Please update details properly.',user,'/space/room/list');
                                      });
                          }
                          else
                          {
                            UserModel.findOne({
                                           _id : item.partner
                                        }, function(err, user) {
                                            notify.addNotificationURL('Not Approved',item.name+' room is not approved. Please update details properly.',user,'/space/room/list');
                                      });
                          }
                          logger.log('info', 'PUT '+req._parsedUrl.pathname+' Room status updated successfully'); 
                          res.send(200);
                      }
                    });
                }

           }); 

        },
        activateRoom:function(req,res)
        {
           var roomId=req.body._id;
           var roomsschedule = req.body.roomsslotschedule;
           var spaceholiday=req.body.spaceId.space_holiday;
               spaceholiday=_.pluck(spaceholiday,"holiday_date");
           var spacholidaylist=[];  
               for(var i=0;i<spaceholiday.length;i++){
                 spacholidaylist.push(spaceholiday[i].substr(0,11));
               }
           var location= req.body.loc;    
           var spaceId = req.body.spaceId._id;

           async.waterfall([
                 function(done){
                      RoomsSchemaModel.findOne({"_id":roomId},function(err,item){
                           if(err)
                           {
                             logger.log('error', 'PUT '+req._parsedUrl.pathname+' Failed to activate the room '+err+'');
                               res.send(400);
                           }
                           else
                           {             
                               item.isActive=true;
                               item.save(function(err){
                                 if(err)
                                 {
                                    logger.log('error', 'PUT '+req._parsedUrl.pathname+' Failed to activate the room'+err+'');
                                     res.send(400);
                                 }
                                 else
                                 {
                                     logger.log('info', 'PUT '+req._parsedUrl.pathname+' Room is activated successfully'); 
                                     done();
                                 }
                               });
                           }
                      });             
                 },
                 function(done){
                     for (var i = 0; i < 90; i++) {
                         var myday = new Date();
                         var mycurrentdate = new Date(myday.setDate(myday.getDate() + i));

                         var mydaymodified = new Date();
                         var mydaymodifiedforallday=new Date();
                         var daycount=i-1;

                         var todaydate=new Date(mydaymodified.setDate(mydaymodified.getDate() + i));
                             todaydate=todaydate.toISOString();  
                             todaydate=todaydate.substr(0,11);

                          var previousday=new Date(mydaymodifiedforallday.setDate(mydaymodifiedforallday.getDate() + daycount));
                             previousday=previousday.toISOString();  
                             previousday=previousday.substr(0,11);        

                         var checkingcurrentdayisholiday= _.contains(spacholidaylist, todaydate);

                         var mycurrentday = mycurrentdate.getDay();

                        if (mycurrentday == 0 && roomsschedule[6])
                             {
                               if (mycurrentday == 0 && !roomsschedule[6].isClosed && !checkingcurrentdayisholiday) {

                                   var checkinghours=new Date(roomsschedule[6].startTime);
                                   var checkedhour=checkinghours.getHours();                
                                     
                                   var datefromschedule=roomsschedule[6].startTime;
                                       datefromschedule=datefromschedule.substr(11,20);

                                   var datefromscheduleendtime=roomsschedule[6].endTime;
                                       datefromscheduleendtime=datefromscheduleendtime.substr(11,20); 

                                   var checkinghoursendtime=new Date(roomsschedule[6].endTime);
                                   var checkedhourendtime=checkinghoursendtime.getHours();    

                                  if(roomsschedule[6].isAllday)
                                  {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                  }

                                  if(!roomsschedule[6].isAllday && checkedhour < 6 && checkedhourendtime < 6)
                                  {
                                     var modifieddate=previousday+datefromschedule;
                                     var modifieddateenddate=previousday+datefromscheduleendtime;
                                  }

                                 if(!roomsschedule[6].isAllday && checkedhour < 6 && checkedhourendtime > 6)
                                  {
                                     var modifieddate=previousday+datefromschedule;
                                     var modifieddateenddate=todaydate+datefromscheduleendtime;
                                  }

                                  if(!roomsschedule[6].isAllday && checkedhour > 6 && checkedhourendtime > 6)
                                  {
                                   var modifieddate=todaydate+datefromschedule;
                                   var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                  }

                                   roomsschedule[6].startTime=modifieddate; 
                                   roomsschedule[6].endTime=modifieddateenddate; 

                                   var myfinalobj = {};
                                   myfinalobj.room = roomId;
                                   myfinalobj.loc = location;
                                   myfinalobj.day = "Sunday";
                                   myfinalobj.isAllday = roomsschedule[6].isAllday;
                                   myfinalobj.isClosed = roomsschedule[6].isClosed;
                                   myfinalobj.date = mycurrentdate;
                                   myfinalobj.bookings = [];
                                   var myfinalschedule = [];
                                   var startTimeDay = new Date(roomsschedule[6].startTime);
                                   var endTimeDay = new Date(roomsschedule[6].endTime);
                                   startTimeDay.setSeconds(0);
                                   startTimeDay.setMilliseconds(0);
                                   endTimeDay.setSeconds(0);
                                   endTimeDay.setMilliseconds(0);

                                   var myobj = {};
                                   myobj.startTime = startTimeDay;
                                   myobj.endTime = endTimeDay;
                                   myfinalschedule.push(myobj);
                                   myfinalobj.initialAval = myfinalschedule;
                                   myfinalobj.currentAval = myfinalschedule;
                                   myfinalobj.roomType =  req.body.roomtype;
                                   var schedulecreate = new ScheduleModel(myfinalobj);
                                   schedulecreate.save(function(err, items) {
                                       if (err) {
                                           logger.log('error', 'POST '+req._parsedUrl.pathname+' Room schedule create failed '+err+'');
                                           res.send(400);
                                       }
                                   });
                               }
                            }    

                        if (mycurrentday == 1 && roomsschedule[0])
                         {   
                             if (mycurrentday == 1 && !roomsschedule[0].isClosed && !checkingcurrentdayisholiday) {

                               var checkinghours=new Date(roomsschedule[0].startTime);
                               var checkedhour=checkinghours.getHours();

                                var datefromschedule=roomsschedule[0].startTime;
                                     datefromschedule=datefromschedule.substr(11,20);

                                 var datefromscheduleendtime=roomsschedule[0].endTime;
                                     datefromscheduleendtime=datefromscheduleendtime.substr(11,20); 

                                 var checkinghoursendtime=new Date(roomsschedule[0].endTime);
                                 var checkedhourendtime=checkinghoursendtime.getHours();    

                                  if(roomsschedule[0].isAllday)
                                  {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                  }

                                  if(!roomsschedule[0].isAllday && checkedhour < 6 && checkedhourendtime < 6)
                                  {
                                     var modifieddate=previousday+datefromschedule;
                                     var modifieddateenddate=previousday+datefromscheduleendtime;
                                  }

                                 if(!roomsschedule[0].isAllday && checkedhour < 6 && checkedhourendtime > 6)
                                  {
                                     var modifieddate=previousday+datefromschedule;
                                     var modifieddateenddate=todaydate+datefromscheduleendtime;
                                  }

                                  if(!roomsschedule[0].isAllday && checkedhour > 6 && checkedhourendtime > 6)
                                  {
                                   var modifieddate=todaydate+datefromschedule;
                                   var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                  }

                                 roomsschedule[0].startTime=modifieddate; 
                                 roomsschedule[0].endTime=modifieddateenddate; 

                                 var myfinalobj = {};
                                 myfinalobj.room = roomId;
                                 myfinalobj.loc = location;
                                 myfinalobj.day = "Monday";
                                 myfinalobj.isAllday = roomsschedule[0].isAllday;
                                 myfinalobj.isClosed = roomsschedule[0].isClosed;
                                 myfinalobj.date = mycurrentdate;
                                 myfinalobj.bookings = [];
                                 var myfinalschedule = [];
                                 var startTimeDay = new Date(roomsschedule[0].startTime);
                                 var endTimeDay = new Date(roomsschedule[0].endTime);
                                 startTimeDay.setSeconds(0);
                                 startTimeDay.setMilliseconds(0);
                                 endTimeDay.setSeconds(0);
                                 endTimeDay.setMilliseconds(0);

                                 var myobj = {};
                                 myobj.startTime = startTimeDay;
                                 myobj.endTime = endTimeDay;
                                 myfinalschedule.push(myobj);
                                 myfinalobj.initialAval = myfinalschedule;
                                 myfinalobj.currentAval = myfinalschedule;
                                 myfinalobj.roomType =  req.body.roomtype;
                                 var schedulecreate = new ScheduleModel(myfinalobj);
                                 schedulecreate.save(function(err, items) {
                                     if (err) {
                                          logger.log('error', 'POST '+req._parsedUrl.pathname+' Room schedule create failed '+err+'');
                                         res.send(400);
                                     }
                                 });
                             }
                           }
                           
                            if (mycurrentday == 2 && roomsschedule[1])
                            { 
                             if (mycurrentday == 2 && !roomsschedule[1].isClosed && !checkingcurrentdayisholiday) {

                                 var checkinghours=new Date(roomsschedule[1].startTime);
                                 var checkedhour=checkinghours.getHours();

                                 var datefromschedule=roomsschedule[1].startTime;
                                     datefromschedule=datefromschedule.substr(11,20);

                                 var datefromscheduleendtime=roomsschedule[1].endTime;
                                     datefromscheduleendtime=datefromscheduleendtime.substr(11,20); 

                                 var checkinghoursendtime=new Date(roomsschedule[1].endTime);
                                 var checkedhourendtime=checkinghoursendtime.getHours();      

                                  if(roomsschedule[1].isAllday)
                                  {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                  }

                                  if(!roomsschedule[1].isAllday && checkedhour < 6 && checkedhourendtime < 6)
                                  {
                                     var modifieddate=previousday+datefromschedule;
                                     var modifieddateenddate=previousday+datefromscheduleendtime;
                                  }

                                 if(!roomsschedule[1].isAllday && checkedhour < 6 && checkedhourendtime > 6)
                                  {
                                     var modifieddate=previousday+datefromschedule;
                                     var modifieddateenddate=todaydate+datefromscheduleendtime;
                                  }

                                  if(!roomsschedule[1].isAllday && checkedhour > 6 && checkedhourendtime > 6)
                                  {
                                   var modifieddate=todaydate+datefromschedule;
                                   var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                  }

                                 roomsschedule[1].startTime=modifieddate; 
                                 roomsschedule[1].endTime=modifieddateenddate; 


                                 var myfinalobj = {};
                                 myfinalobj.room = roomId;
                                 myfinalobj.loc = location;
                                 myfinalobj.day = "Tuesday";
                                 myfinalobj.isAllday = roomsschedule[1].isAllday;
                                 myfinalobj.isClosed = roomsschedule[1].isClosed;
                                 myfinalobj.date = mycurrentdate;
                                 myfinalobj.bookings = [];
                                 var myfinalschedule = [];
                                 var startTimeDay = new Date(roomsschedule[1].startTime);
                                 var endTimeDay = new Date(roomsschedule[1].endTime);
                                 startTimeDay.setSeconds(0);
                                 startTimeDay.setMilliseconds(0);
                                 endTimeDay.setSeconds(0);
                                 endTimeDay.setMilliseconds(0); 

                                 var myobj = {};
                                 myobj.startTime = startTimeDay;
                                 myobj.endTime = endTimeDay;
                                 myfinalschedule.push(myobj);
                                 myfinalobj.initialAval = myfinalschedule;
                                 myfinalobj.currentAval = myfinalschedule;
                                 myfinalobj.roomType =  req.body.roomtype;
                                 var schedulecreate = new ScheduleModel(myfinalobj);
                                 schedulecreate.save(function(err, items) {
                                     if (err) {
                                          logger.log('error', 'POST '+req._parsedUrl.pathname+' Room schedule create failed '+err+'');
                                         res.send(400);
                                     }
                                 });
                             }
                           }

                           if (mycurrentday == 3 && roomsschedule[2])
                            {   
                               if (mycurrentday == 3 && !roomsschedule[2].isClosed && !checkingcurrentdayisholiday) {

                                    var checkinghours=new Date(roomsschedule[2].startTime);
                                    var checkedhour=checkinghours.getHours();

                                    var datefromschedule=roomsschedule[2].startTime;
                                       datefromschedule=datefromschedule.substr(11,20);

                                   var datefromscheduleendtime=roomsschedule[2].endTime;
                                       datefromscheduleendtime=datefromscheduleendtime.substr(11,20); 

                                   var checkinghoursendtime=new Date(roomsschedule[2].endTime);
                                   var checkedhourendtime=checkinghoursendtime.getHours();    

                                    if(roomsschedule[2].isAllday)
                                  {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                  }

                                  if(!roomsschedule[2].isAllday && checkedhour < 6 && checkedhourendtime < 6)
                                  {
                                     var modifieddate=previousday+datefromschedule;
                                     var modifieddateenddate=previousday+datefromscheduleendtime;
                                  }

                                 if(!roomsschedule[2].isAllday && checkedhour < 6 && checkedhourendtime > 6)
                                  {
                                     var modifieddate=previousday+datefromschedule;
                                     var modifieddateenddate=todaydate+datefromscheduleendtime;
                                  }

                                  if(!roomsschedule[2].isAllday && checkedhour > 6 && checkedhourendtime > 6)
                                  {
                                   var modifieddate=todaydate+datefromschedule;
                                   var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                  }

                                   roomsschedule[2].startTime=modifieddate; 
                                   roomsschedule[2].endTime=modifieddateenddate; 

                                   var myfinalobj = {};
                                   myfinalobj.room = roomId;
                                   myfinalobj.loc = location;
                                   myfinalobj.day = "Wednesday";
                                   myfinalobj.isAllday = roomsschedule[2].isAllday;
                                   myfinalobj.isClosed = roomsschedule[2].isClosed;
                                   myfinalobj.date = mycurrentdate;
                                   myfinalobj.bookings = [];
                                   var myfinalschedule = [];
                                   var startTimeDay = new Date(roomsschedule[2].startTime);
                                   var endTimeDay = new Date(roomsschedule[2].endTime);
                                   startTimeDay.setSeconds(0);
                                   startTimeDay.setMilliseconds(0);
                                   endTimeDay.setSeconds(0);
                                   endTimeDay.setMilliseconds(0);  

                                   var myobj = {};
                                   myobj.startTime = startTimeDay;
                                   myobj.endTime = endTimeDay;
                                   myfinalschedule.push(myobj);
                                   myfinalobj.initialAval = myfinalschedule;
                                   myfinalobj.currentAval = myfinalschedule;
                                   myfinalobj.roomType =  req.body.roomtype;
                                   var schedulecreate = new ScheduleModel(myfinalobj);
                                   schedulecreate.save(function(err, items) {
                                       if (err) {
                                            logger.log('error', 'POST '+req._parsedUrl.pathname+' Room schedule create failed '+err+'');
                                           res.send(400);
                                       }
                                   });
                               }
                             }
                             
                         if (mycurrentday == 4 && roomsschedule[3])
                         {      
                             if (mycurrentday == 4 && !roomsschedule[3].isClosed && !checkingcurrentdayisholiday) {

                                   var checkinghours=new Date(roomsschedule[3].startTime);
                                   var checkedhour=checkinghours.getHours();

                                   var datefromschedule=roomsschedule[3].startTime;
                                     datefromschedule=datefromschedule.substr(11,20);

                                 var datefromscheduleendtime=roomsschedule[3].endTime;
                                     datefromscheduleendtime=datefromscheduleendtime.substr(11,20); 

                                  var checkinghoursendtime=new Date(roomsschedule[3].endTime);
                                   var checkedhourendtime=checkinghoursendtime.getHours();    

                                  if(roomsschedule[3].isAllday)
                                  {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                  }

                                  if(!roomsschedule[3].isAllday && checkedhour < 6 && checkedhourendtime < 6)
                                  {
                                     var modifieddate=previousday+datefromschedule;
                                     var modifieddateenddate=previousday+datefromscheduleendtime;
                                  }

                                 if(!roomsschedule[3].isAllday && checkedhour < 6 && checkedhourendtime > 6)
                                  {
                                     var modifieddate=previousday+datefromschedule;
                                     var modifieddateenddate=todaydate+datefromscheduleendtime;
                                  }

                                  if(!roomsschedule[3].isAllday && checkedhour > 6 && checkedhourendtime > 6)
                                  {
                                   var modifieddate=todaydate+datefromschedule;
                                   var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                  }

                                 roomsschedule[3].startTime=modifieddate; 
                                 roomsschedule[3].endTime=modifieddateenddate; 

                                 var myfinalobj = {};
                                 myfinalobj.room = roomId;
                                 myfinalobj.loc = location;
                                 myfinalobj.day = "Thursday";
                                 myfinalobj.isAllday = roomsschedule[3].isAllday;
                                 myfinalobj.isClosed = roomsschedule[3].isClosed;
                                 myfinalobj.date = mycurrentdate;
                                 myfinalobj.bookings = [];
                                 var myfinalschedule = [];
                                 var startTimeDay = new Date(roomsschedule[3].startTime);
                                 var endTimeDay = new Date(roomsschedule[3].endTime);
                                 startTimeDay.setSeconds(0);
                                 startTimeDay.setMilliseconds(0);
                                 endTimeDay.setSeconds(0);
                                 endTimeDay.setMilliseconds(0);

                                 var myobj = {};
                                 myobj.startTime = startTimeDay;
                                 myobj.endTime = endTimeDay;
                                 myfinalschedule.push(myobj);
                                 myfinalobj.initialAval = myfinalschedule;
                                 myfinalobj.currentAval = myfinalschedule;
                                 myfinalobj.roomType =  req.body.roomtype;
                                 var schedulecreate = new ScheduleModel(myfinalobj);
                                 schedulecreate.save(function(err, items) {
                                     if (err) {
                                          logger.log('error', 'POST '+req._parsedUrl.pathname+' Room schedule create failed '+err+'');
                                         res.send(400);
                                     }
                                 });
                             }
                          }     

                         if (mycurrentday == 5 && roomsschedule[4])
                        {  
                           if (mycurrentday == 5 && !roomsschedule[4].isClosed && !checkingcurrentdayisholiday) {

                                var checkinghours=new Date(roomsschedule[4].startTime);
                                var checkedhour=checkinghours.getHours();
                                
                                var datefromschedule=roomsschedule[4].startTime;
                                   datefromschedule=datefromschedule.substr(11,20);

                               var datefromscheduleendtime=roomsschedule[4].endTime;
                                   datefromscheduleendtime=datefromscheduleendtime.substr(11,20); 

                                var checkinghoursendtime=new Date(roomsschedule[4].endTime);
                                var checkedhourendtime=checkinghoursendtime.getHours();    

                                 if(roomsschedule[4].isAllday)
                                  {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                  }

                                  if(!roomsschedule[4].isAllday && checkedhour < 6 && checkedhourendtime < 6)
                                  {
                                     var modifieddate=previousday+datefromschedule;
                                     var modifieddateenddate=previousday+datefromscheduleendtime;
                                  }

                                 if(!roomsschedule[4].isAllday && checkedhour < 6 && checkedhourendtime > 6)
                                  {
                                     var modifieddate=previousday+datefromschedule;
                                     var modifieddateenddate=todaydate+datefromscheduleendtime;
                                  }

                                  if(!roomsschedule[4].isAllday && checkedhour > 6 && checkedhourendtime > 6)
                                  {
                                   var modifieddate=todaydate+datefromschedule;
                                   var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                  }

                               roomsschedule[4].startTime=modifieddate; 
                               roomsschedule[4].endTime=modifieddateenddate;

                               var myfinalobj = {};
                               myfinalobj.room = roomId;
                               myfinalobj.loc = location;
                               myfinalobj.day = "Friday";
                               myfinalobj.isAllday = roomsschedule[4].isAllday;
                               myfinalobj.isClosed = roomsschedule[4].isClosed;
                               myfinalobj.date = mycurrentdate;
                               myfinalobj.bookings = [];
                               var myfinalschedule = [];
                               var startTimeDay = new Date(roomsschedule[4].startTime);
                               var endTimeDay = new Date(roomsschedule[4].endTime);
                               startTimeDay.setSeconds(0);
                               startTimeDay.setMilliseconds(0);
                               endTimeDay.setSeconds(0);
                               endTimeDay.setMilliseconds(0);

                               var myobj = {};
                               myobj.startTime = startTimeDay;
                               myobj.endTime = endTimeDay;
                               myfinalschedule.push(myobj);
                               myfinalobj.initialAval = myfinalschedule;
                               myfinalobj.currentAval = myfinalschedule;
                               myfinalobj.roomType =  req.body.roomtype;
                               var schedulecreate = new ScheduleModel(myfinalobj);
                               schedulecreate.save(function(err, items) {
                                   if (err) {
                                        logger.log('error', 'POST '+req._parsedUrl.pathname+' Room schedule create failed '+err+'');
                                       res.send(400);
                                   }
                               });
                           }
                          } 


                        if (mycurrentday == 6 && roomsschedule[5])
                        {  
                             if (mycurrentday == 6 && !roomsschedule[5].isClosed && !checkingcurrentdayisholiday) {

                                 var checkinghours=new Date(roomsschedule[5].startTime);
                                 var checkedhour=checkinghours.getHours();
   
                                  var datefromschedule=roomsschedule[5].startTime;
                                     datefromschedule=datefromschedule.substr(11,20);

                                 var datefromscheduleendtime=roomsschedule[5].endTime;
                                     datefromscheduleendtime=datefromscheduleendtime.substr(11,20); 

                                 var checkinghoursendtime=new Date(roomsschedule[5].endTime);
                                var checkedhourendtime=checkinghoursendtime.getHours();    

                                 if(roomsschedule[5].isAllday)
                                  {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                  }

                                  if(!roomsschedule[5].isAllday && checkedhour < 6 && checkedhourendtime < 6)
                                  {
                                     var modifieddate=previousday+datefromschedule;
                                     var modifieddateenddate=previousday+datefromscheduleendtime;
                                  }

                                 if(!roomsschedule[5].isAllday && checkedhour < 6 && checkedhourendtime > 6)
                                  {
                                     var modifieddate=previousday+datefromschedule;
                                     var modifieddateenddate=todaydate+datefromscheduleendtime;
                                  }

                                  if(!roomsschedule[5].isAllday && checkedhour > 6 && checkedhourendtime > 6)
                                  {
                                   var modifieddate=todaydate+datefromschedule;
                                   var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                  }

                                 roomsschedule[5].startTime=modifieddate; 
                                 roomsschedule[5].endTime=modifieddateenddate;

                                 var myfinalobj = {};
                                 myfinalobj.room = roomId;
                                 myfinalobj.loc = location;
                                 myfinalobj.day = "Saturday";
                                 myfinalobj.isAllday = roomsschedule[5].isAllday;
                                 myfinalobj.isClosed = roomsschedule[5].isClosed;
                                 myfinalobj.date = mycurrentdate;
                                 myfinalobj.bookings = [];
                                 var myfinalschedule = [];
                                 var startTimeDay = new Date(roomsschedule[5].startTime);
                                 var endTimeDay = new Date(roomsschedule[5].endTime);
                                 startTimeDay.setSeconds(0);
                                 startTimeDay.setMilliseconds(0);
                                 endTimeDay.setSeconds(0);
                                 endTimeDay.setMilliseconds(0);

                                 var myobj = {};
                                 myobj.startTime = startTimeDay;
                                 myobj.endTime = endTimeDay;
                                 myfinalschedule.push(myobj);
                                 myfinalobj.initialAval = myfinalschedule;
                                 myfinalobj.currentAval = myfinalschedule;
                                 myfinalobj.roomType =  req.body.roomtype;
                                 var schedulecreate = new ScheduleModel(myfinalobj);
                                 schedulecreate.save(function(err, items) {
                                     if (err) {
                                          logger.log('error', 'POST '+req._parsedUrl.pathname+' Room schedule create failed '+err+'');
                                         res.send(400);
                                     }
                                 });
                             }
                          } 

                           
                     }
                     done();
                    
                 }
               ], function (err) {
                   res.send(200);
               });
        },
        sendToAdminApproval:function(req,res)
        {
           var roomId=req.body.roomId;
           
            RoomsSchemaModel.findOne({"_id":roomId},function(err,item){
                 if(err)
                 {
                   logger.log('error', 'PUT '+req._parsedUrl.pathname+' Failed to update room object '+err+'');
                     res.send(400);
                 }
                 else
                 {             
                     item.sentToAdminApproval=true;
                     item.save(function(err){
                       if(err)
                       {
                          logger.log('error', 'PUT '+req._parsedUrl.pathname+' Failed to update room object '+err+'');
                           res.send(400);
                       }
                       else
                       {    
                               RoleModel.findOne({"name":"Admin"},function(err,role){
                                   if(err)
                                   {
                                     logger.log('error', 'GET '+req._parsedUrl.pathname+'Checking for admin login'+err+''); 
                                   }
                                   else
                                   {
                                       UserModel.find({
                                            role : { "$in" : [role._id] }
                                         }, function(err, users) {
                                             async.each(users, function (user, callback) {
                                             notify.addNotificationURL('Approval',item.name +' room is waiting for your approval',user,'/space/admin/room/detailpage?selectedId='+req.body.roomId);
                                             callback();
                                           });
                                       });
                                   }
                                 });
                             logger.log('info', 'PUT '+req._parsedUrl.pathname+' Room details updated successfully'); 
                              res.send(200);
                       }
                     });
                 }
            }); 
        },
       publishRoom:function(req,res)
       {

          var roomId=req.body._id;
          var roomsschedule = req.body.roomsslotschedule;
          var spaceholiday=req.body.spaceId.space_holiday;
              spaceholiday=_.pluck(spaceholiday,"holiday_date");
          var spacholidaylist=[];  
              for(var i=0;i<spaceholiday.length;i++){
                spacholidaylist.push(spaceholiday[i].substr(0,11));
              }
          var location= req.body.loc;    
          var spaceId = req.body.spaceId._id;

          async.waterfall([
                function(done){
                     RoomsSchemaModel.findOne({"_id":roomId},function(err,item){
                          if(err)
                          {
                            logger.log('error', 'PUT '+req._parsedUrl.pathname+' Failed to publish the room '+err+'');
                              res.send(400);
                          }
                          else
                          {             
                              item.isPublished=true;
                              item.status="published";
                              item.save(function(err){
                                if(err)
                                {
                                   logger.log('error', 'PUT '+req._parsedUrl.pathname+' Failed to publish the room'+err+'');
                                    res.send(400);
                                }
                                else
                                {
                                    logger.log('info', 'PUT '+req._parsedUrl.pathname+' Room is published successfully'); 
                                    done();
                                }
                              });
                          }
                     });             
                },
                function(done){
                    for (var i = 0; i < 90; i++) {
                        var myday = new Date();
                        var mycurrentdate = new Date(myday.setDate(myday.getDate() + i));

                        var mydaymodified = new Date();
                        var mydaymodifiedforallday=new Date();
                        var daycount=i-1;

                        var todaydate=new Date(mydaymodified.setDate(mydaymodified.getDate() + i));
                            todaydate=todaydate.toISOString();  
                            todaydate=todaydate.substr(0,11);

                         var previousday=new Date(mydaymodifiedforallday.setDate(mydaymodifiedforallday.getDate() + daycount));
                            previousday=previousday.toISOString();  
                            previousday=previousday.substr(0,11);        

                        var checkingcurrentdayisholiday= _.contains(spacholidaylist, todaydate);

                        var mycurrentday = mycurrentdate.getDay();

                       if (mycurrentday == 0 && roomsschedule[6])
                            {
                              if (mycurrentday == 0 && !roomsschedule[6].isClosed && !checkingcurrentdayisholiday) {

                                  var checkinghours=new Date(roomsschedule[6].startTime);
                                  var checkedhour=checkinghours.getHours();                
                                    
                                  var datefromschedule=roomsschedule[6].startTime;
                                      datefromschedule=datefromschedule.substr(11,20);

                                  var datefromscheduleendtime=roomsschedule[6].endTime;
                                      datefromscheduleendtime=datefromscheduleendtime.substr(11,20); 

                                  var checkinghoursendtime=new Date(roomsschedule[6].endTime);
                                  var checkedhourendtime=checkinghoursendtime.getHours();    

                                 if(roomsschedule[6].isAllday)
                                 {
                                   var modifieddate=previousday+datefromschedule;
                                   var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                 }

                                 if(!roomsschedule[6].isAllday && checkedhour < 6 && checkedhourendtime < 6)
                                 {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=previousday+datefromscheduleendtime;
                                 }

                                if(!roomsschedule[6].isAllday && checkedhour < 6 && checkedhourendtime > 6)
                                 {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=todaydate+datefromscheduleendtime;
                                 }

                                 if(!roomsschedule[6].isAllday && checkedhour > 6 && checkedhourendtime > 6)
                                 {
                                  var modifieddate=todaydate+datefromschedule;
                                  var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                 }

                                  roomsschedule[6].startTime=modifieddate; 
                                  roomsschedule[6].endTime=modifieddateenddate; 

                                  var myfinalobj = {};
                                  myfinalobj.room = roomId;
                                  myfinalobj.loc = location;
                                  myfinalobj.day = "Sunday";
                                  myfinalobj.isAllday = roomsschedule[6].isAllday;
                                  myfinalobj.isClosed = roomsschedule[6].isClosed;
                                  myfinalobj.date = mycurrentdate;
                                  myfinalobj.bookings = [];
                                  var myfinalschedule = [];
                                  var startTimeDay = new Date(roomsschedule[6].startTime);
                                  var endTimeDay = new Date(roomsschedule[6].endTime);
                                  startTimeDay.setSeconds(0);
                                  startTimeDay.setMilliseconds(0);
                                  endTimeDay.setSeconds(0);
                                  endTimeDay.setMilliseconds(0);

                                  var myobj = {};
                                  myobj.startTime = startTimeDay;
                                  myobj.endTime = endTimeDay;
                                  myfinalschedule.push(myobj);
                                  myfinalobj.initialAval = myfinalschedule;
                                  myfinalobj.currentAval = myfinalschedule;
                                  myfinalobj.roomType =  req.body.roomtype;
                                  var schedulecreate = new ScheduleModel(myfinalobj);
                                  schedulecreate.save(function(err, items) {
                                      if (err) {
                                          logger.log('error', 'POST '+req._parsedUrl.pathname+' Room schedule create failed '+err+'');
                                          res.send(400);
                                      }
                                  });
                              }
                           }    

                       if (mycurrentday == 1 && roomsschedule[0])
                        {   
                            if (mycurrentday == 1 && !roomsschedule[0].isClosed && !checkingcurrentdayisholiday) {

                              var checkinghours=new Date(roomsschedule[0].startTime);
                              var checkedhour=checkinghours.getHours();

                               var datefromschedule=roomsschedule[0].startTime;
                                    datefromschedule=datefromschedule.substr(11,20);

                                var datefromscheduleendtime=roomsschedule[0].endTime;
                                    datefromscheduleendtime=datefromscheduleendtime.substr(11,20); 

                                var checkinghoursendtime=new Date(roomsschedule[0].endTime);
                                var checkedhourendtime=checkinghoursendtime.getHours();    

                                 if(roomsschedule[0].isAllday)
                                 {
                                   var modifieddate=previousday+datefromschedule;
                                   var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                 }

                                 if(!roomsschedule[0].isAllday && checkedhour < 6 && checkedhourendtime < 6)
                                 {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=previousday+datefromscheduleendtime;
                                 }

                                if(!roomsschedule[0].isAllday && checkedhour < 6 && checkedhourendtime > 6)
                                 {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=todaydate+datefromscheduleendtime;
                                 }

                                 if(!roomsschedule[0].isAllday && checkedhour > 6 && checkedhourendtime > 6)
                                 {
                                  var modifieddate=todaydate+datefromschedule;
                                  var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                 }

                                roomsschedule[0].startTime=modifieddate; 
                                roomsschedule[0].endTime=modifieddateenddate; 

                                var myfinalobj = {};
                                myfinalobj.room = roomId;
                                myfinalobj.loc = location;
                                myfinalobj.day = "Monday";
                                myfinalobj.isAllday = roomsschedule[0].isAllday;
                                myfinalobj.isClosed = roomsschedule[0].isClosed;
                                myfinalobj.date = mycurrentdate;
                                myfinalobj.bookings = [];
                                var myfinalschedule = [];
                                var startTimeDay = new Date(roomsschedule[0].startTime);
                                var endTimeDay = new Date(roomsschedule[0].endTime);
                                startTimeDay.setSeconds(0);
                                startTimeDay.setMilliseconds(0);
                                endTimeDay.setSeconds(0);
                                endTimeDay.setMilliseconds(0);

                                var myobj = {};
                                myobj.startTime = startTimeDay;
                                myobj.endTime = endTimeDay;
                                myfinalschedule.push(myobj);
                                myfinalobj.initialAval = myfinalschedule;
                                myfinalobj.currentAval = myfinalschedule;
                                myfinalobj.roomType =  req.body.roomtype;
                                var schedulecreate = new ScheduleModel(myfinalobj);
                                schedulecreate.save(function(err, items) {
                                    if (err) {
                                         logger.log('error', 'POST '+req._parsedUrl.pathname+' Room schedule create failed '+err+'');
                                        res.send(400);
                                    }
                                });
                            }
                          }
                          
                           if (mycurrentday == 2 && roomsschedule[1])
                           { 
                            if (mycurrentday == 2 && !roomsschedule[1].isClosed && !checkingcurrentdayisholiday) {

                                var checkinghours=new Date(roomsschedule[1].startTime);
                                var checkedhour=checkinghours.getHours();

                                var datefromschedule=roomsschedule[1].startTime;
                                    datefromschedule=datefromschedule.substr(11,20);

                                var datefromscheduleendtime=roomsschedule[1].endTime;
                                    datefromscheduleendtime=datefromscheduleendtime.substr(11,20); 

                                var checkinghoursendtime=new Date(roomsschedule[1].endTime);
                                var checkedhourendtime=checkinghoursendtime.getHours();      

                                 if(roomsschedule[1].isAllday)
                                 {
                                   var modifieddate=previousday+datefromschedule;
                                   var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                 }

                                 if(!roomsschedule[1].isAllday && checkedhour < 6 && checkedhourendtime < 6)
                                 {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=previousday+datefromscheduleendtime;
                                 }

                                if(!roomsschedule[1].isAllday && checkedhour < 6 && checkedhourendtime > 6)
                                 {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=todaydate+datefromscheduleendtime;
                                 }

                                 if(!roomsschedule[1].isAllday && checkedhour > 6 && checkedhourendtime > 6)
                                 {
                                  var modifieddate=todaydate+datefromschedule;
                                  var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                 }

                                roomsschedule[1].startTime=modifieddate; 
                                roomsschedule[1].endTime=modifieddateenddate; 


                                var myfinalobj = {};
                                myfinalobj.room = roomId;
                                myfinalobj.loc = location;
                                myfinalobj.day = "Tuesday";
                                myfinalobj.isAllday = roomsschedule[1].isAllday;
                                myfinalobj.isClosed = roomsschedule[1].isClosed;
                                myfinalobj.date = mycurrentdate;
                                myfinalobj.bookings = [];
                                var myfinalschedule = [];
                                var startTimeDay = new Date(roomsschedule[1].startTime);
                                var endTimeDay = new Date(roomsschedule[1].endTime);
                                startTimeDay.setSeconds(0);
                                startTimeDay.setMilliseconds(0);
                                endTimeDay.setSeconds(0);
                                endTimeDay.setMilliseconds(0); 

                                var myobj = {};
                                myobj.startTime = startTimeDay;
                                myobj.endTime = endTimeDay;
                                myfinalschedule.push(myobj);
                                myfinalobj.initialAval = myfinalschedule;
                                myfinalobj.currentAval = myfinalschedule;
                                myfinalobj.roomType =  req.body.roomtype;
                                var schedulecreate = new ScheduleModel(myfinalobj);
                                schedulecreate.save(function(err, items) {
                                    if (err) {
                                         logger.log('error', 'POST '+req._parsedUrl.pathname+' Room schedule create failed '+err+'');
                                        res.send(400);
                                    }
                                });
                            }
                          }

                          if (mycurrentday == 3 && roomsschedule[2])
                           {   
                              if (mycurrentday == 3 && !roomsschedule[2].isClosed && !checkingcurrentdayisholiday) {

                                   var checkinghours=new Date(roomsschedule[2].startTime);
                                   var checkedhour=checkinghours.getHours();

                                   var datefromschedule=roomsschedule[2].startTime;
                                      datefromschedule=datefromschedule.substr(11,20);

                                  var datefromscheduleendtime=roomsschedule[2].endTime;
                                      datefromscheduleendtime=datefromscheduleendtime.substr(11,20); 

                                  var checkinghoursendtime=new Date(roomsschedule[2].endTime);
                                  var checkedhourendtime=checkinghoursendtime.getHours();    

                                   if(roomsschedule[2].isAllday)
                                 {
                                   var modifieddate=previousday+datefromschedule;
                                   var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                 }

                                 if(!roomsschedule[2].isAllday && checkedhour < 6 && checkedhourendtime < 6)
                                 {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=previousday+datefromscheduleendtime;
                                 }

                                if(!roomsschedule[2].isAllday && checkedhour < 6 && checkedhourendtime > 6)
                                 {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=todaydate+datefromscheduleendtime;
                                 }

                                 if(!roomsschedule[2].isAllday && checkedhour > 6 && checkedhourendtime > 6)
                                 {
                                  var modifieddate=todaydate+datefromschedule;
                                  var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                 }

                                  roomsschedule[2].startTime=modifieddate; 
                                  roomsschedule[2].endTime=modifieddateenddate; 

                                  var myfinalobj = {};
                                  myfinalobj.room = roomId;
                                  myfinalobj.loc = location;
                                  myfinalobj.day = "Wednesday";
                                  myfinalobj.isAllday = roomsschedule[2].isAllday;
                                  myfinalobj.isClosed = roomsschedule[2].isClosed;
                                  myfinalobj.date = mycurrentdate;
                                  myfinalobj.bookings = [];
                                  var myfinalschedule = [];
                                  var startTimeDay = new Date(roomsschedule[2].startTime);
                                  var endTimeDay = new Date(roomsschedule[2].endTime);
                                  startTimeDay.setSeconds(0);
                                  startTimeDay.setMilliseconds(0);
                                  endTimeDay.setSeconds(0);
                                  endTimeDay.setMilliseconds(0);  

                                  var myobj = {};
                                  myobj.startTime = startTimeDay;
                                  myobj.endTime = endTimeDay;
                                  myfinalschedule.push(myobj);
                                  myfinalobj.initialAval = myfinalschedule;
                                  myfinalobj.currentAval = myfinalschedule;
                                  myfinalobj.roomType =  req.body.roomtype;
                                  var schedulecreate = new ScheduleModel(myfinalobj);
                                  schedulecreate.save(function(err, items) {
                                      if (err) {
                                           logger.log('error', 'POST '+req._parsedUrl.pathname+' Room schedule create failed '+err+'');
                                          res.send(400);
                                      }
                                  });
                              }
                            }
                            
                        if (mycurrentday == 4 && roomsschedule[3])
                        {      
                            if (mycurrentday == 4 && !roomsschedule[3].isClosed && !checkingcurrentdayisholiday) {

                                  var checkinghours=new Date(roomsschedule[3].startTime);
                                  var checkedhour=checkinghours.getHours();

                                  var datefromschedule=roomsschedule[3].startTime;
                                    datefromschedule=datefromschedule.substr(11,20);

                                var datefromscheduleendtime=roomsschedule[3].endTime;
                                    datefromscheduleendtime=datefromscheduleendtime.substr(11,20); 

                                 var checkinghoursendtime=new Date(roomsschedule[3].endTime);
                                  var checkedhourendtime=checkinghoursendtime.getHours();    

                                 if(roomsschedule[3].isAllday)
                                 {
                                   var modifieddate=previousday+datefromschedule;
                                   var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                 }

                                 if(!roomsschedule[3].isAllday && checkedhour < 6 && checkedhourendtime < 6)
                                 {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=previousday+datefromscheduleendtime;
                                 }

                                if(!roomsschedule[3].isAllday && checkedhour < 6 && checkedhourendtime > 6)
                                 {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=todaydate+datefromscheduleendtime;
                                 }

                                 if(!roomsschedule[3].isAllday && checkedhour > 6 && checkedhourendtime > 6)
                                 {
                                  var modifieddate=todaydate+datefromschedule;
                                  var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                 }

                                roomsschedule[3].startTime=modifieddate; 
                                roomsschedule[3].endTime=modifieddateenddate; 

                                var myfinalobj = {};
                                myfinalobj.room = roomId;
                                myfinalobj.loc = location;
                                myfinalobj.day = "Thursday";
                                myfinalobj.isAllday = roomsschedule[3].isAllday;
                                myfinalobj.isClosed = roomsschedule[3].isClosed;
                                myfinalobj.date = mycurrentdate;
                                myfinalobj.bookings = [];
                                var myfinalschedule = [];
                                var startTimeDay = new Date(roomsschedule[3].startTime);
                                var endTimeDay = new Date(roomsschedule[3].endTime);
                                startTimeDay.setSeconds(0);
                                startTimeDay.setMilliseconds(0);
                                endTimeDay.setSeconds(0);
                                endTimeDay.setMilliseconds(0);

                                var myobj = {};
                                myobj.startTime = startTimeDay;
                                myobj.endTime = endTimeDay;
                                myfinalschedule.push(myobj);
                                myfinalobj.initialAval = myfinalschedule;
                                myfinalobj.currentAval = myfinalschedule;
                                myfinalobj.roomType =  req.body.roomtype;
                                var schedulecreate = new ScheduleModel(myfinalobj);
                                schedulecreate.save(function(err, items) {
                                    if (err) {
                                         logger.log('error', 'POST '+req._parsedUrl.pathname+' Room schedule create failed '+err+'');
                                        res.send(400);
                                    }
                                });
                            }
                         }     

                        if (mycurrentday == 5 && roomsschedule[4])
                       {  
                          if (mycurrentday == 5 && !roomsschedule[4].isClosed && !checkingcurrentdayisholiday) {

                               var checkinghours=new Date(roomsschedule[4].startTime);
                               var checkedhour=checkinghours.getHours();
                               
                               var datefromschedule=roomsschedule[4].startTime;
                                  datefromschedule=datefromschedule.substr(11,20);

                              var datefromscheduleendtime=roomsschedule[4].endTime;
                                  datefromscheduleendtime=datefromscheduleendtime.substr(11,20); 

                               var checkinghoursendtime=new Date(roomsschedule[4].endTime);
                               var checkedhourendtime=checkinghoursendtime.getHours();    

                                if(roomsschedule[4].isAllday)
                                 {
                                   var modifieddate=previousday+datefromschedule;
                                   var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                 }

                                 if(!roomsschedule[4].isAllday && checkedhour < 6 && checkedhourendtime < 6)
                                 {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=previousday+datefromscheduleendtime;
                                 }

                                if(!roomsschedule[4].isAllday && checkedhour < 6 && checkedhourendtime > 6)
                                 {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=todaydate+datefromscheduleendtime;
                                 }

                                 if(!roomsschedule[4].isAllday && checkedhour > 6 && checkedhourendtime > 6)
                                 {
                                  var modifieddate=todaydate+datefromschedule;
                                  var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                 }

                              roomsschedule[4].startTime=modifieddate; 
                              roomsschedule[4].endTime=modifieddateenddate;

                              var myfinalobj = {};
                              myfinalobj.room = roomId;
                              myfinalobj.loc = location;
                              myfinalobj.day = "Friday";
                              myfinalobj.isAllday = roomsschedule[4].isAllday;
                              myfinalobj.isClosed = roomsschedule[4].isClosed;
                              myfinalobj.date = mycurrentdate;
                              myfinalobj.bookings = [];
                              var myfinalschedule = [];
                              var startTimeDay = new Date(roomsschedule[4].startTime);
                              var endTimeDay = new Date(roomsschedule[4].endTime);
                              startTimeDay.setSeconds(0);
                              startTimeDay.setMilliseconds(0);
                              endTimeDay.setSeconds(0);
                              endTimeDay.setMilliseconds(0);

                              var myobj = {};
                              myobj.startTime = startTimeDay;
                              myobj.endTime = endTimeDay;
                              myfinalschedule.push(myobj);
                              myfinalobj.initialAval = myfinalschedule;
                              myfinalobj.currentAval = myfinalschedule;
                              myfinalobj.roomType =  req.body.roomtype;
                              var schedulecreate = new ScheduleModel(myfinalobj);
                              schedulecreate.save(function(err, items) {
                                  if (err) {
                                       logger.log('error', 'POST '+req._parsedUrl.pathname+' Room schedule create failed '+err+'');
                                      res.send(400);
                                  }
                              });
                          }
                         } 


                       if (mycurrentday == 6 && roomsschedule[5])
                       {  
                            if (mycurrentday == 6 && !roomsschedule[5].isClosed && !checkingcurrentdayisholiday) {

                                var checkinghours=new Date(roomsschedule[5].startTime);
                                var checkedhour=checkinghours.getHours();
  
                                 var datefromschedule=roomsschedule[5].startTime;
                                    datefromschedule=datefromschedule.substr(11,20);

                                var datefromscheduleendtime=roomsschedule[5].endTime;
                                    datefromscheduleendtime=datefromscheduleendtime.substr(11,20); 

                                var checkinghoursendtime=new Date(roomsschedule[5].endTime);
                               var checkedhourendtime=checkinghoursendtime.getHours();    

                                if(roomsschedule[5].isAllday)
                                 {
                                   var modifieddate=previousday+datefromschedule;
                                   var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                 }

                                 if(!roomsschedule[5].isAllday && checkedhour < 6 && checkedhourendtime < 6)
                                 {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=previousday+datefromscheduleendtime;
                                 }

                                if(!roomsschedule[5].isAllday && checkedhour < 6 && checkedhourendtime > 6)
                                 {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=todaydate+datefromscheduleendtime;
                                 }

                                 if(!roomsschedule[5].isAllday && checkedhour > 6 && checkedhourendtime > 6)
                                 {
                                  var modifieddate=todaydate+datefromschedule;
                                  var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                 }

                                roomsschedule[5].startTime=modifieddate; 
                                roomsschedule[5].endTime=modifieddateenddate;

                                var myfinalobj = {};
                                myfinalobj.room = roomId;
                                myfinalobj.loc = location;
                                myfinalobj.day = "Saturday";
                                myfinalobj.isAllday = roomsschedule[5].isAllday;
                                myfinalobj.isClosed = roomsschedule[5].isClosed;
                                myfinalobj.date = mycurrentdate;
                                myfinalobj.bookings = [];
                                var myfinalschedule = [];
                                var startTimeDay = new Date(roomsschedule[5].startTime);
                                var endTimeDay = new Date(roomsschedule[5].endTime);
                                startTimeDay.setSeconds(0);
                                startTimeDay.setMilliseconds(0);
                                endTimeDay.setSeconds(0);
                                endTimeDay.setMilliseconds(0);

                                var myobj = {};
                                myobj.startTime = startTimeDay;
                                myobj.endTime = endTimeDay;
                                myfinalschedule.push(myobj);
                                myfinalobj.initialAval = myfinalschedule;
                                myfinalobj.currentAval = myfinalschedule;
                                myfinalobj.roomType =  req.body.roomtype;
                                var schedulecreate = new ScheduleModel(myfinalobj);
                                schedulecreate.save(function(err, items) {
                                    if (err) {
                                         logger.log('error', 'POST '+req._parsedUrl.pathname+' Room schedule create failed '+err+'');
                                        res.send(400);
                                    }
                                });
                            }
                         } 

                          
                    }
                    done();
                   
                }
              ], function (err) {
                  res.send(200);
              });
                        
       },
        addroomtype: function(req, res) {
            var roomtypecreate = new RoomtypeModel(req.body);
            roomtypecreate.save(function(err, items) {
                if (err) {
                    res.send(400);
                } else {
                    res.send(200);
                }
            });
        },
        loadroomtypes: function(req, res) {
            RoomtypeModel.find({}, function(err, items) {
                if (err) {
                    res.send(400);
                } else {
                    res.send(items);
                }
            });
        },
        checkingForAdminLogin:function(req,res){
             RoleModel.findOne({"name":"Admin"},function(err,item){
              if(err)
              {
                logger.log('error', 'GET '+req._parsedUrl.pathname+'Checking for admin login'+err+''); 
              }
              else
              {
                  res.send(item);
              }
             });

        },
        createroom: function(req, res) {

            var roomcreate = new RoomsSchemaModel(req.body);
            var roomsschedule = req.body.roomsslotschedule;
            var spaceholiday=req.body.space_holiday;
                spaceholiday=_.pluck(spaceholiday,"holiday_date");
            var spacholidaylist=[];  
              for(var i=0;i<spaceholiday.length;i++){
                spacholidaylist.push(spaceholiday[i].substr(0,11));
              }
            var spaceId = req.body.spaceId;

            async.waterfall([
                function(done) {
                    req.assert('name', 'Please enter room name').notEmpty();
                    req.assert('pricePerhour', 'Please enter price per hour').notEmpty();
                    req.assert('pricePerhalfday', 'Please enter price per halfday').notEmpty();
                    req.assert('pricePerfullday', 'Please enter price per day').notEmpty();
                    req.assert('description', 'Pleas enter room description').notEmpty();
                    var errors = req.validationErrors();
                    if (errors) {
                        return res.status(400).send(errors);
                    } else {
                        done();
                    }
                },
                function(done) {
                    roomcreate.save(function(err, items) {
                        if (err) {
                            logger.log('error', 'POST '+req._parsedUrl.pathname+' Room create failed'+err+'');         
                            return res.send(400);
                        } else {
                            logger.log('info', 'POST '+req._parsedUrl.pathname+' Room created success');
                            done(null, items._id, items.loc);
                        }
                    });
                },
                function(roomId, location, done) {
                    SpaceModel.findOne({
                        "_id": spaceId
                    }, function(err, spaceitem) {
                        if (err) {
                            res.send(400);
                        } else {
                            spaceitem.rooms.push({
                                "roomId": roomId,
                                "status": "active"
                            });
                            spaceitem.save(function(err, item) {
                                if (err) {
                                    res.send(400);
                                } else {
                                    done();
                                }
                            });
                        }
                    });
                }

            ], function(err) {
                res.send(200);
            });
        },
        getAllRooms: function(req, res) {

             RoomsSchemaModel.find({$or:[{"createdBy":req.user._id},{"partner":req.user._id}]}).sort({created:-1}).deepPopulate(['spaceId', 'spaceId.space_type']).populate("roomtype","").populate("createdBy","").exec(function (err, docs) {
               if (err) {
                    logger.log('error', 'GET '+req._parsedUrl.pathname+' Fetching all rooms is failed '+err+'');
                    res.send(400);
                } else {  
                    logger.log('info', 'GET '+req._parsedUrl.pathname+' Fetching all rooms is successful');  
                    res.send(docs);
                }
                     
              });
        },
        deactivateroom: function(req, res) {
            var deleteroom = req.room;
            var roomdeleteId = req.room._id;
            var spaceId = req.room.spaceId._id;
            async.waterfall([
              function(done){
                BookingModel.find({"room":roomdeleteId},function(err,items){
                    if(err)
                    {
                      logger.log('error', 'DELETE '+req._parsedUrl.pathname+' Failed to delete a room '+err+'');
                      res.send(400);
                    }
                    else
                    {
                      done(null,items);
                    }


                });

              },
              function(bookedarray,done){

                if(bookedarray.length > 0)
                {
                   logger.log('info', 'DELETE '+req._parsedUrl.pathname+' Already bookings is their for this room');
                   res.send({
                            "isbooking": true,
                            "bookedarray": bookedarray
                        });
                }
                else
                {
                   logger.log('info', 'DELETE '+req._parsedUrl.pathname+' No bookings is their for this room');
                   done();
                }

              },
                function(done) {
                    RoomsSchemaModel.findOne({"_id":roomdeleteId},function(err, deactivatedroom) {
                        if (err) {
                            logger.log('error', 'DELETE '+req._parsedUrl.pathname+' Failed to load a room '+err+'');
                            return res.status(500).json({
                                error: 'Cannot load the room'
                            });
                        } else {

                            deactivatedroom.isActive=false;
                            deactivatedroom.save(function(err){
                                if(err)
                                {
                                   logger.log('error', 'DELETE '+req._parsedUrl.pathname+' Failed to deactivate a room '+err+'');
                                   res.send(400);
                                }
                                else
                                {
                                  logger.log('info', 'DELETE '+req._parsedUrl.pathname+' Room deactivated sucessfully');
                                   done();
                                }

                            });
                            
                        }
                    });
                },
                function(done)
                {
                  ScheduleModel.remove({"room":roomdeleteId},function(err){
                         if(err)
                         {
                           logger.log('info', 'DELETE '+req._parsedUrl.pathname+' Failed to delete the schedule');
                           res.send(400);
                         }
                         else
                         {
                          logger.log('info', 'DELETE '+req._parsedUrl.pathname+' Schedule deleted sucessfully');
                          done();
                         }

                  });
                },
                function(done) {
                    SpaceModel.findOne({
                        "_id": spaceId
                    }, function(err, spaceitem) {
                        if (err) {
                            res.send(400);
                        } else {
                            for (var i = 0; i < spaceitem.rooms.length; i++) {
                                var roomdeleteIdinspace = spaceitem.rooms[i].roomId;
                                if (roomdeleteIdinspace.toString() == roomdeleteId.toString()) {
                                    spaceitem.rooms[i].status = "inactive";
                                    spaceitem.save(function(err, items) {
                                        if (err) {
                                            res.send(400);
                                        }
                                    });
                                }
                            }
                            done();
                        }
                    });
                }
            ], function(err) {
                res.send(200);
            });
        },
        singleRoomDetail: function(req, res) {
            var roomdetail = req.room; 
            res.send(roomdetail);
        },
        saveEditedRoomDetail: function(req, res) {
            var roomdetail = req.room;        
            var roomslotschedulebefore = req.room.roomsslotschedule;
            var roomslotscheduleafter = req.body.roomsslotschedule;

            var roomId=req.body._id;
            var published=req.body.isPublished;
            var isActive=req.body.isActive;
            console.log(isActive);
            var roomsschedule = req.body.roomsslotschedule;
            var spaceholiday=req.body.spaceId.space_holiday;
              spaceholiday=_.pluck(spaceholiday,"holiday_date");
            var spacholidaylist=[];  
              for(var i=0;i<spaceholiday.length;i++){
                spacholidaylist.push(spaceholiday[i].substr(0,11));
              }
           var location= req.body.loc;    
           var spaceId = req.body.spaceId._id;

            var present = [];
            var bookingarray = [];
            roomdetail = _.extend(roomdetail, req.body);
            req.assert('name', 'Please enter room name').notEmpty();
            req.assert('pricePerhour', 'Please enter price per hour').notEmpty();
            req.assert('pricePerhalfday', 'Please enter price per halfday').notEmpty();
            req.assert('pricePerfullday', 'Please enter price per day').notEmpty();
            req.assert('description', 'Pleas enter room description').notEmpty();
            async.waterfall([
                function(done) {
                    var errors = req.validationErrors();
                    if (errors) {
                        return res.status(400).send(errors);
                    } else {
                        done();
                    }
                },
                function(done) {
                    for (var i = 0; i < roomslotscheduleafter.length; i++) {
                        if (new Date(roomslotschedulebefore[i].startTime).getTime() != new Date(roomslotscheduleafter[i].startTime).getTime() || new Date(roomslotschedulebefore[i].endTime).getTime() != new Date(roomslotscheduleafter[i].endTime).getTime()) {
                            present.push(roomslotscheduleafter[i]);
                        }
                    }
                    done();
                },
                function(done) {
                    async.each(present, function(roomslotobject, callback) {
                        BookingModel.find({
                            'day': roomslotobject.day,
                            "room": req.body._id,
                            $or: [{
                                "bookingStartTimeNumber": {
                                    $lt: new Date(roomslotobject.startTime).getTime()
                                }
                            }, {
                                "bookingEndTimeNumber": {
                                    $gt: new Date(roomslotobject.endTime).getTime()
                                }
                            }]
                        }, function(err, docs) {
                            if (err) {
                                res.send(400);
                                callback();
                            } else {
                                async.each(docs, function(bookingdoc, callbackbooking) {
                                    bookingarray.push(bookingdoc);
                                    callbackbooking();
                                }, function(err) {
                                    callback();
                                });
                            }
                        });
                    }, function(err) {
                        done();
                    });
                },
                function(done) {
                    if (bookingarray.length > 0) {
                        logger.log('error', 'PUT '+req._parsedUrl.pathname+' Failed to update room details '+err+'');
                        res.send({
                            "isbooking": true,
                            "bookedarray": bookingarray,
                            "changedschedulearray": present
                        });
                    } else {
                        done();
                    }
                },
                function(done) {
                    roomdetail.save(function(err, items) {
                        if (err) {
                            logger.log('error', 'PUT '+req._parsedUrl.pathname+' Failed to update room details '+err+'');
                            res.send(err);
                        } else {
                            logger.log('info', 'PUT '+req._parsedUrl.pathname+' Room details updated sucessfully');              
                            done();
                        }
                    });
                },    
                function(done)
                {
                  if(present.length == 0)
                  {
                    logger.log('info', 'PUT '+req._parsedUrl.pathname+' schedule field not edited'); 
                    res.send({                         
                             "isbooking": false
                          });
                  }
                  else if(!published)
                  {
                    logger.log('info', 'PUT '+req._parsedUrl.pathname+' room is not published yet so schedule not created'); 
                    res.send({                         
                             "isbooking": false
                          });
                  }
                  else if(!isActive)
                  {
                     logger.log('info', 'PUT '+req._parsedUrl.pathname+' room is not in active so schedule not created'); 
                    res.send({                         
                             "isbooking": false
                          });
                  }
                  else
                  {

                    ScheduleModel.remove({"room":roomId},function(err, deletedroom) {
                        if (err) {
                            logger.log('error', 'PUT '+req._parsedUrl.pathname+' Failed to delete a schedule '+err+'');
                            return res.status(500).json({
                                error: 'Cannot delete the schedule'
                            });
                        } else {
                            logger.log('info', 'PUT '+req._parsedUrl.pathname+' schedule deleted sucessfully');        
                            done();
                        }
                    });

                  }

                },
                function(done)
                {

                   for (var i = 0; i < 90; i++) {
                        var myday = new Date();
                        var mycurrentdate = new Date(myday.setDate(myday.getDate() + i));

                        var mydaymodified = new Date();
                        var mydaymodifiedforallday=new Date();
                        var daycount=i-1;
           

                        var todaydate=new Date(mydaymodified.setDate(mydaymodified.getDate() + i));
                            todaydate=todaydate.toISOString();  
                            todaydate=todaydate.substr(0,11);

                        var previousday=new Date(mydaymodifiedforallday.setDate(mydaymodifiedforallday.getDate() + daycount));
                            previousday=previousday.toISOString();  
                            previousday=previousday.substr(0,11);    

                        var checkingcurrentdayisholiday= _.contains(spacholidaylist, todaydate);

                        var mycurrentday = mycurrentdate.getDay();

                       if (mycurrentday == 0 && roomsschedule[6])
                            {
                              if (mycurrentday == 0 && !roomsschedule[6].isClosed && !checkingcurrentdayisholiday) {

                                  var checkinghours=new Date(roomsschedule[6].startTime);
                                  var checkedhour=checkinghours.getHours();                
                                    
                                  var datefromschedule=roomsschedule[6].startTime;
                                      datefromschedule=datefromschedule.substr(11,20);

                                  var datefromscheduleendtime=roomsschedule[6].endTime;
                                      datefromscheduleendtime=datefromscheduleendtime.substr(11,20); 

                                  var checkinghoursendtime=new Date(roomsschedule[6].endTime);
                                  var checkedhourendtime=checkinghoursendtime.getHours();    

                                 if(roomsschedule[6].isAllday)
                                 {
                                   var modifieddate=previousday+datefromschedule;
                                   var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                 }

                                 if(!roomsschedule[6].isAllday && checkedhour < 6 && checkedhourendtime < 6)
                                 {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=previousday+datefromscheduleendtime;
                                 }

                                if(!roomsschedule[6].isAllday && checkedhour < 6 && checkedhourendtime > 6)
                                 {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=todaydate+datefromscheduleendtime;
                                 }

                                 if(!roomsschedule[6].isAllday && checkedhour > 6 && checkedhourendtime > 6)
                                 {
                                  var modifieddate=todaydate+datefromschedule;
                                  var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                 }

                                  roomsschedule[6].startTime=modifieddate; 
                                  roomsschedule[6].endTime=modifieddateenddate; 

                                  var myfinalobj = {};
                                  myfinalobj.room = roomId;
                                  myfinalobj.loc = location;
                                  myfinalobj.day = "Sunday";
                                  myfinalobj.isAllday = roomsschedule[6].isAllday;
                                  myfinalobj.isClosed = roomsschedule[6].isClosed;
                                  myfinalobj.date = mycurrentdate;
                                  myfinalobj.bookings = [];
                                  var myfinalschedule = [];
                                  var startTimeDay = new Date(roomsschedule[6].startTime);
                                  var endTimeDay = new Date(roomsschedule[6].endTime);
                                  startTimeDay.setSeconds(0);
                                  startTimeDay.setMilliseconds(0);
                                  endTimeDay.setSeconds(0);
                                  endTimeDay.setMilliseconds(0);

                                  var myobj = {};
                                  myobj.startTime = startTimeDay;
                                  myobj.endTime = endTimeDay;
                                  myfinalschedule.push(myobj);
                                  myfinalobj.initialAval = myfinalschedule;
                                  myfinalobj.currentAval = myfinalschedule;
                                  myfinalobj.roomType =  req.body.roomtype;
                                  var schedulecreate = new ScheduleModel(myfinalobj);
                                  schedulecreate.save(function(err, items) {
                                      if (err) {
                                          logger.log('error', 'POST '+req._parsedUrl.pathname+' Room schedule create failed '+err+'');
                                          res.send(400);
                                      }
                                  });
                              }
                           }   

                        if (mycurrentday == 1 && roomsschedule[0])
                        {   
                            if (mycurrentday == 1 && !roomsschedule[0].isClosed && !checkingcurrentdayisholiday) {

                              var checkinghours=new Date(roomsschedule[0].startTime);
                              var checkedhour=checkinghours.getHours();

                               var datefromschedule=roomsschedule[0].startTime;
                                    datefromschedule=datefromschedule.substr(11,20);

                                var datefromscheduleendtime=roomsschedule[0].endTime;
                                    datefromscheduleendtime=datefromscheduleendtime.substr(11,20); 

                                var checkinghoursendtime=new Date(roomsschedule[0].endTime);
                                var checkedhourendtime=checkinghoursendtime.getHours();    

                                 if(roomsschedule[0].isAllday)
                                 {
                                   var modifieddate=previousday+datefromschedule;
                                   var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                 }

                                 if(!roomsschedule[0].isAllday && checkedhour < 6 && checkedhourendtime < 6)
                                 {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=previousday+datefromscheduleendtime;
                                 }

                                if(!roomsschedule[0].isAllday && checkedhour < 6 && checkedhourendtime > 6)
                                 {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=todaydate+datefromscheduleendtime;
                                 }

                                 if(!roomsschedule[0].isAllday && checkedhour > 6 && checkedhourendtime > 6)
                                 {
                                  var modifieddate=todaydate+datefromschedule;
                                  var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                 }

                                roomsschedule[0].startTime=modifieddate; 
                                roomsschedule[0].endTime=modifieddateenddate; 

                                var myfinalobj = {};
                                myfinalobj.room = roomId;
                                myfinalobj.loc = location;
                                myfinalobj.day = "Monday";
                                myfinalobj.isAllday = roomsschedule[0].isAllday;
                                myfinalobj.isClosed = roomsschedule[0].isClosed;
                                myfinalobj.date = mycurrentdate;
                                myfinalobj.bookings = [];
                                var myfinalschedule = [];
                                var startTimeDay = new Date(roomsschedule[0].startTime);
                                var endTimeDay = new Date(roomsschedule[0].endTime);
                                startTimeDay.setSeconds(0);
                                startTimeDay.setMilliseconds(0);
                                endTimeDay.setSeconds(0);
                                endTimeDay.setMilliseconds(0);

                                var myobj = {};
                                myobj.startTime = startTimeDay;
                                myobj.endTime = endTimeDay;
                                myfinalschedule.push(myobj);
                                myfinalobj.initialAval = myfinalschedule;
                                myfinalobj.currentAval = myfinalschedule;
                                myfinalobj.roomType =  req.body.roomtype;
                                var schedulecreate = new ScheduleModel(myfinalobj);
                                schedulecreate.save(function(err, items) {
                                    if (err) {
                                         logger.log('error', 'POST '+req._parsedUrl.pathname+' Room schedule create failed '+err+'');
                                        res.send(400);
                                    }
                                });
                            }
                          }
                          
                           if (mycurrentday == 2 && roomsschedule[1])
                           { 
                            if (mycurrentday == 2 && !roomsschedule[1].isClosed && !checkingcurrentdayisholiday) {

                                var checkinghours=new Date(roomsschedule[1].startTime);
                                var checkedhour=checkinghours.getHours();

                                var datefromschedule=roomsschedule[1].startTime;
                                    datefromschedule=datefromschedule.substr(11,20);

                                var datefromscheduleendtime=roomsschedule[1].endTime;
                                    datefromscheduleendtime=datefromscheduleendtime.substr(11,20); 

                                var checkinghoursendtime=new Date(roomsschedule[1].endTime);
                                var checkedhourendtime=checkinghoursendtime.getHours();      

                                 if(roomsschedule[1].isAllday)
                                 {
                                   var modifieddate=previousday+datefromschedule;
                                   var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                 }

                                 if(!roomsschedule[1].isAllday && checkedhour < 6 && checkedhourendtime < 6)
                                 {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=previousday+datefromscheduleendtime;
                                 }

                                if(!roomsschedule[1].isAllday && checkedhour < 6 && checkedhourendtime > 6)
                                 {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=todaydate+datefromscheduleendtime;
                                 }

                                 if(!roomsschedule[1].isAllday && checkedhour > 6 && checkedhourendtime > 6)
                                 {
                                  var modifieddate=todaydate+datefromschedule;
                                  var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                 }

                                roomsschedule[1].startTime=modifieddate; 
                                roomsschedule[1].endTime=modifieddateenddate; 


                                var myfinalobj = {};
                                myfinalobj.room = roomId;
                                myfinalobj.loc = location;
                                myfinalobj.day = "Tuesday";
                                myfinalobj.isAllday = roomsschedule[1].isAllday;
                                myfinalobj.isClosed = roomsschedule[1].isClosed;
                                myfinalobj.date = mycurrentdate;
                                myfinalobj.bookings = [];
                                var myfinalschedule = [];
                                var startTimeDay = new Date(roomsschedule[1].startTime);
                                var endTimeDay = new Date(roomsschedule[1].endTime);
                                startTimeDay.setSeconds(0);
                                startTimeDay.setMilliseconds(0);
                                endTimeDay.setSeconds(0);
                                endTimeDay.setMilliseconds(0); 

                                var myobj = {};
                                myobj.startTime = startTimeDay;
                                myobj.endTime = endTimeDay;
                                myfinalschedule.push(myobj);
                                myfinalobj.initialAval = myfinalschedule;
                                myfinalobj.currentAval = myfinalschedule;
                                myfinalobj.roomType =  req.body.roomtype;
                                var schedulecreate = new ScheduleModel(myfinalobj);
                                schedulecreate.save(function(err, items) {
                                    if (err) {
                                         logger.log('error', 'POST '+req._parsedUrl.pathname+' Room schedule create failed '+err+'');
                                        res.send(400);
                                    }
                                });
                            }
                          }

                          if (mycurrentday == 3 && roomsschedule[2])
                           {   
                              if (mycurrentday == 3 && !roomsschedule[2].isClosed && !checkingcurrentdayisholiday) {

                                   var checkinghours=new Date(roomsschedule[2].startTime);
                                   var checkedhour=checkinghours.getHours();

                                   var datefromschedule=roomsschedule[2].startTime;
                                      datefromschedule=datefromschedule.substr(11,20);

                                  var datefromscheduleendtime=roomsschedule[2].endTime;
                                      datefromscheduleendtime=datefromscheduleendtime.substr(11,20); 

                                  var checkinghoursendtime=new Date(roomsschedule[2].endTime);
                                  var checkedhourendtime=checkinghoursendtime.getHours();    

                                   if(roomsschedule[2].isAllday)
                                 {
                                   var modifieddate=previousday+datefromschedule;
                                   var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                 }

                                 if(!roomsschedule[2].isAllday && checkedhour < 6 && checkedhourendtime < 6)
                                 {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=previousday+datefromscheduleendtime;
                                 }

                                if(!roomsschedule[2].isAllday && checkedhour < 6 && checkedhourendtime > 6)
                                 {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=todaydate+datefromscheduleendtime;
                                 }

                                 if(!roomsschedule[2].isAllday && checkedhour > 6 && checkedhourendtime > 6)
                                 {
                                  var modifieddate=todaydate+datefromschedule;
                                  var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                 }

                                  roomsschedule[2].startTime=modifieddate; 
                                  roomsschedule[2].endTime=modifieddateenddate; 

                                  var myfinalobj = {};
                                  myfinalobj.room = roomId;
                                  myfinalobj.loc = location;
                                  myfinalobj.day = "Wednesday";
                                  myfinalobj.isAllday = roomsschedule[2].isAllday;
                                  myfinalobj.isClosed = roomsschedule[2].isClosed;
                                  myfinalobj.date = mycurrentdate;
                                  myfinalobj.bookings = [];
                                  var myfinalschedule = [];
                                  var startTimeDay = new Date(roomsschedule[2].startTime);
                                  var endTimeDay = new Date(roomsschedule[2].endTime);
                                  startTimeDay.setSeconds(0);
                                  startTimeDay.setMilliseconds(0);
                                  endTimeDay.setSeconds(0);
                                  endTimeDay.setMilliseconds(0);  

                                  var myobj = {};
                                  myobj.startTime = startTimeDay;
                                  myobj.endTime = endTimeDay;
                                  myfinalschedule.push(myobj);
                                  myfinalobj.initialAval = myfinalschedule;
                                  myfinalobj.currentAval = myfinalschedule;
                                  myfinalobj.roomType =  req.body.roomtype;
                                  var schedulecreate = new ScheduleModel(myfinalobj);
                                  schedulecreate.save(function(err, items) {
                                      if (err) {
                                           logger.log('error', 'POST '+req._parsedUrl.pathname+' Room schedule create failed '+err+'');
                                          res.send(400);
                                      }
                                  });
                              }
                            }
                            
                        if (mycurrentday == 4 && roomsschedule[3])
                        {      
                            if (mycurrentday == 4 && !roomsschedule[3].isClosed && !checkingcurrentdayisholiday) {

                                  var checkinghours=new Date(roomsschedule[3].startTime);
                                  var checkedhour=checkinghours.getHours();

                                  var datefromschedule=roomsschedule[3].startTime;
                                    datefromschedule=datefromschedule.substr(11,20);

                                var datefromscheduleendtime=roomsschedule[3].endTime;
                                    datefromscheduleendtime=datefromscheduleendtime.substr(11,20); 

                                 var checkinghoursendtime=new Date(roomsschedule[3].endTime);
                                  var checkedhourendtime=checkinghoursendtime.getHours();    

                                 if(roomsschedule[3].isAllday)
                                 {
                                   var modifieddate=previousday+datefromschedule;
                                   var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                 }

                                 if(!roomsschedule[3].isAllday && checkedhour < 6 && checkedhourendtime < 6)
                                 {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=previousday+datefromscheduleendtime;
                                 }

                                if(!roomsschedule[3].isAllday && checkedhour < 6 && checkedhourendtime > 6)
                                 {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=todaydate+datefromscheduleendtime;
                                 }

                                 if(!roomsschedule[3].isAllday && checkedhour > 6 && checkedhourendtime > 6)
                                 {
                                  var modifieddate=todaydate+datefromschedule;
                                  var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                 }

                                roomsschedule[3].startTime=modifieddate; 
                                roomsschedule[3].endTime=modifieddateenddate; 

                                var myfinalobj = {};
                                myfinalobj.room = roomId;
                                myfinalobj.loc = location;
                                myfinalobj.day = "Thursday";
                                myfinalobj.isAllday = roomsschedule[3].isAllday;
                                myfinalobj.isClosed = roomsschedule[3].isClosed;
                                myfinalobj.date = mycurrentdate;
                                myfinalobj.bookings = [];
                                var myfinalschedule = [];
                                var startTimeDay = new Date(roomsschedule[3].startTime);
                                var endTimeDay = new Date(roomsschedule[3].endTime);
                                startTimeDay.setSeconds(0);
                                startTimeDay.setMilliseconds(0);
                                endTimeDay.setSeconds(0);
                                endTimeDay.setMilliseconds(0);

                                var myobj = {};
                                myobj.startTime = startTimeDay;
                                myobj.endTime = endTimeDay;
                                myfinalschedule.push(myobj);
                                myfinalobj.initialAval = myfinalschedule;
                                myfinalobj.currentAval = myfinalschedule;
                                myfinalobj.roomType =  req.body.roomtype;
                                var schedulecreate = new ScheduleModel(myfinalobj);
                                schedulecreate.save(function(err, items) {
                                    if (err) {
                                         logger.log('error', 'POST '+req._parsedUrl.pathname+' Room schedule create failed '+err+'');
                                        res.send(400);
                                    }
                                });
                            }
                         }   

                       if (mycurrentday == 5 && roomsschedule[4])
                       {  
                          if (mycurrentday == 5 && !roomsschedule[4].isClosed && !checkingcurrentdayisholiday) {

                               var checkinghours=new Date(roomsschedule[4].startTime);
                               var checkedhour=checkinghours.getHours();
                               
                               var datefromschedule=roomsschedule[4].startTime;
                                  datefromschedule=datefromschedule.substr(11,20);

                              var datefromscheduleendtime=roomsschedule[4].endTime;
                                  datefromscheduleendtime=datefromscheduleendtime.substr(11,20); 

                               var checkinghoursendtime=new Date(roomsschedule[4].endTime);
                               var checkedhourendtime=checkinghoursendtime.getHours();    

                                if(roomsschedule[4].isAllday)
                                 {
                                   var modifieddate=previousday+datefromschedule;
                                   var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                 }

                                 if(!roomsschedule[4].isAllday && checkedhour < 6 && checkedhourendtime < 6)
                                 {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=previousday+datefromscheduleendtime;
                                 }

                                if(!roomsschedule[4].isAllday && checkedhour < 6 && checkedhourendtime > 6)
                                 {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=todaydate+datefromscheduleendtime;
                                 }

                                 if(!roomsschedule[4].isAllday && checkedhour > 6 && checkedhourendtime > 6)
                                 {
                                  var modifieddate=todaydate+datefromschedule;
                                  var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                 }

                              roomsschedule[4].startTime=modifieddate; 
                              roomsschedule[4].endTime=modifieddateenddate;

                              var myfinalobj = {};
                              myfinalobj.room = roomId;
                              myfinalobj.loc = location;
                              myfinalobj.day = "Friday";
                              myfinalobj.isAllday = roomsschedule[4].isAllday;
                              myfinalobj.isClosed = roomsschedule[4].isClosed;
                              myfinalobj.date = mycurrentdate;
                              myfinalobj.bookings = [];
                              var myfinalschedule = [];
                              var startTimeDay = new Date(roomsschedule[4].startTime);
                              var endTimeDay = new Date(roomsschedule[4].endTime);
                              startTimeDay.setSeconds(0);
                              startTimeDay.setMilliseconds(0);
                              endTimeDay.setSeconds(0);
                              endTimeDay.setMilliseconds(0);

                              var myobj = {};
                              myobj.startTime = startTimeDay;
                              myobj.endTime = endTimeDay;
                              myfinalschedule.push(myobj);
                              myfinalobj.initialAval = myfinalschedule;
                              myfinalobj.currentAval = myfinalschedule;
                              myfinalobj.roomType =  req.body.roomtype;
                              var schedulecreate = new ScheduleModel(myfinalobj);
                              schedulecreate.save(function(err, items) {
                                  if (err) {
                                       logger.log('error', 'POST '+req._parsedUrl.pathname+' Room schedule create failed '+err+'');
                                      res.send(400);
                                  }
                              });
                          }
                         } 

                       if (mycurrentday == 6 && roomsschedule[5])
                       {  
                            if (mycurrentday == 6 && !roomsschedule[5].isClosed && !checkingcurrentdayisholiday) {

                                var checkinghours=new Date(roomsschedule[5].startTime);
                                var checkedhour=checkinghours.getHours();
  
                                 var datefromschedule=roomsschedule[5].startTime;
                                    datefromschedule=datefromschedule.substr(11,20);

                                var datefromscheduleendtime=roomsschedule[5].endTime;
                                    datefromscheduleendtime=datefromscheduleendtime.substr(11,20); 

                                var checkinghoursendtime=new Date(roomsschedule[5].endTime);
                               var checkedhourendtime=checkinghoursendtime.getHours();    

                                if(roomsschedule[5].isAllday)
                                 {
                                   var modifieddate=previousday+datefromschedule;
                                   var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                 }

                                 if(!roomsschedule[5].isAllday && checkedhour < 6 && checkedhourendtime < 6)
                                 {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=previousday+datefromscheduleendtime;
                                 }

                                if(!roomsschedule[5].isAllday && checkedhour < 6 && checkedhourendtime > 6)
                                 {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=todaydate+datefromscheduleendtime;
                                 }

                                 if(!roomsschedule[5].isAllday && checkedhour > 6 && checkedhourendtime > 6)
                                 {
                                  var modifieddate=todaydate+datefromschedule;
                                  var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                 }

                                roomsschedule[5].startTime=modifieddate; 
                                roomsschedule[5].endTime=modifieddateenddate;

                                var myfinalobj = {};
                                myfinalobj.room = roomId;
                                myfinalobj.loc = location;
                                myfinalobj.day = "Saturday";
                                myfinalobj.isAllday = roomsschedule[5].isAllday;
                                myfinalobj.isClosed = roomsschedule[5].isClosed;
                                myfinalobj.date = mycurrentdate;
                                myfinalobj.bookings = [];
                                var myfinalschedule = [];
                                var startTimeDay = new Date(roomsschedule[5].startTime);
                                var endTimeDay = new Date(roomsschedule[5].endTime);
                                startTimeDay.setSeconds(0);
                                startTimeDay.setMilliseconds(0);
                                endTimeDay.setSeconds(0);
                                endTimeDay.setMilliseconds(0);

                                var myobj = {};
                                myobj.startTime = startTimeDay;
                                myobj.endTime = endTimeDay;
                                myfinalschedule.push(myobj);
                                myfinalobj.initialAval = myfinalschedule;
                                myfinalobj.currentAval = myfinalschedule;
                                myfinalobj.roomType =  req.body.roomtype;
                                var schedulecreate = new ScheduleModel(myfinalobj);
                                schedulecreate.save(function(err, items) {
                                    if (err) {
                                         logger.log('error', 'POST '+req._parsedUrl.pathname+' Room schedule create failed '+err+'');
                                        res.send(400);
                                    }
                                });
                            }
                         }   
                    }
                    done();
                    res.send({
                         "isbooking": false
                       });
                }

            ], function(err) {});
        },
        getAllRoomsFilterByDate: function(req, res) {
        	console.log(req);
            var filterdate = req.query.createdDateFilter;
            filterdate = parseInt(filterdate);
            RoomsSchemaModel.find({}, function(err, items) {
                if (err) {
                    res.send(400);
                } else {
                    res.send(items);
                }
            }).sort({
                created: filterdate
            });
        },
        getAllRoomAmenties: function(req, res) {
            async.waterfall([
                function(done) {
                    PartOfModel.findOne({
                        "name": "Room"
                    }, function(err, items) {
                        if (err) {
                            res.send(400);
                        } else {
                            done(null, items._id);
                        }
                    });
                },
                function(partofroomId, done) {
                    AmenityModel.find({
                        "partOf": partofroomId
                    }, function(err, amenties) {
                        if (err) {
                            res.send(400);
                        } else {
                            res.send(amenties);
                            done();
                        }
                    });
                }
            ], function(err) {});
        },
        getallroomsparticulertospace: function(req, res) {
            var spaceId = req.query.particulerroomsspaceId;
            RoomsSchemaModel.find({
                "spaceId": spaceId
            }, function(err, items) {
                if (err) {
                    res.send(400);
                } else {
                    res.send(items);
                }
            }).populate("spaceId", "").populate("roomtype","");
        },
        confirmupdatescheduledetail: function(req, res) {
            var roomdetail = req.room;
            var bookedarray = req.body.bookedarray;
            var changedschedulearray = req.body.changedschedulearray;
        
            roomdetail = _.extend(roomdetail, req.body);
            async.waterfall([
                function(done) {
                    roomdetail.save(function(err, items) {
                        if (err) {
                            res.send(400);
                        } else {
                            done();
                        }
                    });
                },
                function(done) {
                    async.each(changedschedulearray, function(changedschedulearrayobject, callbackchangedschedulearray) {
                        ScheduleModel.find({
                            'day': changedschedulearrayobject.day
                        }, function(err, docs) {
                            if (err) {
                                res.send(400);
                                callbackchangedschedulearray();
                            } else {
                                async.each(docs, function(scheduleobject, callbackscheduleupdate) {
                                    scheduleobject.initialAval[0].startTime = changedschedulearrayobject.startTime;
                                    scheduleobject.initialAval[0].endTime = changedschedulearrayobject.endTime;
                                    scheduleobject.save(function(err, result) {
                                        if (err) {
                                            res.send(400);
                                        } else {
                                            callbackscheduleupdate();
                                        }
                                    });
                                }, function(err) {
                                    callbackchangedschedulearray();;
                                });
                            }
                        });
                    }, function(err) {
                        done();
                    });
                }
            ], function(err) {});
        },
        cronaddrowtoschedule: function(req, res) {
            async.waterfall([
                function(done) {

                    RoomsSchemaModel.find({"isActive":true},function(err,items){
                        if(err)
                        {
                            res.send(400);
                        }
                        else
                        {
                            done(null,items);
                        }


                    }).populate("spaceId", "");

                },
                function(roomobjects,done) {
                    async.each(roomobjects, function(roomsingleobject, callbackschedule) {
                        var roomsschedule = roomsingleobject.roomsslotschedule;
                        var roomId=roomsingleobject._id;
                        var location=roomsingleobject.loc;
    
                        var spaceholiday=roomsingleobject.spaceId.space_holiday;
                            spaceholiday=_.pluck(spaceholiday,"holiday_date");    
  
                        var spacholidaylist=[];  
                          for(var i=0;i<spaceholiday.length;i++){
                            spacholidaylist.push(spaceholiday[i].toISOString().substr(0,11));
                          }
                          
                            var scheduleupdatingdate=new Date();                     
                                scheduleupdatingdate.setDate(scheduleupdatingdate.getDate()+90);

                            var updateddate=scheduleupdatingdate;
                            var mycurrentday = updateddate.getDay(); 

                            var todaydate=new Date();
                                todaydate.setDate(todaydate.getDate()+90);
                                todaydate=todaydate.toISOString();  
                                todaydate=todaydate.substr(0,11); 

                            var mydaymodifiedforallday=new Date();
                            var previousday=new Date(mydaymodifiedforallday.setDate(mydaymodifiedforallday.getDate() + 89));
                                previousday=previousday.toISOString();  
                                previousday=previousday.substr(0,11);    

                           var checkingcurrentdayisholiday= _.contains(spacholidaylist, todaydate);

                              if (mycurrentday == 0 && roomsschedule[6])
                              { 
                                
                              if (mycurrentday == 0 && !roomsschedule[6].isClosed && !checkingcurrentdayisholiday) {

                                     var checkinghours=new Date(roomsschedule[6].startTime);
                                     var checkedhour=checkinghours.getHours(); 


                                     var datefromschedule=roomsschedule[6].startTime;
                                         datefromschedule=datefromschedule.toISOString();
                                         datefromschedule=datefromschedule.substr(11,20);

                                    var datefromscheduleendtime=roomsschedule[6].endTime;
                                        datefromscheduleendtime=datefromscheduleendtime.toISOString();
                                        datefromscheduleendtime=datefromscheduleendtime.substr(11,20); 

                                    var checkinghoursendtime=new Date(roomsschedule[6].endTime);
                                    var checkedhourendtime=checkinghoursendtime.getHours();     

                                    if(roomsschedule[6].isAllday)
                                 {
                                   var modifieddate=previousday+datefromschedule;
                                   var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                 }

                                 if(!roomsschedule[6].isAllday && checkedhour < 6 && checkedhourendtime < 6)
                                 {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=previousday+datefromscheduleendtime;
                                 }

                                if(!roomsschedule[6].isAllday && checkedhour < 6 && checkedhourendtime > 6)
                                 {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=todaydate+datefromscheduleendtime;
                                 }

                                 if(!roomsschedule[6].isAllday && checkedhour > 6 && checkedhourendtime > 6)
                                 {
                                  var modifieddate=todaydate+datefromschedule;
                                  var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                 } 

                                        roomsschedule[6].startTime=modifieddate; 
                                        roomsschedule[6].endTime=modifieddateenddate; 

                                    var myfinalobj = {};
                                    myfinalobj.room = roomId;
                                    myfinalobj.loc = location;
                                    myfinalobj.day = "Sunday";
                                    myfinalobj.isAllday = roomsschedule[6].isAllday;
                                    myfinalobj.isClosed = roomsschedule[6].isClosed;
                                    myfinalobj.date = updateddate;
                                    myfinalobj.bookings = [];
                                    var myfinalschedule = [];
                                    var startTimeDay = new Date(roomsschedule[6].startTime);
                                    var endTimeDay = new Date(roomsschedule[6].endTime);
                                    startTimeDay.setSeconds(0);
                                    startTimeDay.setMilliseconds(0);
                                    endTimeDay.setSeconds(0);
                                    endTimeDay.setMilliseconds(0); 

                                    var myobj = {};
                                    myobj.startTime = startTimeDay;
                                    myobj.endTime = endTimeDay;
                                    myfinalschedule.push(myobj);
                                    myfinalobj.initialAval = myfinalschedule;
                                    myfinalobj.currentAval = myfinalschedule;
                                    var schedulecreate = new ScheduleModel(myfinalobj);
                                    schedulecreate.save(function(err, items) {
                                        if (err) {
                                            res.send(400);
                                        }
                                    });
                               } 

                             }

                              if (mycurrentday == 1 && roomsschedule[0])
                              { 
                                
                              if (mycurrentday == 1 && !roomsschedule[0].isClosed && !checkingcurrentdayisholiday) {

                                     var checkinghours=new Date(roomsschedule[0].startTime);
                                     var checkedhour=checkinghours.getHours(); 


                                     var datefromschedule=roomsschedule[0].startTime;
                                         datefromschedule=datefromschedule.toISOString();
                                         datefromschedule=datefromschedule.substr(11,20);

                                    var datefromscheduleendtime=roomsschedule[0].endTime;
                                        datefromscheduleendtime=datefromscheduleendtime.toISOString();
                                        datefromscheduleendtime=datefromscheduleendtime.substr(11,20); 

                                    var checkinghoursendtime=new Date(roomsschedule[0].endTime);
                                    var checkedhourendtime=checkinghoursendtime.getHours();     

                                    if(roomsschedule[0].isAllday)
                                 {
                                   var modifieddate=previousday+datefromschedule;
                                   var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                 }

                                 if(!roomsschedule[0].isAllday && checkedhour < 6 && checkedhourendtime < 6)
                                 {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=previousday+datefromscheduleendtime;
                                 }

                                if(!roomsschedule[0].isAllday && checkedhour < 6 && checkedhourendtime > 6)
                                 {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=todaydate+datefromscheduleendtime;
                                 }

                                 if(!roomsschedule[0].isAllday && checkedhour > 6 && checkedhourendtime > 6)
                                 {
                                  var modifieddate=todaydate+datefromschedule;
                                  var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                 } 

                                        roomsschedule[0].startTime=modifieddate; 
                                        roomsschedule[0].endTime=modifieddateenddate; 

                                    var myfinalobj = {};
                                    myfinalobj.room = roomId;
                                    myfinalobj.loc = location;
                                    myfinalobj.day = "Monday";
                                    myfinalobj.isAllday = roomsschedule[0].isAllday;
                                    myfinalobj.isClosed = roomsschedule[0].isClosed;
                                    myfinalobj.date = updateddate;
                                    myfinalobj.bookings = [];
                                    var myfinalschedule = [];
                                    var startTimeDay = new Date(roomsschedule[0].startTime);
                                    var endTimeDay = new Date(roomsschedule[0].endTime);
                                    startTimeDay.setSeconds(0);
                                    startTimeDay.setMilliseconds(0);
                                    endTimeDay.setSeconds(0);
                                    endTimeDay.setMilliseconds(0); 

                                    var myobj = {};
                                    myobj.startTime = startTimeDay;
                                    myobj.endTime = endTimeDay;
                                    myfinalschedule.push(myobj);
                                    myfinalobj.initialAval = myfinalschedule;
                                    myfinalobj.currentAval = myfinalschedule;
                                    var schedulecreate = new ScheduleModel(myfinalobj);
                                    schedulecreate.save(function(err, items) {
                                        if (err) {
                                            res.send(400);
                                        }
                                    });
                               } 

                             }

                              if (mycurrentday == 2 && roomsschedule[1])
                              { 
                                
                              if (mycurrentday == 2 && !roomsschedule[1].isClosed && !checkingcurrentdayisholiday) {

                                     var checkinghours=new Date(roomsschedule[1].startTime);
                                     var checkedhour=checkinghours.getHours(); 


                                     var datefromschedule=roomsschedule[1].startTime;
                                         datefromschedule=datefromschedule.toISOString();
                                         datefromschedule=datefromschedule.substr(11,20);

                                    var datefromscheduleendtime=roomsschedule[1].endTime;
                                        datefromscheduleendtime=datefromscheduleendtime.toISOString();
                                        datefromscheduleendtime=datefromscheduleendtime.substr(11,20); 

                                    var checkinghoursendtime=new Date(roomsschedule[1].endTime);
                                    var checkedhourendtime=checkinghoursendtime.getHours();     

                                    if(roomsschedule[1].isAllday)
                                 {
                                   var modifieddate=previousday+datefromschedule;
                                   var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                 }

                                 if(!roomsschedule[1].isAllday && checkedhour < 6 && checkedhourendtime < 6)
                                 {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=previousday+datefromscheduleendtime;
                                 }

                                if(!roomsschedule[1].isAllday && checkedhour < 6 && checkedhourendtime > 6)
                                 {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=todaydate+datefromscheduleendtime;
                                 }

                                 if(!roomsschedule[1].isAllday && checkedhour > 6 && checkedhourendtime > 6)
                                 {
                                  var modifieddate=todaydate+datefromschedule;
                                  var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                 } 

                                        roomsschedule[1].startTime=modifieddate; 
                                        roomsschedule[1].endTime=modifieddateenddate; 

                                    var myfinalobj = {};
                                    myfinalobj.room = roomId;
                                    myfinalobj.loc = location;
                                    myfinalobj.day = "Tuesday";
                                    myfinalobj.isAllday = roomsschedule[1].isAllday;
                                    myfinalobj.isClosed = roomsschedule[1].isClosed;
                                    myfinalobj.date = updateddate;
                                    myfinalobj.bookings = [];
                                    var myfinalschedule = [];
                                    var startTimeDay = new Date(roomsschedule[1].startTime);
                                    var endTimeDay = new Date(roomsschedule[1].endTime);
                                    startTimeDay.setSeconds(0);
                                    startTimeDay.setMilliseconds(0);
                                    endTimeDay.setSeconds(0);
                                    endTimeDay.setMilliseconds(0); 

                                    var myobj = {};
                                    myobj.startTime = startTimeDay;
                                    myobj.endTime = endTimeDay;
                                    myfinalschedule.push(myobj);
                                    myfinalobj.initialAval = myfinalschedule;
                                    myfinalobj.currentAval = myfinalschedule;
                                    var schedulecreate = new ScheduleModel(myfinalobj);
                                    schedulecreate.save(function(err, items) {
                                        if (err) {
                                            res.send(400);
                                        }
                                    });
                               } 

                             } 

                             if (mycurrentday == 3 && roomsschedule[2])
                              { 
                                
                              if (mycurrentday == 3 && !roomsschedule[2].isClosed && !checkingcurrentdayisholiday) {

                                     var checkinghours=new Date(roomsschedule[2].startTime);
                                     var checkedhour=checkinghours.getHours(); 


                                     var datefromschedule=roomsschedule[2].startTime;
                                         datefromschedule=datefromschedule.toISOString();
                                         datefromschedule=datefromschedule.substr(11,20);

                                    var datefromscheduleendtime=roomsschedule[2].endTime;
                                        datefromscheduleendtime=datefromscheduleendtime.toISOString();
                                        datefromscheduleendtime=datefromscheduleendtime.substr(11,20); 

                                    var checkinghoursendtime=new Date(roomsschedule[2].endTime);
                                    var checkedhourendtime=checkinghoursendtime.getHours();     

                                    if(roomsschedule[2].isAllday)
                                 {
                                   var modifieddate=previousday+datefromschedule;
                                   var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                 }

                                 if(!roomsschedule[2].isAllday && checkedhour < 6 && checkedhourendtime < 6)
                                 {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=previousday+datefromscheduleendtime;
                                 }

                                if(!roomsschedule[2].isAllday && checkedhour < 6 && checkedhourendtime > 6)
                                 {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=todaydate+datefromscheduleendtime;
                                 }

                                 if(!roomsschedule[2].isAllday && checkedhour > 6 && checkedhourendtime > 6)
                                 {
                                  var modifieddate=todaydate+datefromschedule;
                                  var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                 } 

                                        roomsschedule[2].startTime=modifieddate; 
                                        roomsschedule[2].endTime=modifieddateenddate; 

                                    var myfinalobj = {};
                                    myfinalobj.room = roomId;
                                    myfinalobj.loc = location;
                                    myfinalobj.day = "Wednesday";
                                    myfinalobj.isAllday = roomsschedule[2].isAllday;
                                    myfinalobj.isClosed = roomsschedule[2].isClosed;
                                    myfinalobj.date = updateddate;
                                    myfinalobj.bookings = [];
                                    var myfinalschedule = [];
                                    var startTimeDay = new Date(roomsschedule[2].startTime);
                                    var endTimeDay = new Date(roomsschedule[2].endTime);
                                    startTimeDay.setSeconds(0);
                                    startTimeDay.setMilliseconds(0);
                                    endTimeDay.setSeconds(0);
                                    endTimeDay.setMilliseconds(0); 

                                    var myobj = {};
                                    myobj.startTime = startTimeDay;
                                    myobj.endTime = endTimeDay;
                                    myfinalschedule.push(myobj);
                                    myfinalobj.initialAval = myfinalschedule;
                                    myfinalobj.currentAval = myfinalschedule;
                                    var schedulecreate = new ScheduleModel(myfinalobj);
                                    schedulecreate.save(function(err, items) {
                                        if (err) {
                                            res.send(400);
                                        }
                                    });
                               } 

                             } 

                            if (mycurrentday == 4 && roomsschedule[3])
                              { 
                                
                              if (mycurrentday == 4 && !roomsschedule[3].isClosed && !checkingcurrentdayisholiday) {

                                     var checkinghours=new Date(roomsschedule[3].startTime);
                                     var checkedhour=checkinghours.getHours(); 


                                     var datefromschedule=roomsschedule[3].startTime;
                                         datefromschedule=datefromschedule.toISOString();
                                         datefromschedule=datefromschedule.substr(11,20);

                                    var datefromscheduleendtime=roomsschedule[3].endTime;
                                        datefromscheduleendtime=datefromscheduleendtime.toISOString();
                                        datefromscheduleendtime=datefromscheduleendtime.substr(11,20); 

                                    var checkinghoursendtime=new Date(roomsschedule[3].endTime);
                                    var checkedhourendtime=checkinghoursendtime.getHours();     

                                    if(roomsschedule[3].isAllday)
                                 {
                                   var modifieddate=previousday+datefromschedule;
                                   var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                 }

                                 if(!roomsschedule[3].isAllday && checkedhour < 6 && checkedhourendtime < 6)
                                 {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=previousday+datefromscheduleendtime;
                                 }

                                if(!roomsschedule[3].isAllday && checkedhour < 6 && checkedhourendtime > 6)
                                 {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=todaydate+datefromscheduleendtime;
                                 }

                                 if(!roomsschedule[3].isAllday && checkedhour > 6 && checkedhourendtime > 6)
                                 {
                                  var modifieddate=todaydate+datefromschedule;
                                  var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                 } 

                                        roomsschedule[3].startTime=modifieddate; 
                                        roomsschedule[3].endTime=modifieddateenddate; 

                                    var myfinalobj = {};
                                    myfinalobj.room = roomId;
                                    myfinalobj.loc = location;
                                    myfinalobj.day = "Thursday";
                                    myfinalobj.isAllday = roomsschedule[3].isAllday;
                                    myfinalobj.isClosed = roomsschedule[3].isClosed;
                                    myfinalobj.date = updateddate;
                                    myfinalobj.bookings = [];
                                    var myfinalschedule = [];
                                    var startTimeDay = new Date(roomsschedule[3].startTime);
                                    var endTimeDay = new Date(roomsschedule[3].endTime);
                                    startTimeDay.setSeconds(0);
                                    startTimeDay.setMilliseconds(0);
                                    endTimeDay.setSeconds(0);
                                    endTimeDay.setMilliseconds(0); 

                                    var myobj = {};
                                    myobj.startTime = startTimeDay;
                                    myobj.endTime = endTimeDay;
                                    myfinalschedule.push(myobj);
                                    myfinalobj.initialAval = myfinalschedule;
                                    myfinalobj.currentAval = myfinalschedule;
                                    var schedulecreate = new ScheduleModel(myfinalobj);
                                    schedulecreate.save(function(err, items) {
                                        if (err) {
                                            res.send(400);
                                        }
                                    });
                               } 

                             } 

                           if (mycurrentday == 5 && roomsschedule[4])
                              { 
                                
                              if (mycurrentday == 5 && !roomsschedule[4].isClosed && !checkingcurrentdayisholiday) {

                                     var checkinghours=new Date(roomsschedule[4].startTime);
                                     var checkedhour=checkinghours.getHours(); 


                                     var datefromschedule=roomsschedule[4].startTime;
                                         datefromschedule=datefromschedule.toISOString();
                                         datefromschedule=datefromschedule.substr(11,20);

                                    var datefromscheduleendtime=roomsschedule[4].endTime;
                                        datefromscheduleendtime=datefromscheduleendtime.toISOString();
                                        datefromscheduleendtime=datefromscheduleendtime.substr(11,20); 

                                    var checkinghoursendtime=new Date(roomsschedule[4].endTime);
                                    var checkedhourendtime=checkinghoursendtime.getHours();     

                                    if(roomsschedule[4].isAllday)
                                 {
                                   var modifieddate=previousday+datefromschedule;
                                   var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                 }

                                 if(!roomsschedule[4].isAllday && checkedhour < 6 && checkedhourendtime < 6)
                                 {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=previousday+datefromscheduleendtime;
                                 }

                                if(!roomsschedule[4].isAllday && checkedhour < 6 && checkedhourendtime > 6)
                                 {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=todaydate+datefromscheduleendtime;
                                 }

                                 if(!roomsschedule[4].isAllday && checkedhour > 6 && checkedhourendtime > 6)
                                 {
                                  var modifieddate=todaydate+datefromschedule;
                                  var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                 } 

                                        roomsschedule[4].startTime=modifieddate; 
                                        roomsschedule[4].endTime=modifieddateenddate; 

                                    var myfinalobj = {};
                                    myfinalobj.room = roomId;
                                    myfinalobj.loc = location;
                                    myfinalobj.day = "Friday";
                                    myfinalobj.isAllday = roomsschedule[4].isAllday;
                                    myfinalobj.isClosed = roomsschedule[4].isClosed;
                                    myfinalobj.date = updateddate;
                                    myfinalobj.bookings = [];
                                    var myfinalschedule = [];
                                    var startTimeDay = new Date(roomsschedule[4].startTime);
                                    var endTimeDay = new Date(roomsschedule[4].endTime);
                                    startTimeDay.setSeconds(0);
                                    startTimeDay.setMilliseconds(0);
                                    endTimeDay.setSeconds(0);
                                    endTimeDay.setMilliseconds(0); 

                                    var myobj = {};
                                    myobj.startTime = startTimeDay;
                                    myobj.endTime = endTimeDay;
                                    myfinalschedule.push(myobj);
                                    myfinalobj.initialAval = myfinalschedule;
                                    myfinalobj.currentAval = myfinalschedule;
                                    var schedulecreate = new ScheduleModel(myfinalobj);
                                    schedulecreate.save(function(err, items) {
                                        if (err) {
                                            res.send(400);
                                        }
                                    });
                               } 

                             }

                           if (mycurrentday == 6 && roomsschedule[5])
                              { 
                                
                              if (mycurrentday == 6 && !roomsschedule[5].isClosed && !checkingcurrentdayisholiday) {

                                     var checkinghours=new Date(roomsschedule[5].startTime);
                                     var checkedhour=checkinghours.getHours(); 


                                     var datefromschedule=roomsschedule[5].startTime;
                                         datefromschedule=datefromschedule.toISOString();
                                         datefromschedule=datefromschedule.substr(11,20);

                                    var datefromscheduleendtime=roomsschedule[5].endTime;
                                        datefromscheduleendtime=datefromscheduleendtime.toISOString();
                                        datefromscheduleendtime=datefromscheduleendtime.substr(11,20); 

                                    var checkinghoursendtime=new Date(roomsschedule[5].endTime);
                                    var checkedhourendtime=checkinghoursendtime.getHours();     

                                    if(roomsschedule[5].isAllday)
                                 {
                                   var modifieddate=previousday+datefromschedule;
                                   var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                 }

                                 if(!roomsschedule[5].isAllday && checkedhour < 6 && checkedhourendtime < 6)
                                 {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=previousday+datefromscheduleendtime;
                                 }

                                if(!roomsschedule[5].isAllday && checkedhour < 6 && checkedhourendtime > 6)
                                 {
                                    var modifieddate=previousday+datefromschedule;
                                    var modifieddateenddate=todaydate+datefromscheduleendtime;
                                 }

                                 if(!roomsschedule[5].isAllday && checkedhour > 6 && checkedhourendtime > 6)
                                 {
                                  var modifieddate=todaydate+datefromschedule;
                                  var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                 } 

                                        roomsschedule[5].startTime=modifieddate; 
                                        roomsschedule[5].endTime=modifieddateenddate; 

                                    var myfinalobj = {};
                                    myfinalobj.room = roomId;
                                    myfinalobj.loc = location;
                                    myfinalobj.day = "Saturday";
                                    myfinalobj.isAllday = roomsschedule[5].isAllday;
                                    myfinalobj.isClosed = roomsschedule[5].isClosed;
                                    myfinalobj.date = updateddate;
                                    myfinalobj.bookings = [];
                                    var myfinalschedule = [];
                                    var startTimeDay = new Date(roomsschedule[5].startTime);
                                    var endTimeDay = new Date(roomsschedule[5].endTime);
                                    startTimeDay.setSeconds(0);
                                    startTimeDay.setMilliseconds(0);
                                    endTimeDay.setSeconds(0);
                                    endTimeDay.setMilliseconds(0); 

                                    var myobj = {};
                                    myobj.startTime = startTimeDay;
                                    myobj.endTime = endTimeDay;
                                    myfinalschedule.push(myobj);
                                    myfinalobj.initialAval = myfinalschedule;
                                    myfinalobj.currentAval = myfinalschedule;
                                    var schedulecreate = new ScheduleModel(myfinalobj);
                                    schedulecreate.save(function(err, items) {
                                        if (err) {
                                            res.send(400);
                                        }
                                    });
                               } 

                             } 
                             
                     
                      callbackschedule();

                    }, function(err) {
                        done();
                    });
                }
            ], function(err) {
                res.send(200);
            }); 
            
        },
        sendingcronscheddulefailuremailtoadmin: function(req, res) {

             var mailOptions = {
                            to: 'padeecs73@gmail.com',
                            from: config.mailer.auth.user
                        };
                          mailOptions = templates.send_schedulemail(mailOptions);
                          sendMail(mailOptions); 

                  res.send(200);        
        },
        creatingScheduleThroughGenricApi:function(req,res)
        {

            async.waterfall([
                function(done) {
                   ScheduleModel.remove({},function(err) {

                        if(err)
                        {
                          return res.status(500).json({
                              error : 'Cannot delete the schedules'
                           });           
                        }
                       else
                       {
                           done();
                        }

                      });               

                },
                function(done) {
                     BookingModel.remove({},function(err) {

                        if(err)
                        {
                            return res.status(500).json({
                              error : 'Cannot delete the bookings'
                           });              
                        }
                       else
                       {
                           done();
                        }

                      });

                },
                function(done) {

                    RoomsSchemaModel.find({"isActive":true},function(err,items){
                        if(err)
                        {
                            res.send(400);
                        }
                        else
                        {
                            done(null,items);
                        }


                    }).populate("spaceId", "");

                },
                function(roomobjects,done) {
                    async.each(roomobjects, function(roomsingleobject, callbackschedule) {
                        var roomsschedule = roomsingleobject.roomsslotschedule;
                        var roomId=roomsingleobject._id;
                        var location=roomsingleobject.loc;
    
                        var spaceholiday=roomsingleobject.spaceId.space_holiday;
                            spaceholiday=_.pluck(spaceholiday,"holiday_date");    
  
                        var spacholidaylist=[];  
                          for(var i=0;i<spaceholiday.length;i++){
                            spacholidaylist.push(spaceholiday[i].toISOString().substr(0,11));
                          }
                          
                     
                        for(var j=0;j<90;j++)
                         {

                            var scheduleupdatingdate=new Date();                     
                                scheduleupdatingdate.setDate(scheduleupdatingdate.getDate()+j);

                            var updateddate=scheduleupdatingdate;
                            var mycurrentday = updateddate.getDay(); 

                            var todaydate=new Date();
                                todaydate.setDate(todaydate.getDate()+j);
                                todaydate=todaydate.toISOString();  
                                todaydate=todaydate.substr(0,11); 

                           var checkingcurrentdayisholiday= _.contains(spacholidaylist, todaydate); 

                           var mydaymodifiedforallday=new Date();
                           var daycount=j-1; 

                           var previousday=new Date(mydaymodifiedforallday.setDate(mydaymodifiedforallday.getDate() + daycount));
                            previousday=previousday.toISOString();  
                            previousday=previousday.substr(0,11);


                              if (mycurrentday == 0 && roomsschedule[6])
                              {

                                    if (mycurrentday == 0 && !roomsschedule[6].isClosed && !checkingcurrentdayisholiday) {

                                          var checkinghours=new Date(roomsschedule[6].startTime);
                                          var checkedhour=checkinghours.getHours();   


                                           var datefromschedule=roomsschedule[6].startTime;
                                               datefromschedule=datefromschedule.toISOString();
                                               datefromschedule=datefromschedule.substr(11,20);

                                          var datefromscheduleendtime=roomsschedule[6].endTime;
                                              datefromscheduleendtime=datefromscheduleendtime.toISOString();
                                              datefromscheduleendtime=datefromscheduleendtime.substr(11,20); 

                                          var checkinghoursendtime=new Date(roomsschedule[6].endTime);
                                          var checkedhourendtime=checkinghoursendtime.getHours();    

                                          if(roomsschedule[6].isAllday)
                                           {
                                             var modifieddate=previousday+datefromschedule;
                                             var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                           }

                                           if(!roomsschedule[6].isAllday && checkedhour < 6 && checkedhourendtime < 6)
                                           {
                                              var modifieddate=previousday+datefromschedule;
                                              var modifieddateenddate=previousday+datefromscheduleendtime;
                                           }

                                          if(!roomsschedule[6].isAllday && checkedhour < 6 && checkedhourendtime > 6)
                                           {
                                              var modifieddate=previousday+datefromschedule;
                                              var modifieddateenddate=todaydate+datefromscheduleendtime;
                                           }

                                           if(!roomsschedule[6].isAllday && checkedhour > 6 && checkedhourendtime > 6)
                                           {
                                            var modifieddate=todaydate+datefromschedule;
                                            var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                           }

                                              roomsschedule[6].startTime=modifieddate; 
                                              roomsschedule[6].endTime=modifieddateenddate; 

                                          var myfinalobj = {};
                                          myfinalobj.room = roomId;
                                          myfinalobj.loc = location;
                                          myfinalobj.day = "Sunday";
                                          myfinalobj.isAllday = roomsschedule[6].isAllday;
                                          myfinalobj.isClosed = roomsschedule[6].isClosed;
                                          myfinalobj.date = updateddate;
                                          myfinalobj.bookings = [];
                                          var myfinalschedule = [];
                                          var startTimeDay = new Date(roomsschedule[6].startTime);
                                          var endTimeDay = new Date(roomsschedule[6].endTime);
                                          startTimeDay.setSeconds(0);
                                          startTimeDay.setMilliseconds(0);
                                          endTimeDay.setSeconds(0);
                                          endTimeDay.setMilliseconds(0); 

                                          var myobj = {};
                                          myobj.startTime = startTimeDay;
                                          myobj.endTime = endTimeDay;
                                          myfinalschedule.push(myobj);
                                          myfinalobj.initialAval = myfinalschedule;
                                          myfinalobj.currentAval = myfinalschedule;
                                          var schedulecreate = new ScheduleModel(myfinalobj);
                                          schedulecreate.save(function(err, items) {
                                              if (err) {
                                                  res.send(400);
                                              }
                                          });
                                     } 

                                  }   

                              if (mycurrentday == 1 && roomsschedule[0])
                              {

                                    if (mycurrentday == 1 && !roomsschedule[0].isClosed && !checkingcurrentdayisholiday) {

                                          var checkinghours=new Date(roomsschedule[0].startTime);
                                          var checkedhour=checkinghours.getHours();   


                                           var datefromschedule=roomsschedule[0].startTime;
                                               datefromschedule=datefromschedule.toISOString();
                                               datefromschedule=datefromschedule.substr(11,20);

                                          var datefromscheduleendtime=roomsschedule[0].endTime;
                                              datefromscheduleendtime=datefromscheduleendtime.toISOString();
                                              datefromscheduleendtime=datefromscheduleendtime.substr(11,20); 

                                          var checkinghoursendtime=new Date(roomsschedule[0].endTime);
                                          var checkedhourendtime=checkinghoursendtime.getHours();    

                                          if(roomsschedule[0].isAllday)
                                           {
                                             var modifieddate=previousday+datefromschedule;
                                             var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                           }

                                           if(!roomsschedule[0].isAllday && checkedhour < 6 && checkedhourendtime < 6)
                                           {
                                              var modifieddate=previousday+datefromschedule;
                                              var modifieddateenddate=previousday+datefromscheduleendtime;
                                           }

                                          if(!roomsschedule[0].isAllday && checkedhour < 6 && checkedhourendtime > 6)
                                           {
                                              var modifieddate=previousday+datefromschedule;
                                              var modifieddateenddate=todaydate+datefromscheduleendtime;
                                           }

                                           if(!roomsschedule[0].isAllday && checkedhour > 6 && checkedhourendtime > 6)
                                           {
                                            var modifieddate=todaydate+datefromschedule;
                                            var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                           }

                                              roomsschedule[0].startTime=modifieddate; 
                                              roomsschedule[0].endTime=modifieddateenddate; 

                                          var myfinalobj = {};
                                          myfinalobj.room = roomId;
                                          myfinalobj.loc = location;
                                          myfinalobj.day = "Monday";
                                          myfinalobj.isAllday = roomsschedule[0].isAllday;
                                          myfinalobj.isClosed = roomsschedule[0].isClosed;
                                          myfinalobj.date = updateddate;
                                          myfinalobj.bookings = [];
                                          var myfinalschedule = [];
                                          var startTimeDay = new Date(roomsschedule[0].startTime);
                                          var endTimeDay = new Date(roomsschedule[0].endTime);
                                          startTimeDay.setSeconds(0);
                                          startTimeDay.setMilliseconds(0);
                                          endTimeDay.setSeconds(0);
                                          endTimeDay.setMilliseconds(0); 

                                          var myobj = {};
                                          myobj.startTime = startTimeDay;
                                          myobj.endTime = endTimeDay;
                                          myfinalschedule.push(myobj);
                                          myfinalobj.initialAval = myfinalschedule;
                                          myfinalobj.currentAval = myfinalschedule;
                                          var schedulecreate = new ScheduleModel(myfinalobj);
                                          schedulecreate.save(function(err, items) {
                                              if (err) {
                                                  res.send(400);
                                              }
                                          });
                                     } 

                                  }  

                             if (mycurrentday == 2 && roomsschedule[1])
                              {

                                    if (mycurrentday == 2 && !roomsschedule[1].isClosed && !checkingcurrentdayisholiday) {

                                          var checkinghours=new Date(roomsschedule[1].startTime);
                                          var checkedhour=checkinghours.getHours();   


                                           var datefromschedule=roomsschedule[1].startTime;
                                               datefromschedule=datefromschedule.toISOString();
                                               datefromschedule=datefromschedule.substr(11,20);

                                          var datefromscheduleendtime=roomsschedule[1].endTime;
                                              datefromscheduleendtime=datefromscheduleendtime.toISOString();
                                              datefromscheduleendtime=datefromscheduleendtime.substr(11,20); 

                                          var checkinghoursendtime=new Date(roomsschedule[1].endTime);
                                          var checkedhourendtime=checkinghoursendtime.getHours();    

                                          if(roomsschedule[1].isAllday)
                                           {
                                             var modifieddate=previousday+datefromschedule;
                                             var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                           }

                                           if(!roomsschedule[1].isAllday && checkedhour < 6 && checkedhourendtime < 6)
                                           {
                                              var modifieddate=previousday+datefromschedule;
                                              var modifieddateenddate=previousday+datefromscheduleendtime;
                                           }

                                          if(!roomsschedule[1].isAllday && checkedhour < 6 && checkedhourendtime > 6)
                                           {
                                              var modifieddate=previousday+datefromschedule;
                                              var modifieddateenddate=todaydate+datefromscheduleendtime;
                                           }

                                           if(!roomsschedule[1].isAllday && checkedhour > 6 && checkedhourendtime > 6)
                                           {
                                            var modifieddate=todaydate+datefromschedule;
                                            var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                           }

                                              roomsschedule[1].startTime=modifieddate; 
                                              roomsschedule[1].endTime=modifieddateenddate; 

                                          var myfinalobj = {};
                                          myfinalobj.room = roomId;
                                          myfinalobj.loc = location;
                                          myfinalobj.day = "Tuesday";
                                          myfinalobj.isAllday = roomsschedule[1].isAllday;
                                          myfinalobj.isClosed = roomsschedule[1].isClosed;
                                          myfinalobj.date = updateddate;
                                          myfinalobj.bookings = [];
                                          var myfinalschedule = [];
                                          var startTimeDay = new Date(roomsschedule[1].startTime);
                                          var endTimeDay = new Date(roomsschedule[1].endTime);
                                          startTimeDay.setSeconds(0);
                                          startTimeDay.setMilliseconds(0);
                                          endTimeDay.setSeconds(0);
                                          endTimeDay.setMilliseconds(0); 

                                          var myobj = {};
                                          myobj.startTime = startTimeDay;
                                          myobj.endTime = endTimeDay;
                                          myfinalschedule.push(myobj);
                                          myfinalobj.initialAval = myfinalschedule;
                                          myfinalobj.currentAval = myfinalschedule;
                                          var schedulecreate = new ScheduleModel(myfinalobj);
                                          schedulecreate.save(function(err, items) {
                                              if (err) {
                                                  res.send(400);
                                              }
                                          });
                                     } 

                                  }  


                             if (mycurrentday == 3 && roomsschedule[2])
                              {

                                    if (mycurrentday == 3 && !roomsschedule[2].isClosed && !checkingcurrentdayisholiday) {

                                          var checkinghours=new Date(roomsschedule[2].startTime);
                                          var checkedhour=checkinghours.getHours();   


                                           var datefromschedule=roomsschedule[2].startTime;
                                               datefromschedule=datefromschedule.toISOString();
                                               datefromschedule=datefromschedule.substr(11,20);

                                          var datefromscheduleendtime=roomsschedule[2].endTime;
                                              datefromscheduleendtime=datefromscheduleendtime.toISOString();
                                              datefromscheduleendtime=datefromscheduleendtime.substr(11,20); 

                                          var checkinghoursendtime=new Date(roomsschedule[2].endTime);
                                          var checkedhourendtime=checkinghoursendtime.getHours();    

                                          if(roomsschedule[2].isAllday)
                                           {
                                             var modifieddate=previousday+datefromschedule;
                                             var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                           }

                                           if(!roomsschedule[2].isAllday && checkedhour < 6 && checkedhourendtime < 6)
                                           {
                                              var modifieddate=previousday+datefromschedule;
                                              var modifieddateenddate=previousday+datefromscheduleendtime;
                                           }

                                          if(!roomsschedule[2].isAllday && checkedhour < 6 && checkedhourendtime > 6)
                                           {
                                              var modifieddate=previousday+datefromschedule;
                                              var modifieddateenddate=todaydate+datefromscheduleendtime;
                                           }

                                           if(!roomsschedule[2].isAllday && checkedhour > 6 && checkedhourendtime > 6)
                                           {
                                            var modifieddate=todaydate+datefromschedule;
                                            var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                           }

                                              roomsschedule[2].startTime=modifieddate; 
                                              roomsschedule[2].endTime=modifieddateenddate; 

                                          var myfinalobj = {};
                                          myfinalobj.room = roomId;
                                          myfinalobj.loc = location;
                                          myfinalobj.day = "Wednesday";
                                          myfinalobj.isAllday = roomsschedule[2].isAllday;
                                          myfinalobj.isClosed = roomsschedule[2].isClosed;
                                          myfinalobj.date = updateddate;
                                          myfinalobj.bookings = [];
                                          var myfinalschedule = [];
                                          var startTimeDay = new Date(roomsschedule[2].startTime);
                                          var endTimeDay = new Date(roomsschedule[2].endTime);
                                          startTimeDay.setSeconds(0);
                                          startTimeDay.setMilliseconds(0);
                                          endTimeDay.setSeconds(0);
                                          endTimeDay.setMilliseconds(0); 

                                          var myobj = {};
                                          myobj.startTime = startTimeDay;
                                          myobj.endTime = endTimeDay;
                                          myfinalschedule.push(myobj);
                                          myfinalobj.initialAval = myfinalschedule;
                                          myfinalobj.currentAval = myfinalschedule;
                                          var schedulecreate = new ScheduleModel(myfinalobj);
                                          schedulecreate.save(function(err, items) {
                                              if (err) {
                                                  res.send(400);
                                              }
                                          });
                                     } 

                                  }  

                          if (mycurrentday == 4 && roomsschedule[3])
                              {

                                    if (mycurrentday == 4 && !roomsschedule[3].isClosed && !checkingcurrentdayisholiday) {

                                          var checkinghours=new Date(roomsschedule[3].startTime); 
                                          var checkedhour=checkinghours.getHours();   
                                              

                                           var datefromschedule=roomsschedule[3].startTime;
                                               datefromschedule=datefromschedule.toISOString();
                                               datefromschedule=datefromschedule.substr(11,20);

                                          var datefromscheduleendtime=roomsschedule[3].endTime;
                                              datefromscheduleendtime=datefromscheduleendtime.toISOString();
                                              datefromscheduleendtime=datefromscheduleendtime.substr(11,20); 

                                          var checkinghoursendtime=new Date(roomsschedule[3].endTime);
                                          var checkedhourendtime=checkinghoursendtime.getHours();    

                                          if(roomsschedule[3].isAllday)
                                           {
                                             var modifieddate=previousday+datefromschedule;
                                             var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                           }

                                           if(!roomsschedule[3].isAllday && checkedhour < 6 && checkedhourendtime < 6)
                                           {
                                              var modifieddate=previousday+datefromschedule;
                                              var modifieddateenddate=previousday+datefromscheduleendtime;
                                           }

                                          if(!roomsschedule[3].isAllday && checkedhour < 6 && checkedhourendtime > 6)
                                           {
                                              var modifieddate=previousday+datefromschedule;
                                              var modifieddateenddate=todaydate+datefromscheduleendtime;
                                           }

                                           if(!roomsschedule[3].isAllday && checkedhour > 6 && checkedhourendtime > 6)
                                           {
                                            var modifieddate=todaydate+datefromschedule;
                                            var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                           }

                                              roomsschedule[3].startTime=modifieddate; 
                                              roomsschedule[3].endTime=modifieddateenddate; 

                                          var myfinalobj = {};
                                          myfinalobj.room = roomId;
                                          myfinalobj.loc = location;
                                          myfinalobj.day = "Thursday";
                                          myfinalobj.isAllday = roomsschedule[3].isAllday;
                                          myfinalobj.isClosed = roomsschedule[3].isClosed;
                                          myfinalobj.date = updateddate;
                                          myfinalobj.bookings = [];
                                          var myfinalschedule = [];
                                          var startTimeDay = new Date(roomsschedule[3].startTime);
                                          var endTimeDay = new Date(roomsschedule[3].endTime);
                                          startTimeDay.setSeconds(0);
                                          startTimeDay.setMilliseconds(0);
                                          endTimeDay.setSeconds(0);
                                          endTimeDay.setMilliseconds(0); 

                                          var myobj = {};
                                          myobj.startTime = startTimeDay;
                                          myobj.endTime = endTimeDay;
                                          myfinalschedule.push(myobj);
                                          myfinalobj.initialAval = myfinalschedule;
                                          myfinalobj.currentAval = myfinalschedule;
                                          var schedulecreate = new ScheduleModel(myfinalobj);
                                          schedulecreate.save(function(err, items) {
                                              if (err) {
                                                  res.send(400);
                                              }
                                          });
                                     } 

                                  } 


                         if (mycurrentday == 5 && roomsschedule[4])
                              {

                                    if (mycurrentday == 5 && !roomsschedule[4].isClosed && !checkingcurrentdayisholiday) {

                                          var checkinghours=new Date(roomsschedule[4].startTime);
                                          var checkedhour=checkinghours.getHours();   


                                           var datefromschedule=roomsschedule[4].startTime;
                                               datefromschedule=datefromschedule.toISOString();
                                               datefromschedule=datefromschedule.substr(11,20);

                                          var datefromscheduleendtime=roomsschedule[4].endTime;
                                              datefromscheduleendtime=datefromscheduleendtime.toISOString();
                                              datefromscheduleendtime=datefromscheduleendtime.substr(11,20); 

                                          var checkinghoursendtime=new Date(roomsschedule[4].endTime);
                                          var checkedhourendtime=checkinghoursendtime.getHours();    

                                          if(roomsschedule[4].isAllday)
                                           {
                                             var modifieddate=previousday+datefromschedule;
                                             var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                           }

                                           if(!roomsschedule[4].isAllday && checkedhour < 6 && checkedhourendtime < 6)
                                           {
                                              var modifieddate=previousday+datefromschedule;
                                              var modifieddateenddate=previousday+datefromscheduleendtime;
                                           }

                                          if(!roomsschedule[4].isAllday && checkedhour < 6 && checkedhourendtime > 6)
                                           {
                                              var modifieddate=previousday+datefromschedule;
                                              var modifieddateenddate=todaydate+datefromscheduleendtime;
                                           }

                                           if(!roomsschedule[4].isAllday && checkedhour > 6 && checkedhourendtime > 6)
                                           {
                                            var modifieddate=todaydate+datefromschedule;
                                            var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                           }

                                              roomsschedule[4].startTime=modifieddate; 
                                              roomsschedule[4].endTime=modifieddateenddate; 

                                          var myfinalobj = {};
                                          myfinalobj.room = roomId;
                                          myfinalobj.loc = location;
                                          myfinalobj.day = "Friday";
                                          myfinalobj.isAllday = roomsschedule[4].isAllday;
                                          myfinalobj.isClosed = roomsschedule[4].isClosed;
                                          myfinalobj.date = updateddate;
                                          myfinalobj.bookings = [];
                                          var myfinalschedule = [];
                                          var startTimeDay = new Date(roomsschedule[4].startTime);
                                          var endTimeDay = new Date(roomsschedule[4].endTime);
                                          startTimeDay.setSeconds(0);
                                          startTimeDay.setMilliseconds(0);
                                          endTimeDay.setSeconds(0);
                                          endTimeDay.setMilliseconds(0); 

                                          var myobj = {};
                                          myobj.startTime = startTimeDay;
                                          myobj.endTime = endTimeDay;
                                          myfinalschedule.push(myobj);
                                          myfinalobj.initialAval = myfinalschedule;
                                          myfinalobj.currentAval = myfinalschedule;
                                          var schedulecreate = new ScheduleModel(myfinalobj);
                                          schedulecreate.save(function(err, items) {
                                              if (err) {
                                                  res.send(400);
                                              }
                                          });
                                     } 

                                  } 

                               if (mycurrentday == 6 && roomsschedule[5])
                                  {
                                    if (mycurrentday == 6 && !roomsschedule[5].isClosed && !checkingcurrentdayisholiday) {

                                          var checkinghours=new Date(roomsschedule[5].startTime);
                                          var checkedhour=checkinghours.getHours();   


                                           var datefromschedule=roomsschedule[5].startTime;
                                               datefromschedule=datefromschedule.toISOString();
                                               datefromschedule=datefromschedule.substr(11,20);

                                          var datefromscheduleendtime=roomsschedule[5].endTime;
                                              datefromscheduleendtime=datefromscheduleendtime.toISOString();
                                              datefromscheduleendtime=datefromscheduleendtime.substr(11,20); 

                                          var checkinghoursendtime=new Date(roomsschedule[5].endTime);
                                          var checkedhourendtime=checkinghoursendtime.getHours();    

                                          if(roomsschedule[5].isAllday)
                                           {
                                             var modifieddate=previousday+datefromschedule;
                                             var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                           }

                                           if(!roomsschedule[5].isAllday && checkedhour < 6 && checkedhourendtime < 6)
                                           {
                                              var modifieddate=previousday+datefromschedule;
                                              var modifieddateenddate=previousday+datefromscheduleendtime;
                                           }

                                          if(!roomsschedule[5].isAllday && checkedhour < 6 && checkedhourendtime > 6)
                                           {
                                              var modifieddate=previousday+datefromschedule;
                                              var modifieddateenddate=todaydate+datefromscheduleendtime;
                                           }

                                           if(!roomsschedule[5].isAllday && checkedhour > 6 && checkedhourendtime > 6)
                                           {
                                            var modifieddate=todaydate+datefromschedule;
                                            var modifieddateenddate=todaydate+datefromscheduleendtime; 
                                           }

                                              roomsschedule[5].startTime=modifieddate; 
                                              roomsschedule[5].endTime=modifieddateenddate; 

                                          var myfinalobj = {};
                                          myfinalobj.room = roomId;
                                          myfinalobj.loc = location;
                                          myfinalobj.day = "Saturday";
                                          myfinalobj.isAllday = roomsschedule[5].isAllday;
                                          myfinalobj.isClosed = roomsschedule[5].isClosed;
                                          myfinalobj.date = updateddate;
                                          myfinalobj.bookings = [];
                                          var myfinalschedule = [];
                                          var startTimeDay = new Date(roomsschedule[5].startTime);
                                          var endTimeDay = new Date(roomsschedule[5].endTime);
                                          startTimeDay.setSeconds(0);
                                          startTimeDay.setMilliseconds(0);
                                          endTimeDay.setSeconds(0);
                                          endTimeDay.setMilliseconds(0); 

                                          var myobj = {};
                                          myobj.startTime = startTimeDay;
                                          myobj.endTime = endTimeDay;
                                          myfinalschedule.push(myobj);
                                          myfinalobj.initialAval = myfinalschedule;
                                          myfinalobj.currentAval = myfinalschedule;
                                          var schedulecreate = new ScheduleModel(myfinalobj);
                                          schedulecreate.save(function(err, items) {
                                              if (err) {
                                                  res.send(400);
                                              }
                                          });
                                     } 

                                  } 
        
                           }//for loop close
             
                      callbackschedule();

                    }, function(err) {
                        done();
                    });
                }
            ], function(err) {
                res.send(200);
            }); 

        },
        
        loadRoomBasedOnRoomType:function(req,res){
            if(req.query.roomTypeRooms){
               var roomTypeRoomSelected = req.query.roomTypeRooms;
            }else{
                 var roomTypeRoomSelected = 'undefined';
            }
            RoomsSchemaModel.find({roomtype : req.query.roomTypeRooms}).populate('roomtype').populate('spaceId').exec(function (err, roomTypeRooms) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the roomTypeRooms'
                    });
                }
                res.json(roomTypeRooms);
            });
        },
        
        //API for loading roomtypes,rooms and storing those in a array
         /* fetchRoomsBasedOnRoomType:function(req,res){
        	  
        	  var requiredRoomsTypesList=[{}];
        	  var requiredRoomsList=[{}];
        	  var requiredRoomTypes=[];
        	  var requiredRooms=[];
        	  RoomtypeModel.find({}, function(err, items) {
                  if (err) {
                      res.send(400);
                  } 
                  //res.json(items);
                  else{
                   requiredRoomTypes=items;
                  console.log("++++++++++++++in room type++++++++++++++++++++++++++");
            	  console.log(requiredRoomTypes);
            	  RoomsSchemaModel.find({}, function(err, rooms) {
            		  //console.log("in room ss===============");
                      if (err) {
                          res.send(400);
                      } 
                     // res.json(items,rooms);
                      //console.log(rooms);
                      else{
                      requiredRooms =rooms;
                      //console.log("++++++++++++++in rooms++++++++++++++++++++++++++");
                      //console.log(requiredRooms);
                     // res.json(items,rooms);
                      
                      for(var i=0;i<requiredRoomTypes.length;i++){
                    	  //console.log(requiredRoomTypes[i]._id);
                    	  var requiredObject={};
                    	  requiredObject.roomType=requiredRoomTypes[i].name;
                    	  console.log(requiredObject.roomType);
                    	  for(var j=0;j<requiredRooms.length;j++){
                    		  //console.log(requiredRooms[j].roomtype);
                    	//	  console.log(requiredRoomTypes.length);
                    		//  console.log(requiredRooms.length);
                    		  requiredObject.rooms=[{}];
                    		  if(requiredRoomTypes[i]._id.toString() ==requiredRooms[j].roomtype.toString()){
                    			  console.log("in iffffffffffffff");
                    			   requiredRoomsList.push({
                    			     roomType:requiredRoomTypes[i].name,
                    			     roomName:requiredRooms[j].name
                    			  });
                    			  console.log("tripohjkdhfkfhjkj");
                    	//		  console.log(requiredRoomsList);
                    			  requiredObject.rooms.push(requiredRooms);
                    			  console.log(requiredObject.rooms);
                    		  }
                    		  
                    	  }
                    	  requiredRoomsList.push(requiredObject);
                    	  console.log(requiredRoomsList);
                      }
                      res.send(requiredRoomsList);
                      }
                      });
                  }
               });
        	 
        	  
          }*/
       
        fetchRoomsBasedOnRoomType:function(req,res){
      	  
      	  var requiredRoomsTypesList=[{}];
      	  var requiredRoomsList=[{}];
      	  var requiredRoomTypes=[];
      	  var requiredRooms=[];
      	  RoomtypeModel.find({}).sort({name: 1}).exec(function(err, items) {
                if (err) {
                    res.send(400);
                } 
                else{
                 requiredRoomTypes=items;
          	     RoomsSchemaModel.find({}, function(err, rooms) {
                    if (err) {
                        res.send(400);
                    } 
                    else{
                           requiredRooms =rooms;
                           async.each(requiredRoomTypes, function(requiredRoomTypesobject, callbackroomTypes) {
                    	          var requiredObject={};
                    	          requiredObject.roomTypeID=requiredRoomTypesobject._id;
                  	              requiredObject.roomType=requiredRoomTypesobject.name;
                  	              async.each(requiredRooms, function(requiredRoomsobject, callbackRooms) {
                  	            	 requiredObject.rooms=[{}];
                  	    	            if(requiredRoomTypesobject._id.toString() ==requiredRoomsobject.roomtype.toString()){
                  	    	            	for(var i=0;i<requiredRooms.length;i++){
                  	    	            		requiredObject.rooms.push({
                    			                	  id:requiredRooms[i]._id,
                    			                	  name:requiredRooms[i].name
                    			                  });
                  	    	            	}
                  			                  
                  		                 }
                  	    	             callbackRooms();
                                    }, function(err) {
                    	                     requiredRoomsList.push(requiredObject);
                    	                     callbackroomTypes();
                                       });
                                   }, function(err) {
                    	                   res.send(requiredRoomsList);
                                     });
                            }
                    });
                }
             });
      	 
        },
        loadRoomBasedOnStatus:function(req,res){
           var roomStatus = new RegExp('^' + req.query.status + '$', "i");
          if(req.query.status == 'All'){
            var querySelected = {};
          }else{
            var querySelected = {'status': roomStatus };
          }

            RoomsSchemaModel.find(querySelected).deepPopulate(['spaceId', 'spaceId.space_type']).populate("roomtype","").populate("createdBy","").exec(function (err, docs) {
               if (err) {
                    logger.log('error', 'GET '+req._parsedUrl.pathname+' Fetching all rooms is failed '+err+'');
                    res.send(400);
                } else {  
                    logger.log('info', 'GET '+req._parsedUrl.pathname+' Fetching all rooms is successful');  
                    res.send(docs);
                }
                     
              });
        },
        getAllRoomsSortByPrice: function(req, res) {
        	console.log(req);
            var priceSorting = req.query.selectedPrice;
            priceSorting = parseInt(priceSorting);
            var roomsList = req.query.rooms;
            RoomsSchemaModel.find({}, function(err, roomsList) {
                if (err) {
                    res.send(400);
                } else {
                    res.send(roomsList);
                }
            }).sort({
                pricePerhour: priceSorting
            });
        },
        getAllRoomsSortByRating: function(req, res) {
        	console.log(req);
            var rateSorting = req.query.selectedRating;
            rateSorting = parseInt(rateSorting);
            RoomsSchemaModel.find({}, function(err, items) {
                if (err) {
                    res.send(400);
                } else {
                    res.send(items);
                }
            }).sort({
                avgRating: rateSorting
            });
        }
        
        
        
    };
};