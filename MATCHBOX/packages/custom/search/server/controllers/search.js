
'use strict';

/**
 * Module dependencies.
 */
require('../../../search/server/models/search.js');
require('../../../rooms/server/models/roomtypes.js');
require('../../../virtualOffice/server/models/virtualOffice.js');

var mongoose = require('mongoose'),
	Schedule = mongoose.model('Schedule'),
	Rooms =  mongoose.model('Rooms'),
	RoomType = mongoose.model('Roomstype'),
	VirtualOffice = mongoose.model('virtualOffice'),
	searchRadius= 10,
	distanceMultiplier = 6371,
	async = require('async'),
	_ = require('lodash'),
	scheduler = require('../../../booking/server/controllers/scheduler.js');


function mmddyyyy(stringDate) {
	var date = new Date(stringDate);
	var yyyy = date.getFullYear().toString();
	var mm = (date.getMonth()+1).toString(); // getMonth() is zero-based
	var dd  = date.getDate().toString();
	return (mm[1]?mm:"0"+mm[0]) + '/' + (dd[1]?dd:"0"+dd[0]) + '/' + yyyy; // padding
};

function dateDifference(fromDate, toDate){
	var date1 = new Date(fromDate);
	var date2 = new Date(toDate);
	var timeDiff = Math.abs(date2.getTime() - date1.getTime());
	var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
	return diffDays + 1;
}

function checkAvailability(req, res, schedule) {

	if(req.body.capacity){
		if((schedule.room.capacity <= req.body.capacity.max) && (schedule.room.capacity >= req.body.capacity.min)){
			if(req.body.ratings){
				var counter = 0;
				for(var j=0; j< req.body.ratings.length ; j++){
					if(req.body.ratings[j] == schedule.room.avgRating){
						counter++
					}
				}
				if(counter > 0){
					if(req.body.amenities){
						var counter1 = 0;
						for(var k=0; k< req.body.amenities.length ; k++){
							for(var n=0; n< schedule.room.amenities.length ; n++){
								//console.log(schedule.room.amenities[n]);
								if(req.body.amenities[k] == schedule.room.amenities[n].amenityId){
									counter1++
								}
							}
						}
						if(counter1 == req.body.amenities.length){
							return results.push(schedule.room);
						}
					}
					else{
						return results.push(schedule.room);
					}

				}
			}else if(req.body.amenities){
				var counter1 = 0;
				for(var k=0; k< req.body.amenities.length ; k++){
					for(var n=0; n< schedule.room.amenities.length ; n++){
						//console.log(schedule.room.amenities[n]);
						if(req.body.amenities[k] == schedule.room.amenities[n].amenityId){
							counter1++
						}
					}
				}
				if(counter1 == req.body.amenities.length){
					return results.push(schedule.room);
				}


			}
			else{
				return results.push(schedule.room);
			}
		}
	}
	else if(req.body.ratings){
		var counter = 0;
		for(var j=0; j< req.body.ratings.length ; j++){
			if(req.body.ratings[i] == schedule.room.avgRating){
				counter++;
			}
		}
		if(counter > 0){
			if(req.body.amenities){
				var counter1 = 0;
				for(var k=0; k< req.body.amenities.length ; k++){
					for(var n=0; n< schedule.room.amenities.length ; n++){
						//console.log(schedule.room.amenities[n]);
						if(req.body.amenities[k] == schedule.room.amenities[n].amenityId){
							counter1++
						}
					}
				}
				if(counter1 == req.body.amenities.length){
					return results.push(schedule.room);
				}


			}
			else{
				return results.push(schedule.room);
			}
		}
	}else if(req.body.amenities){
		var counter1 = 0;
		for(var k=0; k< req.body.amenities.length ; k++){
			for(var n=0; n< schedule.room.amenities.length ; n++){
				//console.log(schedule.room.amenities[n]);
				if(req.body.amenities[k] == schedule.room.amenities[n].amenityId){
					counter1++
				}
			}
		}
		if(counter1 == req.body.amenities.length){
			return results.push(schedule.room);
		}


	}
	else{
		return results.push(schedule.room);
	}
};

function searchEventCalendarHotDesk(req, res, searchRadius, perPage, skipCount, locationArr){
	var fromDate = req.body.fromDate;
	var spaceId = req.body.spaceId;
	/*var dateDiff = dateDifference(req.body.fromDate, req.body.endDate);*/
	/*var dateDiff = req.body.fromToDates.length;*/
	var dateList = [], scheduleList = [], matchedSchedule = [], dateDiff;
	var counter = 0;
	var result = {};
	var roomArray = [];
	/*for(var i = 0; i < dateDiff; i++){
		dateList.push(i);
	}*/
	
	async.waterfall([ function(done) {
		scheduler.calculateDateRange(req.body, function(err, results) {
			if(err) {
				return res.status(500).json({
					error: 'Error while returning value from async waterfall in node module. ' + err
				});
			} 
			var filteredDate = results;
			done(null, filteredDate);
		});
		
	}, function (filteredDate, done) {
		console.log(filteredDate);
		console.log('----------');
		scheduler.dateArrayWithUTCTime(filteredDate, req.body, function(err, results) {
			if(err) {
				return res.status(500).json({
					error: 'Error while returning value from async waterfall in node module. ' + err
				});
			} 
			dateList = results;
			done(null, dateList);
		});
		
	}, function (dateList, done) {
		console.log(dateList);
		console.log('----------');
		dateDiff = dateList.length;
		async.eachSeries(dateList, function(dateObj, callback1) {
			fromDate = dateObj;
			var dateObj = {};
			var currentStartDateTime = fromDate.startDateTime;
			var currentEndDateTime = fromDate.endDateTime;
			
			/*fromDate = new Date(fromDate);
			fromDate = fromDate.setDate(fromDate.getDate() + 1);
			fromDate = mmddyyyy(fromDate);*/
			
			currentStartDateTime = new Date(currentStartDateTime);
			currentEndDateTime = new Date(currentEndDateTime);
			
			Schedule.aggregate().near({ 
				near: locationArr,
				distanceField: "dist.calculated", // required
				spherical:true, 
				maxDistance: parseFloat(searchRadius)/3959,
				includeLocs: "dist.location",
				query: {
					'currentAval' : {
						$elemMatch : {
							'startTime':{ $lte: new Date(currentStartDateTime) },
							'endTime':{ $gte: new Date(currentEndDateTime) },
							'isBlocked': false
						}
					}
				}
			}).exec(function(err,docs) {
				if (err) {
					res.json({'code': '0001', 'msg': err});
				} else {
					Schedule.populate( docs, [{ path: 'room' }], function(err, schedules) {
						if (err) {
							res.json({'code': '0002', 'msg': err});
						} else {
							console.log(schedules.length);
							
							if(schedules.length > 0){
								counter++;
								for(var i = 0; i < schedules.length; i++){
									if(schedules[i].room) {
										console.log(schedules[i]._id);
										console.log(schedules[i].room._id);
										console.log('------------------');
										scheduleList.push(schedules[i].room._id);
									}
								}
								
								if(counter === dateDiff){
			                    	matchedSchedule = scheduleList;
			                    	var distinctScheduleList = [], commonScheduleList = []; 
			                    	
			                    	var counts = {};
								    var matchedScheduleArray = [];
								    for(var i = 0; i < matchedSchedule.length; i++) {
								        var num = matchedSchedule[i];
								        counts[num] = counts[num] ? counts[num]+1 : 1;
								    }
								    
								    for(var i = 0; i < matchedSchedule.length; i++){
							    	   /*console.log(matchedSchedule[i] + ' : ' + counts[matchedSchedule[i]]);*/
							    	   
							    	   if(counts[matchedSchedule[i]] === dateDiff){
							    		   matchedScheduleArray.push(matchedSchedule[i]);
							    	   }
							    	}
								    matchedSchedule = [];
								    matchedSchedule = matchedScheduleArray;
								    /*console.log(matchedSchedule);*/
			                    	
								    for(var i = 0; i < matchedSchedule.length; i++){
							            var isDistinct = false;
							            for(var j = 0; j < i; j++){
							                if(JSON.stringify(matchedSchedule[i]) === JSON.stringify(matchedSchedule[j])){
							                    isDistinct = true;
							                }
							            }
							            if(!isDistinct){
							            	distinctScheduleList.push(matchedSchedule[i]);
							            } else {
						                    commonScheduleList.push(matchedSchedule[i]);
							            }
							        }
								    
									var query = {};
									var roomIds = [];
									for(var i = 0; i < distinctScheduleList.length; i++){
										roomIds.push(distinctScheduleList[i]);
									}
									
									query._id = {
										$in: roomIds
									};
									
									query.spaceId = req.body.spaceId;
									
									var roomTypeQuery = {
										'name' : new RegExp('^' + req.body.roomType + '$', "i")
									};
									
									RoomType.findOne(roomTypeQuery, function(err, roomType) {
										if(err){
											res.json({'code': '0001', 'msg': err});
										}
											
										query.roomtype = roomType._id;
									
										if(req.body.price){
											query.pricePerhour = {$gte: req.body.price.min,$lte:req.body.price.max};
										}
										if(req.body.pricePerhalfday){
											query.halfDayPrice = {$gte: req.body.price.min,$lte:req.body.price.max};
										}
										if(req.body.pricePerfullday){
											query.fullDayPrice = {$gte: req.body.price.min,$lte:req.body.price.max};
										}
				
										/*if(req.body.capacity){
											query.capacity = {$gte: req.body.capacity.min ,$lte: req.body.capacity.max};
										}*/
				
										/*if(req.body.ratings){
											query.avgRating = {
												$in: req.body.ratings
											};
										}*/
										
										if(req.body.amenities){
											console.log(req.body.amenities);
											/*query.amenities = {
												$elemMatch : {
													amenityId : { $in: req.body.amenities }
												}
											};*/
											query.$and = req.body.amenities;
										}
										
										var priceSortQuery = {};
									    var ratingSortQuery = {};

									    if(req.body.priceSortObj){
										    if(req.body.priceSortObj.timeType === 'Per Hour'){
										    	priceSortQuery = {
										    		pricePerhour: parseInt(req.body.priceSortObj.priceSort)
										    	}
										    } else if(req.body.priceSortObj.timeType === 'Half Day'){
										    	priceSortQuery = {
										    		pricePerhalfday: parseInt(req.body.priceSortObj.priceSort)
										    	}
										    } else if(req.body.priceSortObj.timeType === 'Full Day'){
										    	priceSortQuery = {
										    		pricePerfullday: parseInt(req.body.priceSortObj.priceSort)
										    	}
										    }
									    }
										
										console.log(query);
										if(req.body.selectedPrice){
											Rooms.find(query).limit(perPage).skip(skipCount).sort(priceSortQuery).exec(function(err, rooms) {
												if (err) {
													return res.status(500).json({
														error : 'Can not load rooms'
													});
												} else { 
													Rooms.populate( rooms, [{ path: 'spaceId' , select: 'name address1 address2 phone city locality state postal_code country partner service_tax'}], function(err, roomlist) {
														if(err){
															return res.status(500).json({
																error : 'Can not load rooms'
															});
														}
														
														result.rooms = [];
														result.rooms = roomlist;
														res.json(result);
														callback1();
														
													});
												}
											});/*.sort({
								                pricePerhour: priceSorting
								            });*/
										} else {
											Rooms.find(query).limit(perPage).skip(skipCount).sort(priceSortQuery).exec(function(err, rooms) {
												if (err) {
													return res.status(500).json({
														error : 'Can not load rooms'
													});
												} else { 
													Rooms.populate( rooms, [{ path: 'spaceId' , select: 'name address1 address2 phone city locality state postal_code country partner service_tax'}], function(err, roomlist) {
														if(err){
															return res.status(500).json({
																error : 'Can not load rooms'
															});
														}
														
														result.rooms = [];
														result.rooms = roomlist;
														res.json(result);
														callback1();
														
													});
												}
											});
										}
									});
								} else {
									callback1();
								}
				                	
							} else {
								res.jsonp({"code": "2904" ,"msg": "Search result not found"});
							}    
						}
					});
				}
			});
		}); // async each series ends
		
	} ], function(err, result) {
		if(err) {
			return res.status(500).json({
				error: 'Error in async waterfall in getting dates. ' + err
			});
		} 
		/*return result;*/
	});
};

function searchHotDesk(req, res, searchRadius, perPage, skipCount, locationArr){
	var fromDate = req.body.fromDate;
	/*var dateDiff = dateDifference(req.body.fromDate, req.body.endDate);*/
	/*var dateDiff = req.body.fromToDates.length;*/
	var dateList = [], scheduleList = [], matchedSchedule = [], dateDiff;
	var counter = 0;
	var result = {};
	var roomArray = [];
	/*for(var i = 0; i < dateDiff; i++){
		dateList.push(i);
	}*/
	
	async.waterfall([ function(done) {
		scheduler.calculateDateRange(req.body, function(err, results) {
			if(err) {
				return res.status(500).json({
					error: 'Error while returning value from async waterfall in node module. ' + err
				});
			} 
			var filteredDate = results;
			done(null, filteredDate);
		});
		
	}, function (filteredDate, done) {
		console.log(filteredDate);
		console.log('----------');
		scheduler.dateArrayWithUTCTime(filteredDate, req.body, function(err, results) {
			if(err) {
				return res.status(500).json({
					error: 'Error while returning value from async waterfall in node module. ' + err
				});
			} 
			dateList = results;
			done(null, dateList);
		});
		
	}, function (dateList, done) {
		console.log(dateList);
		console.log('----------');
		dateDiff = dateList.length;
		async.eachSeries(dateList, function(dateObj, callback1) {
			fromDate = dateObj;
			var dateObj = {};
			var currentStartDateTime = fromDate.startDateTime;
			var currentEndDateTime = fromDate.endDateTime;
			
			/*fromDate = new Date(fromDate);
			fromDate = fromDate.setDate(fromDate.getDate() + 1);
			fromDate = mmddyyyy(fromDate);*/
			
			currentStartDateTime = new Date(currentStartDateTime);
			currentEndDateTime = new Date(currentEndDateTime);
			
			Schedule.aggregate().near({ 
				near: locationArr,
				distanceField: "dist.calculated", // required
				spherical:true, 
				maxDistance: parseFloat(searchRadius)/3959,
				includeLocs: "dist.location",
				query: {
					'currentAval' : {
						$elemMatch : {
							'startTime':{ $lte: new Date(currentStartDateTime) },
							'endTime':{ $gte: new Date(currentEndDateTime) },
							'isBlocked': false
						}
					}
				}
			}).exec(function(err,docs) {
				if (err) {
					res.json({'code': '0001', 'msg': err});
				} else {
					Schedule.populate( docs, [{ path: 'room' }], function(err, schedules) {
						if (err) {
							res.json({'code': '0002', 'msg': err});
						} else {
							console.log(schedules.length);
							
							if(schedules.length > 0){
								counter++;
								for(var i = 0; i < schedules.length; i++){
									if(schedules[i].room) {
										console.log(schedules[i]._id);
										console.log(schedules[i].room._id);
										console.log('------------------');
										scheduleList.push(schedules[i].room._id);
									}
								}
								
								if(counter === dateDiff){
			                    	matchedSchedule = scheduleList;
			                    	var distinctScheduleList = [], commonScheduleList = []; 
			                    	
			                    	var counts = {};
								    var matchedScheduleArray = [];
								    for(var i = 0; i < matchedSchedule.length; i++) {
								        var num = matchedSchedule[i];
								        counts[num] = counts[num] ? counts[num]+1 : 1;
								    }
								    
								    for(var i = 0; i < matchedSchedule.length; i++){
							    	   /*console.log(matchedSchedule[i] + ' : ' + counts[matchedSchedule[i]]);*/
							    	   
							    	   if(counts[matchedSchedule[i]] === dateDiff){
							    		   matchedScheduleArray.push(matchedSchedule[i]);
							    	   }
							    	}
								    matchedSchedule = [];
								    matchedSchedule = matchedScheduleArray;
								    /*console.log(matchedSchedule);*/
			                    	
								    for(var i = 0; i < matchedSchedule.length; i++){
							            var isDistinct = false;
							            for(var j = 0; j < i; j++){
							                if(JSON.stringify(matchedSchedule[i]) === JSON.stringify(matchedSchedule[j])){
							                    isDistinct = true;
							                }
							            }
							            if(!isDistinct){
							            	distinctScheduleList.push(matchedSchedule[i]);
							            } else {
						                    commonScheduleList.push(matchedSchedule[i]);
							            }
							        }
								    
									var query = {};
									var roomIds = [];
									for(var i = 0; i < distinctScheduleList.length; i++){
										roomIds.push(distinctScheduleList[i]);
									}
									
									query._id = {
										$in: roomIds
									};
									
									var roomTypeQuery = {
										'name' : new RegExp('^' + req.body.roomType + '$', "i")
									};
									
									RoomType.findOne(roomTypeQuery, function(err, roomType) {
										if(err){
											res.json({'code': '0001', 'msg': err});
										}
											
										query.roomtype = roomType._id;
									
										if(req.body.price){
											query.pricePerhour = {$gte: req.body.price.min,$lte:req.body.price.max};
										}
										if(req.body.pricePerhalfday){
											query.halfDayPrice = {$gte: req.body.price.min,$lte:req.body.price.max};
										}
										if(req.body.pricePerfullday){
											query.fullDayPrice = {$gte: req.body.price.min,$lte:req.body.price.max};
										}
				
										/*if(req.body.capacity){
											query.capacity = {$gte: req.body.capacity.min ,$lte: req.body.capacity.max};
										}*/
				
										if(req.body.amenities){
											console.log(req.body.amenities);
											/*query.amenities = {
												$elemMatch : {
													amenityId : { $in: req.body.amenities }
												}
											};*/
											query.$and = req.body.amenities;
										}
										
										query.loc = {
										    $nearSphere: {
										        $geometry: {
										            type: "Point",
										            coordinates: locationArr
										        },
										        $minDistance: 1000,
										        $maxDistance: 10000
										    }
										}
										
										var priceSortQuery = {};
									    var ratingSortQuery = {};

									    if(req.body.priceSortObj){
										    if(req.body.priceSortObj.timeType === 'Per Hour'){
										    	priceSortQuery = {
										    		pricePerhour: parseInt(req.body.priceSortObj.priceSort)
										    	}
										    } else if(req.body.priceSortObj.timeType === 'Half Day'){
										    	priceSortQuery = {
										    		pricePerhalfday: parseInt(req.body.priceSortObj.priceSort)
										    	}
										    } else if(req.body.priceSortObj.timeType === 'Full Day'){
										    	priceSortQuery = {
										    		pricePerfullday: parseInt(req.body.priceSortObj.priceSort)
										    	}
										    }
									    }
										
										console.log(query);
										console.log(priceSortQuery);
										if(req.body.priceSortObj){
											Rooms.find(query).sort(priceSortQuery).exec(function(err, rooms) {
												if (err) {
													return res.status(500).json({
														error : 'Can not load rooms'
													});
												} else { 
													Rooms.populate( rooms, [{ path: 'spaceId' , select: 'name address1 address2 phone city locality state postal_code country partner service_tax'}], function(err, roomlist) {
														if(err){
															return res.status(500).json({
																error : 'Can not load rooms'
															});
														}
														
														console.log(req.body.ratingSort);
										        		/*if(req.body.ratingSort &&  parseInt(req.body.ratingSort) == +1){
										        			roomlist.sort(function(a, b) {
										        				return parseFloat(a.spaceId.rating) - parseFloat(b.spaceId.rating);
										        			});
										        		}
										        		if(req.body.ratingSort &&  parseInt(req.body.ratingSort) == -1){
										        			roomlist.sort(function(a, b) {
										        				return parseFloat(b.spaceId.rating) - parseFloat(a.spaceId.rating);
										        			});
										        		}*/
														if(req.body.ratingSort &&  (req.body.ratingSort === "-R")){
										        			roomlist.sort(function(a, b) {
										        				return parseFloat(b.spaceId.rating) - parseFloat(a.spaceId.rating);
										        			});
										        		}
														
														var rooms = [], queryHotDesk = [];
														var roomI = null, roomJ = null, counter = 0,
															dummyRoomObjI = null, dummyRoomObjJ = null;
														var sameHotDesks = [];
														
														for(var i = 0; i < roomlist.length; i++){
												            var isDistinct = false;
												            dummyRoomObjI = roomlist[i].name.split('(');
															roomI = dummyRoomObjI[0].trim();
															roomI = roomlist[i].spaceId.name + roomI;
															/*roomI = roomlist[i].spaceId.name;*/
												            for(var j = 0; j < i; j++){
												            	dummyRoomObjJ = roomlist[j].name.split('(');
																roomJ = dummyRoomObjJ[0].trim();
																roomJ = roomlist[j].spaceId.name + roomJ;
																/*roomJ = roomlist[j].spaceId.name;*/
												                /*if(roomI.toUpperCase() === roomJ.toUpperCase()){
												                    isDistinct = true;
												                    break;
												                }*/
																if((roomI.toUpperCase() === roomJ.toUpperCase()) 
																		&& (dummyRoomObjI.pricePerhour === dummyRoomObjJ.pricePerhour) 
																		&& (dummyRoomObjI.pricePerhalfday === dummyRoomObjJ.pricePerhalfday) 
																		&& (dummyRoomObjI.pricePerfullday === dummyRoomObjJ.pricePerfullday)){
												                    isDistinct = true;
												                    break;
												                }
												            }
												            if(!isDistinct){
												            	queryHotDesk.push(roomlist[i]._id);
												            	rooms.push(roomlist[i]);
												            }
												        }
														
														var relatedHotDeskIds = [];
														for(var i = 0; i < rooms.length; i++){
												            dummyRoomObjI = rooms[i].name.split('(');
															roomI = dummyRoomObjI[0].trim();
															roomI = rooms[i].spaceId.name + roomI;
															/*roomI = roomlist[i].spaceId.name;*/
															relatedHotDeskIds = [];
												            for(var j = 0; j < roomlist.length; j++){
												            	dummyRoomObjJ = roomlist[j].name.split('(');
																roomJ = dummyRoomObjJ[0].trim();
																roomJ = roomlist[j].spaceId.name + roomJ;
																/*roomJ = roomlist[j].spaceId.name;*/
												                /*if(roomI.toUpperCase() === roomJ.toUpperCase()){
												                	relatedHotDeskIds.push(roomlist[j]._id);
												                }*/
																
																if((roomI.toUpperCase() === roomJ.toUpperCase()) 
																		&& (dummyRoomObjI.pricePerhour === dummyRoomObjJ.pricePerhour) 
																		&& (dummyRoomObjI.pricePerhalfday === dummyRoomObjJ.pricePerhalfday) 
																		&& (dummyRoomObjI.pricePerfullday === dummyRoomObjJ.pricePerfullday)){
																	/*var roomWantedObj = {
																			_id : roomlist[j]._id,
																			name : roomlist[j].name
																	}
																	relatedHotDeskIds.push(roomWantedObj);*/
																	relatedHotDeskIds.push(roomlist[j]._id);
																}
												            }
												            rooms[i].relatedHotDeskIds = relatedHotDeskIds;
												        }
														
														for(var i = 0; i < rooms.length; i++){
															if(rooms[i].relatedHotDeskIds.length >= req.body.capacity.max){
																roomArray.push(rooms[i]);
															}
														}
														
														/*var toIndex = parseInt(perPage) * parseInt(skipCount);
														if(roomArray.length > 0){
															if(toIndex > 0){
																roomArray = roomArray.splice(skipCount, toIndex);
															} else if(toIndex == 0){
																roomArray = roomArray.splice(skipCount, perPage);
															}
														}*/
														
														result.totalSearchedRooms = roomArray.length;
														result.dateDiff = dateDiff;
														if(roomArray.length > 0){
															roomArray = roomArray.splice(skipCount, perPage);
														}
														
														result.rooms = [];
														result.rooms = roomArray;
														res.json(result);
														callback1();
													});
												}
											});/*.sort({
								                pricePerhour: priceSorting
								            });*/
										} else {
											Rooms.find(query).sort(priceSortQuery).exec(function(err, rooms) {
												if (err) {
													return res.status(500).json({
														error : 'Can not load rooms'
													});
												} else { 
													Rooms.populate( rooms, [{ path: 'spaceId' , select: 'name address1 address2 phone city locality state postal_code country partner service_tax'}], function(err, roomlist) {
														if(err){
															return res.status(500).json({
																error : 'Can not load rooms'
															});
														}
																												
														console.log(req.body.ratingSort);
										        		/*if(req.body.ratingSort &&  parseInt(req.body.ratingSort) == +1){
										        			roomlist.sort(function(a, b) {
										        				return parseFloat(a.spaceId.rating) - parseFloat(b.spaceId.rating);
										        			});
										        		}
										        		if(req.body.ratingSort &&  parseInt(req.body.ratingSort) == -1){
										        			roomlist.sort(function(a, b) {
										        				return parseFloat(b.spaceId.rating) - parseFloat(a.spaceId.rating);
										        			});
										        		}*/
														if(req.body.ratingSort &&  (req.body.ratingSort === "-R")){
										        			roomlist.sort(function(a, b) {
										        				return parseFloat(b.spaceId.rating) - parseFloat(a.spaceId.rating);
										        			});
										        		}
														
														var rooms = [], queryHotDesk = [];
														var roomI = null, roomJ = null, counter = 0,
															dummyRoomObjI = null, dummyRoomObjJ = null;
														var sameHotDesks = [];
														
														for(var i = 0; i < roomlist.length; i++){
												            var isDistinct = false;
												            dummyRoomObjI = roomlist[i].name.split('(');
															roomI = dummyRoomObjI[0].trim();
															roomI = roomlist[i].spaceId.name + roomI;
															/*roomI = roomlist[i].spaceId.name;*/
												            for(var j = 0; j < i; j++){
												            	dummyRoomObjJ = roomlist[j].name.split('(');
																roomJ = dummyRoomObjJ[0].trim();
																roomJ = roomlist[j].spaceId.name + roomJ;
																/*roomJ = roomlist[j].spaceId.name;*/
												                /*if(roomI.toUpperCase() === roomJ.toUpperCase()){
												                    isDistinct = true;
												                    break;
												                }*/
																if((roomI.toUpperCase() === roomJ.toUpperCase()) 
																		&& (dummyRoomObjI.pricePerhour === dummyRoomObjJ.pricePerhour) 
																		&& (dummyRoomObjI.pricePerhalfday === dummyRoomObjJ.pricePerhalfday) 
																		&& (dummyRoomObjI.pricePerfullday === dummyRoomObjJ.pricePerfullday)){
												                    isDistinct = true;
												                    break;
												                }
												            }
												            if(!isDistinct){
												            	queryHotDesk.push(roomlist[i]._id);
												            	rooms.push(roomlist[i]);
												            }
												        }
														
														var relatedHotDeskIds = [];
														for(var i = 0; i < rooms.length; i++){
												            dummyRoomObjI = rooms[i].name.split('(');
															roomI = dummyRoomObjI[0].trim();
															roomI = rooms[i].spaceId.name + roomI;
															/*roomI = roomlist[i].spaceId.name;*/
															relatedHotDeskIds = [];
												            for(var j = 0; j < roomlist.length; j++){
												            	dummyRoomObjJ = roomlist[j].name.split('(');
																roomJ = dummyRoomObjJ[0].trim();
																roomJ = roomlist[j].spaceId.name + roomJ;
																/*roomJ = roomlist[j].spaceId.name;*/
												                /*if(roomI.toUpperCase() === roomJ.toUpperCase()){
												                	relatedHotDeskIds.push(roomlist[j]._id);
												                }*/
																if((roomI.toUpperCase() === roomJ.toUpperCase()) 
																		&& (dummyRoomObjI.pricePerhour === dummyRoomObjJ.pricePerhour) 
																		&& (dummyRoomObjI.pricePerhalfday === dummyRoomObjJ.pricePerhalfday) 
																		&& (dummyRoomObjI.pricePerfullday === dummyRoomObjJ.pricePerfullday)){
																	/*var roomWantedObj = {
																			_id : roomlist[j]._id,
																			name : roomlist[j].name
																	}
																	relatedHotDeskIds.push(roomWantedObj);*/
																	relatedHotDeskIds.push(roomlist[j]._id);
																}
												            }
												            rooms[i].relatedHotDeskIds = relatedHotDeskIds;
												        }
														
														for(var i = 0; i < rooms.length; i++){
															if(rooms[i].relatedHotDeskIds.length >= req.body.capacity.max){
																roomArray.push(rooms[i]);
															}
														}
														
														/*var toIndex = parseInt(perPage) * parseInt(skipCount);
														if(roomArray.length > 0){
															if(toIndex > 0){
																roomArray = roomArray.splice(skipCount, toIndex);
															} else if(toIndex == 0){
																roomArray = roomArray.splice(skipCount, perPage);
															}
														}*/
														
														result.totalSearchedRooms = roomArray.length;
														result.dateDiff = dateDiff;
														if(roomArray.length > 0){
															roomArray = roomArray.splice(skipCount, perPage);
														}
														
														result.rooms = [];
														result.rooms = roomArray;
														res.json(result);
														callback1();
													});
												}
											});
										}
									});
								} else {
									callback1();
								}
				                	
							} else {
								res.jsonp({"code": "2904" ,"msg": "Search result not found"});
							}    
						}
					});
				}
			});
		}); // async each series ends
		
	} ], function(err, result) {
		if(err) {
			return res.status(500).json({
				error: 'Error in async waterfall in getting dates. ' + err
			});
		} 
		/*return result;*/
	});
};

function searchTrainingRoom(req, res, searchRadius, perPage, skipCount, locationArr){
	var fromDate = req.body.fromDate;
	/*var dateDiff = dateDifference(req.body.fromDate, req.body.endDate);*/
	/*var dateDiff = req.body.fromToDates.length;*/
	var dateList = [], scheduleList = [], matchedSchedule = [], dateDiff;
	var counter = 0;
	var result = {};
	var roomArray = [];
	/*for(var i = 0; i < dateDiff; i++){
		dateList.push(i);
	}*/
	
	async.waterfall([ function(done) {
		scheduler.calculateDateRange(req.body, function(err, results) {
			if(err) {
				return res.status(500).json({
					error: 'Error while returning value from async waterfall in node module. ' + err
				});
			} 
			var filteredDate = results;
			done(null, filteredDate);
		});
		
	}, function (filteredDate, done) {
		console.log(filteredDate);
		console.log('----------');
		scheduler.dateArrayWithUTCTime(filteredDate, req.body, function(err, results) {
			if(err) {
				return res.status(500).json({
					error: 'Error while returning value from async waterfall in node module. ' + err
				});
			} 
			dateList = results;
			done(null, dateList);
		});
		
	}, function (dateList, done) {
		console.log(dateList);
		console.log('----------');
		dateDiff = dateList.length;
		async.eachSeries(dateList, function(dateObj, callback1) {
			fromDate = dateObj;
			var dateObj = {};
			var currentStartDateTime = fromDate.startDateTime;
			var currentEndDateTime = fromDate.endDateTime;
			
			/*fromDate = new Date(fromDate);
			fromDate = fromDate.setDate(fromDate.getDate() + 1);
			fromDate = mmddyyyy(fromDate);*/
			
			currentStartDateTime = new Date(currentStartDateTime);
			currentEndDateTime = new Date(currentEndDateTime);
			
			Schedule.aggregate().near({ 
				near: locationArr,
				distanceField: "dist.calculated", // required
				spherical:true, 
				maxDistance: parseFloat(searchRadius)/3959,
				includeLocs: "dist.location",
				query: {
					'currentAval' : {
						$elemMatch : {
							'startTime':{ $lte: new Date(currentStartDateTime) },
							'endTime':{ $gte: new Date(currentEndDateTime) },
							'isBlocked': false
						}
					}
				}
			}).exec(function(err,docs) {
				if (err) {
					res.json({'code': '0001', 'msg': err});
				} else {
					Schedule.populate( docs, [{ path: 'room' }], function(err, schedules) {
						if (err) {
							res.json({'code': '0002', 'msg': err});
						} else {
							console.log(schedules.length);
							
							if(schedules.length > 0){
								counter++;
								for(var i = 0; i < schedules.length; i++){
									if(schedules[i].room) {
										console.log(schedules[i]._id);
										console.log(schedules[i].room._id);
										console.log('------------------');
										scheduleList.push(schedules[i].room._id);
									}
								}
								
								if(counter === dateDiff){
			                    	matchedSchedule = scheduleList;
			                    	var distinctScheduleList = [], commonScheduleList = []; 
			                    	
			                    	var counts = {};
								    var matchedScheduleArray = [];
								    for(var i = 0; i < matchedSchedule.length; i++) {
								        var num = matchedSchedule[i];
								        counts[num] = counts[num] ? counts[num]+1 : 1;
								    }
								    
								    for(var i = 0; i < matchedSchedule.length; i++){
							    	   /*console.log(matchedSchedule[i] + ' : ' + counts[matchedSchedule[i]]);*/
							    	   
							    	   if(counts[matchedSchedule[i]] === dateDiff){
							    		   matchedScheduleArray.push(matchedSchedule[i]);
							    	   }
							    	}
								    matchedSchedule = [];
								    matchedSchedule = matchedScheduleArray;
								    /*console.log(matchedSchedule);*/
			                    	
								    for(var i = 0; i < matchedSchedule.length; i++){
							            var isDistinct = false;
							            for(var j = 0; j < i; j++){
							                if(JSON.stringify(matchedSchedule[i]) === JSON.stringify(matchedSchedule[j])){
							                    isDistinct = true;
							                }
							            }
							            if(!isDistinct){
							            	distinctScheduleList.push(matchedSchedule[i]);
							            } else {
						                    commonScheduleList.push(matchedSchedule[i]);
							            }
							        }
								    
									var query = {};
									var roomIds = [];
									for(var i = 0; i < distinctScheduleList.length; i++){
										roomIds.push(distinctScheduleList[i]);
									}
									
									query._id = {
										$in: roomIds
									};
									
									var roomTypeQuery = {
										'name' : new RegExp('^' + req.body.roomType + '$', "i")
									};
									
									RoomType.findOne(roomTypeQuery, function(err, roomType) {
										if(err){
											res.json({'code': '0001', 'msg': err});
										}
											
										query.roomtype = roomType._id;
									
										if(req.body.price){
											query.pricePerhour = {$gte: req.body.price.min,$lte:req.body.price.max};
										}
										if(req.body.pricePerhalfday){
											query.halfDayPrice = {$gte: req.body.price.min,$lte:req.body.price.max};
										}
										if(req.body.pricePerfullday){
											query.fullDayPrice = {$gte: req.body.price.min,$lte:req.body.price.max};
										}
				
										if(req.body.capacity){
											query.capacity = {$gte: req.body.capacity.min ,$lte: req.body.capacity.max};
										}
										
										/*if(req.body.ratings){
											query.avgRating = {
												$in: req.body.ratings
											};
										}*/
										
										if (req.body.amenities) {
											console.log(req.body.amenities);
											query.$and = req.body.amenities;
										}
										
										query.loc = {
										    $nearSphere: {
										        $geometry: {
										            type: "Point",
										            coordinates: locationArr
										        },
										        $minDistance: 1000,
										        $maxDistance: 10000
										    }
										}

										var priceSortQuery = {};
										var ratingSortQuery = {};

										if(req.body.priceSortObj){
											if(req.body.priceSortObj.timeType === 'Per Hour'){
										    	priceSortQuery = {
										    		pricePerhour: parseInt(req.body.priceSortObj.priceSort)
										    	}
										    } else if(req.body.priceSortObj.timeType === 'Half Day'){
										    	priceSortQuery = {
										    		pricePerhalfday: parseInt(req.body.priceSortObj.priceSort)
										    	}
										    } else if(req.body.priceSortObj.timeType === 'Full Day'){
										    	priceSortQuery = {
										    		pricePerfullday: parseInt(req.body.priceSortObj.priceSort)
										    	}
										    }
										}
										
										console.log(query);
										if(req.body.selectedPrice){
											Rooms.find(query).limit(perPage).skip(skipCount).sort(priceSortQuery).exec(function(err, rooms) {
												if (err) {
													return res.status(500).json({
														error : 'Can not load rooms'
													});
												} else { 
													Rooms.populate( rooms, [{ path: 'spaceId' , select: 'name address1 address2 phone city locality state postal_code country service_tax'}], function(err, roomlist) {
														if(err){
															return res.status(500).json({
																error : 'Can not load rooms'
															});
														}
														
														console.log(req.body.ratingSort);
										        		/*if(req.body.ratingSort &&  parseInt(req.body.ratingSort) == +1){
										        			roomlist.sort(function(a, b) {
										        				return parseFloat(a.spaceId.rating) - parseFloat(b.spaceId.rating);
										        			});
										        		}
										        		if(req.body.ratingSort &&  parseInt(req.body.ratingSort) == -1){
										        			roomlist.sort(function(a, b) {
										        				return parseFloat(b.spaceId.rating) - parseFloat(a.spaceId.rating);
										        			});
										        		}*/
														if(req.body.ratingSort &&  (req.body.ratingSort === "-R")){
										        			roomlist.sort(function(a, b) {
										        				return parseFloat(b.spaceId.rating) - parseFloat(a.spaceId.rating);
										        			});
										        		}
														
										        		Rooms.count(query).exec(function(err, countedRoom) {
															if (err) {
																return res.status(500).json({
																	error : err
																});
															}
															result.rooms = [];
															result.rooms = roomlist;
															result.totalSearchedRooms = countedRoom;
															result.dateDiff = dateDiff;
															res.json(result);
															callback1();
										        		});
													});
												}
											});/*.sort({
								                pricePerhour: priceSorting
								            })*/
										} else {
											Rooms.find(query).limit(perPage).skip(skipCount).sort(priceSortQuery).exec(function(err, rooms) {
												if (err) {
													return res.status(500).json({
														error : 'Can not load rooms'
													});
												} else { 
													Rooms.populate( rooms, [{ path: 'spaceId' , select: 'name address1 address2 phone city locality state postal_code country service_tax'}], function(err, roomlist) {
														if(err){
															return res.status(500).json({
																error : 'Can not load rooms'
															});
														}
														
														console.log(req.body.ratingSort);
										        		/*if(req.body.ratingSort &&  parseInt(req.body.ratingSort) == +1){
										        			roomlist.sort(function(a, b) {
										        				return parseFloat(a.spaceId.rating) - parseFloat(b.spaceId.rating);
										        			});
										        		}
										        		if(req.body.ratingSort &&  parseInt(req.body.ratingSort) == -1){
										        			roomlist.sort(function(a, b) {
										        				return parseFloat(b.spaceId.rating) - parseFloat(a.spaceId.rating);
										        			});
										        		}*/
														if(req.body.ratingSort &&  (req.body.ratingSort === "-R")){
										        			roomlist.sort(function(a, b) {
										        				return parseFloat(b.spaceId.rating) - parseFloat(a.spaceId.rating);
										        			});
										        		}
														
										        		Rooms.count(query).exec(function(err, countedRoom) {
															if (err) {
																return res.status(500).json({
																	error : err
																});
															}
															result.rooms = [];
															result.rooms = roomlist;
															result.totalSearchedRooms = countedRoom;
															result.dateDiff = dateDiff;
															res.json(result);
															callback1();
										        		});
													});
												}
											});
										}
									});
								} else {
									callback1();
								}
				                	
							} else {
								res.jsonp({"code": "2904" ,"msg": "Search result not found"});
							}    
						}
					});
				}
			});
		}); // async each series ends
		
	} ], function(err, result) {
		if(err) {
			return res.status(500).json({
				error: 'Error in async waterfall in getting dates. ' + err
			});
		} 
		/*return result;*/
	});
};




function searchMeetingRoom(req, res, searchRadius, perPage, skipCount, locationArr) {
	Schedule.aggregate().near({ 
		near: locationArr,
		distanceField: "dist.calculated", // required
		spherical:true, 
		maxDistance: parseFloat(searchRadius)/distanceMultiplier,
		includeLocs: "dist.location",
		query: {
			'currentAval' : {
				$elemMatch: {
					'startTime':{$lte: new Date(req.body.stime)},
					'endTime':{$gte: new Date(req.body.etime)},
					'isBlocked': false
				}
			}
		}
	}).exec(function(err,docs) {
		if (err) {
			res.json({'code': '0001', 'msg': err});
		} else {
			var query = {} ;
			var roomIds = [];
			for(var i=0; i< docs.length; i++){
				roomIds.push(docs[i].room);
			}
			
			query._id = {
				$in: roomIds
			};
			
			
			var roomTypeQuery = {
				'name' : new RegExp('^' + req.body.roomType + '$', "i")
			};
			
			RoomType.findOne(roomTypeQuery, function(err, roomType) {
				if(err){
					res.json({'code': '0001', 'msg': err});
				}
					
					
				query.roomtype = roomType._id;
				
				if(req.body.price){
					query.pricePerhour = {$gte: req.body.price.min,$lte:req.body.price.max};
				}
				if(req.body.pricePerhalfday){
					query.halfDayPrice = {$gte: req.body.price.min,$lte:req.body.price.max};
				}
				if(req.body.pricePerfullday){
					query.fullDayPrice = {$gte: req.body.price.min,$lte:req.body.price.max};
				}
	
				if(req.body.capacity){
					query.capacity = {$gte: req.body.capacity.min ,$lte: req.body.capacity.max};
				}
	
				/*if(req.body.ratings){
					query.avgRating = {
						$in: req.body.ratings
					};
				}*/
	
				if(req.body.amenities){
					console.log(req.body.amenities);
					/*query.amenities = {
						$elemMatch : {
							amenityId : { $in: req.body.amenities }
						}
					};*/
					query.$and = req.body.amenities;
				}
				
				query.loc = {
				    $nearSphere: {
				        $geometry: {
				            type: "Point",
				            coordinates: locationArr
				        },
				        $minDistance: 1000,
				        $maxDistance: 10000
				    }
				}
				
				var priceSortQuery = {};
			    var ratingSortQuery = {};
			    
			    if(req.body.priceSortObj){
				    if(req.body.priceSortObj.timeType === 'Per Hour'){
				    	priceSortQuery = {
				    		pricePerhour: parseInt(req.body.priceSortObj.priceSort)
				    	}
				    } else if(req.body.priceSortObj.timeType === 'Half Day'){
				    	priceSortQuery = {
				    		pricePerhalfday: parseInt(req.body.priceSortObj.priceSort)
				    	}
				    } else if(req.body.priceSortObj.timeType === 'Full Day'){
				    	priceSortQuery = {
				    		pricePerfullday: parseInt(req.body.priceSortObj.priceSort)
				    	}
				    } 
			    }

			    Rooms.find(query).limit(perPage).skip(skipCount).sort(priceSortQuery).exec(function(err, rooms) {
			        if (err) {
			        	return res.status(500).json({
			        		error : 'Cannot load rooms',
			        		errorInfo : err
			        	});
			        } else {
			        	Rooms.populate( rooms, [{ path: 'spaceId' , select: 'name address1 address2 phone city locality state postal_code country rating service_tax'}], function(err, roomlist) {
			        		if(err){
			        			return res.status(500).json({
			        				error : 'Cannot load rooms'
			        			});
			        		}
			          
			        		console.log(req.body.ratingSort);
			        		/*if(req.body.ratingSort &&  parseInt(req.body.ratingSort) == +1){
			        			roomlist.sort(function(a, b) {
			        				return parseFloat(a.spaceId.rating) - parseFloat(b.spaceId.rating);
			        			});
			        		}
			        		if(req.body.ratingSort &&  parseInt(req.body.ratingSort) == -1){
			        			roomlist.sort(function(a, b) {
			        				return parseFloat(b.spaceId.rating) - parseFloat(a.spaceId.rating);
			        			});
			        		}*/
			        		if(req.body.ratingSort &&  (req.body.ratingSort === "-R")){
			        			roomlist.sort(function(a, b) {
			        				return parseFloat(b.spaceId.rating) - parseFloat(a.spaceId.rating);
			        			});
			        		}			        		
			        		
			        		var result = {};
			        		Rooms.count(query).exec(function(err, countedRoom) {
								if (err) {
									return res.status(500).json({
										error : err
									});
								}
								result.rooms = [];
								result.rooms = roomlist;
								result.totalSearchedRooms = countedRoom;
								res.json(result);
			        		});
				        });
			        }
			    });
			});	
		}
	});
}


/**
 * Search virtual office
 */

function searchVirtualOffice(req, res, searchRadius, perPage, skipCount, locationArr) {
	console.log(req.body);
	console.log(new Date(req.body.stime));
	VirtualOffice.aggregate().near({ 
		near: locationArr,
		distanceField: "dist.calculated", // required
		spherical:true, 
		maxDistance: parseFloat(searchRadius)/distanceMultiplier,
		includeLocs: "dist.location",
	}).limit(perPage).skip(skipCount).exec(function(err,docs) {
		if (err) {
			res.json({'code': '0001', 'msg': err});
		} else {
			

			VirtualOffice.populate( docs, [{ path: 'spaceId' , select: 'name address1 address2 phone city locality state postal_code country service_tax'}], function(err, virtualRoomsList) {
				if(err){
					return res.status(500).json({
						error : 'Cannot load rooms'
					});
				}
				var result = {};
				result.rooms= [];
				result.rooms = virtualRoomsList;
				result.searchRadius = searchRadius;
				res.json(result);
				console.log("in virtual office");
				console.log(result);
				
				
			});
		
			
		}
	});
}




function dateTimeCheck(req) {
	var currTime = new Date().getTime();
	console.log("currTime" + currTime);
	var startTime = new Date(req.body.stime).getTime();
	console.log("startTime" + startTime);
	if(startTime > currTime){
		return true;
	}else{
		return false;
	}
	
	
}




module.exports = function(SpaceType) {
	return {

		/**
		 * search the configs based on location.
		   sort based on distance - ascending
		 */

		searchRooms : function(req, res) {
			var finalResult=[];
			 
			var perPage = parseInt(req.query.perPage);
			var page = req.query.page > 0 ? req.query.page : 0;
			var skipCount = parseInt(perPage * page);

			var locationArr = [parseFloat(req.body.lon),parseFloat(req.body.lat)];
			console.log(req.body);
			
			/*
			 * calling search function based on room type	
			 */		
			if(req.body.roomType === 'Meeting Room'){
				var result = dateTimeCheck(req);
				if(result){
					searchMeetingRoom(req, res, searchRadius, perPage, skipCount, locationArr);
				}else{
					return res.status(500).json({
						error : 'Start time should be greater than current time'
					});
				}
				
			} else if(req.body.roomType === 'Board Room'){
				var result = dateTimeCheck(req);
				if(result){
					searchMeetingRoom(req, res, searchRadius, perPage, skipCount, locationArr);
				}else{
					return res.status(500).json({
						error : 'Start time should be greater than current time'
					});
				}
			} else if(req.body.roomType === 'Training Room'){
				searchTrainingRoom(req, res, searchRadius, perPage, skipCount, locationArr);
			} else if(req.body.roomType === 'Hot Desk'){
				searchHotDesk(req, res, searchRadius, perPage, skipCount, locationArr);
			} else if(req.body.roomType === 'Virtual Office'){
				searchVirtualOffice(req, res, searchRadius, perPage, skipCount, locationArr);
			}
			
		},
	
		searchEventCalendarHotDesk : function(req, res) {
			var finalResult=[];
			 
			var perPage = parseInt(req.query.perPage);
			var page = req.query.page > 0 ? req.query.page : 0;
			var skipCount = parseInt(perPage * page);
	
			var locationArr = [parseFloat(req.body.lon),parseFloat(req.body.lat)];
			console.log(req.body);
			
			/*
			 * calling search function based on room type for Event Calendar
			 */		
			searchEventCalendarHotDesk(req, res, searchRadius, perPage, skipCount, locationArr);
			
		}
		
	};
};
