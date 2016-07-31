
'use strict';

/**
 * Module dependencies.
 */
require('../../../search/server/models/search.js');
require('../../../rooms/server/models/roomtypes.js');

var mongoose = require('mongoose'),
Schedule = mongoose.model('Schedule'),
Rooms =  mongoose.model('Rooms'),
RoomType = mongoose.model('Roomstype'),
searchRadius= 2,
distanceMultiplier = 6371,
_ = require('lodash');




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

/*function searchRoomBck(req, res, searchRadius, perPage, skipCount, locationArr){
	Schedule.aggregate().near({ 
		near: locationArr,
		distanceField: "dist.calculated", // required
		spherical:true, 
		maxDistance: parseFloat(searchRadius)/3959,
		includeLocs: "dist.location",
		query: {
			'currentAval' : {
				$elemMatch: {
					'startTime':{$lte: new Date(req.body.stime)},
					'endTime':{$gte: new Date(req.body.etime)}
				}
			}
		}
	}).limit(perPage).skip(skipCount).exec(function(err,docs) {
		if (err) {
			res.json({'code': '0001', 'msg': err});
		} else {
			Schedule.populate( docs, [{ path: 'room' }], function(err, schedules) {
				if (err) {
					res.json({'code': '0002', 'msg': err});
				} else {

					if(schedules.length>0){
						
						var results = [];
						var price = {};


						for(var i=0; i < schedules.length; i++){
							if(schedules[i].room != null){
									if(schedules[i].room.roomtype.toLowerCase().trim() == req.body.roomType.toLowerCase().trim()){
										if(req.body.price){
											if((schedules[i].room.pricePerhour <= req.body.price.max) && (schedules[i].room.pricePerhour >= req.body.price.min)){
												results = checkAvailability(req, res, schedules[i]);
											}
										}else if(req.body.halfDayPrice){
											if((schedules[i].room.pricePerhalfday <= req.body.price.max) && (schedules[i].room.pricePerhalfday >= req.body.price.min)){
												results = checkAvailability(req, res, schedules[i]);
											}
										}
										else if(req.body.fullDayPrice){
											if((schedules[i].room.pricePerfullday <= req.body.price.max) && (schedules[i].room.pricePerfullday >= req.body.price.min)){
												results = checkAvailability(req, res, schedules[i]);
											}
										}
										else if(req.body.capacity){
											if((schedules[i].room.capacity <= req.body.capacity.max) && (schedules[i].room.capacity >= req.body.capacity.min)){
												if(req.body.ratings){
													var counter = 0;
													for(var j=0; j< req.body.ratings.length ; j++){
														if(req.body.ratings[j] == schedules[i].room.avgRating){
															counter++;
														}
													}
													if(counter > 0){
														if(req.body.amenities){
															var counter1 = 0;
															for(var k=0; k< req.body.amenities.length ; k++){
																for(var n=0; n< schedules[i].room.amenities.length ; n++){
																	//console.log(schedules[i].room.amenities[n]);
																	if(req.body.amenities[k] == schedules[i].room.amenities[n].amenityId){
																		counter1++
																	}
																}
															}
															if(counter1 == req.body.amenities.length){
																results.push(schedules[i].room);
															}
														}
														else{
															results.push(schedules[i].room);
														}

													}
												}else if(req.body.amenities){
													var counter1 = 0;
													for(var k=0; k< req.body.amenities.length ; k++){
														for(var n=0; n< schedules[i].room.amenities.length ; n++){
															//console.log(schedules[i].room.amenities[n]);
															if(req.body.amenities[k] == schedules[i].room.amenities[n].amenityId){
																counter1++
															}
														}
													}
													if(counter1 == req.body.amenities.length){
														results.push(schedules[i].room);
													}


												}
												else{
													results.push(schedules[i].room);
												}
											}
										}else if(req.body.ratings){
									var counter = 0;
											for(var j=0; j< req.body.ratings.length ; j++){
												if(req.body.ratings[j] == schedules[i].room.avgRating){
													counter++;
												}
											}
											if(counter > 0){
												if(req.body.amenities){
													var counter1 = 0;
													for(var k=0; k< req.body.amenities.length ; k++){
														for(var n=0; n< schedules[i].room.amenities.length ; n++){
															//console.log(schedules[i].room.amenities[n]);
															if(req.body.amenities[k] == schedules[i].room.amenities[n].amenityId){
																counter1++
															}
														}
													}
													if(counter1 == req.body.amenities.length){
														if(req.body.amenities){
															var counter1 = 0;
															for(var k=0; k< req.body.amenities.length ; k++){
																for(var n=0; n< schedules[i].room.amenities.length ; n++){
																	//console.log(schedules[i].room.amenities[n]);
																	if(req.body.amenities[k] == schedules[i].room.amenities[n].amenityId){
																		counter1++
																	}
																}
															}
															if(counter1 == req.body.amenities.length){
																results.push(schedules[i].room);
															}


														}
														else{
															results.push(schedules[i].room);
														}
													}


												}
												else if(req.body.amenities){
													var counter1 = 0;
													for(var k=0; k< req.body.amenities.length ; k++){
														for(var n=0; n< schedules[i].room.amenities.length ; n++){
															//console.log(schedules[i].room.amenities[n]);
															if(req.body.amenities[k] == schedules[i].room.amenities[n].amenityId){
																counter1++
															}
														}
													}
													if(counter1 == req.body.amenities.length){
														results.push(schedules[i].room);
													}


												}
												else{
													results.push(schedules[i].room);
												}
											}
										}else if(req.body.amenities){
											var counter1 = 0;
											for(var k=0; k< req.body.amenities.length ; k++){
												for(var n=0; n< schedules[i].room.amenities.length ; n++){
													//console.log(schedules[i].room.amenities[n]);
													if(req.body.amenities[k] == schedules[i].room.amenities[n].amenityId){
														counter1++
													}
												}
											}
											if(counter1 == req.body.amenities.length){
												results.push(schedules[i].room);
											}


										}
										else{
											results.push(schedules[i].room);
										}
									}
						}
					}
					var response = {};
					response.rooms = [];
					response.rooms = results;
					res.json(response);
				}
				else{
					res.jsonp({"code": "2904" ,"msg": "Search result not found"});
				}    
			}
		});
	}
});
};*/

function searchHotDesk(req, res, searchRadius, perPage, skipCount, locationArr){
	console.log(req.body);
	Schedule.aggregate().near({ 
		near: locationArr,
		distanceField: "dist.calculated", // required
		spherical:true, 
		maxDistance: parseFloat(searchRadius)/distanceMultiplier,
		includeLocs: "dist.location",
		query: {
			$and: [{
				'date' : { $gte: new Date(req.body.fromDate),
						   $lte: new Date(req.body.endDate) }
				}/*, {
					'roomType': 'Training Room'
				}*/
			]
		}
	}).exec(function(err,docs) {
		if (err) {
			res.json({'code': '0001', 'msg': err});
		} else {
			Schedule.populate( docs, [{ path: 'room' }], function(err, schedules) {
				if (err) {
					res.json({'code': '0002', 'msg': err});
				} else {
					if(schedules.length > 0){
						var scheduleList = schedules;
						schedules = [];
						var scheduleArray = [];
						var schedule = {};
						var count = 0, continueLoop = true;
						var results = [];
						var price = {};
						
						var counter, startTime, endTime;
						var stimehr = req.body.stime.split(':');
						var stimemin = req.body.stime.split(' ');
						var etimehr = req.body.stime.split(':');
						var etimemin = req.body.stime.split(' ');
						
						for(var i = 0; i < scheduleList.length; i++){
							count = 0;
							continueLoop = true;
							if(i != 0){
								for(var j = 0; j < i; j++){
									if(JSON.stringify(scheduleList[i].room._id) === JSON.stringify(scheduleList[j].room._id)){
										continueLoop = false;
										break;
									}
								}
							}
							if(continueLoop){
								schedule = {};
								schedule.schedule = [];
								for(var k = 0; k < scheduleList.length; k++){
									if(JSON.stringify(scheduleList[i].room._id) === JSON.stringify(scheduleList[k].room._id)){
										if(scheduleList[k].currentAval.length == 0){
											continue;
										} else {
											count++;
											schedule.schedule.push(scheduleList[k]);
										}
									}
								}
								schedule.room = scheduleList[i].room._id;
								schedule.count = count;
								scheduleArray.push(schedule);
								
								// Time 
								startTime = new Date(scheduleList[i].date);
								startTime.setHours(parseInt(stimehr[0]));
								startTime.setMinutes(parseInt(stimemin[0]));
								
								endTime = new Date(scheduleList[i].date);
								endTime.setHours(parseInt(etimehr[0]));
								endTime.setMinutes(parseInt(etimemin[0]));
								for(var l = 0; l < scheduleArray.length; l++){
									counter = 0;
									for(var m = 0; m < scheduleArray[l].schedule.length; m++){
										for(var j = 0; j < scheduleArray[l].schedule[m].currentAval.length; j++){
											var currAvailStartTime = new Date(scheduleArray[l].schedule[m].currentAval[j].startTime);
											var currAvailEndTime = new Date(scheduleArray[l].schedule[m].currentAval[j].endTime);
											if(currAvailStartTime < startTime && endTime > currAvailEndTime && !scheduleArray[l].schedule[m].currentAval[j].isBlocked){
												counter++;
											}
										}
									}
									
									if(counter === scheduleArray[l].count){
										schedules.push(scheduleArray[l].schedule[0]);
									}
								}
							}
						}
						
						var query = {} ;
						var roomIds = [];
						for(var i=0; i< scheduleList.length; i++){
							roomIds.push(scheduleList[i].room._id);
						}
						console.log(roomIds);
						
						query._id = {
							$in: roomIds
						};
						
						//query.roomtype = new RegExp('^' + req.body.roomType + '$', "i")
						
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

						if(req.body.ratings){
							query.avgRating = {
								$in: req.body.ratings
							};
						}

						if(req.body.amenities){
							query.amenities = {
									$elemMatch : {
										amenityId : { $in: req.body.amenities }
									}
								};
						}
						
						console.log(query);
						
						Rooms.find(query).sort({created: 1}).exec(function(err, rooms) {
							if (err) {
								return res.status(500).json({
									error : 'Can not load rooms'
								});
							}else{
								Rooms.populate( rooms, [{ path: 'spaceId' , select: 'name address1 address2 phone city locality state postal_code country'}], function(err, roomlist) {
									if(err){
										return res.status(500).json({
											error : 'Can not load rooms'
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
							            for(var j = 0; j < i; j++){
							            	dummyRoomObjJ = roomlist[j].name.split('(');
											roomJ = dummyRoomObjJ[0].trim();
							                if(roomI.toUpperCase() === roomJ.toUpperCase()){
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
							            for(var j = 0; j < roomlist.length; j++){
							            	dummyRoomObjJ = roomlist[j].name.split('(');
											roomJ = dummyRoomObjJ[0].trim();
							                if(roomI.toUpperCase() === roomJ.toUpperCase()){
							                	relatedHotDeskIds.push(roomlist[j]._id);
							                }
							            }
							            rooms[i].relatedHotDeskIds = relatedHotDeskIds;
							        }
							
									var result = {};
									result.rooms = [];
									result.rooms = rooms;
									res.json(result);
								});
							}
							
						});
							
						
				}
				else{
					res.jsonp({"code": "2904" ,"msg": "Search result not found"});
				}    
			}
		});
	}
});
};

function searchTrainingRoom(req, res, searchRadius, perPage, skipCount, locationArr){
	console.log(req.body);
	Schedule.aggregate().near({ 
		near: locationArr,
		distanceField: "dist.calculated", // required
		spherical:true, 
		maxDistance: parseFloat(searchRadius)/3959,
		includeLocs: "dist.location",
		query: {
			$and: [{
				'date' : { $gte: new Date(req.body.fromDate),
						   $lte: new Date(req.body.endDate) }
				}/*, {
					'roomType': 'Training Room'
				}*/
			]
		}
	}).exec(function(err,docs) {
		if (err) {
			res.json({'code': '0001', 'msg': err});
		} else {
			Schedule.populate( docs, [{ path: 'room' }], function(err, schedules) {
				if (err) {
					res.json({'code': '0002', 'msg': err});
				} else {
					if(schedules.length>0){
						var scheduleList = schedules;
						schedules = [];
						var scheduleArray = [];
						var schedule = {};
						var count = 0, continueLoop = true;
						var results = [];
						var price = {};
						
						var counter, startTime, endTime;
						var stimehr = req.body.stime.split(':');
						var stimemin = req.body.stime.split(' ');
						var etimehr = req.body.stime.split(':');
						var etimemin = req.body.stime.split(' ');
						
						for(var i = 0; i < scheduleList.length; i++){
							count = 0;
							continueLoop = true;
							if(i != 0){
								for(var j = 0; j < i; j++){
									if(JSON.stringify(scheduleList[i].room._id) === JSON.stringify(scheduleList[j].room._id)){
										continueLoop = false;
										break;
									}
								}
							}
							if(continueLoop){
								schedule = {};
								schedule.schedule = [];
								for(var k = 0; k < scheduleList.length; k++){
									if(JSON.stringify(scheduleList[i].room._id) === JSON.stringify(scheduleList[k].room._id)){
										if(scheduleList[k].currentAval.length == 0){
											continue;
										} else {
											count++;
											schedule.schedule.push(scheduleList[k]);
										}
									}
								}
								schedule.room = scheduleList[i].room._id;
								schedule.count = count;
								scheduleArray.push(schedule);
								
								// Time 
								startTime = new Date(scheduleList[i].date);
								startTime.setHours(parseInt(stimehr[0]));
								startTime.setMinutes(parseInt(stimemin[0]));
								
								endTime = new Date(scheduleList[i].date);
								endTime.setHours(parseInt(etimehr[0]));
								endTime.setMinutes(parseInt(etimemin[0]));
								for(var l = 0; l < scheduleArray.length; l++){
									counter = 0;
									for(var m = 0; m < scheduleArray[l].schedule.length; m++){
										for(var j = 0; j < scheduleArray[l].schedule[m].currentAval.length; j++){
											var currAvailStartTime = new Date(scheduleArray[l].schedule[m].currentAval[j].startTime);
											var currAvailEndTime = new Date(scheduleArray[l].schedule[m].currentAval[j].endTime);
											if(currAvailStartTime < startTime && endTime > currAvailEndTime && !scheduleArray[l].schedule[m].currentAval[j].isBlocked){
												counter++;
											}
										}
									}
									
									if(counter === scheduleArray[l].count){
										schedules.push(scheduleArray[l].schedule[0]);
									}
								}
							}
						}
						
						var query = {} ;
						var roomIds = [];
						for(var i=0; i< scheduleList.length; i++){
							roomIds.push(scheduleList[i].room._id);
						}
						console.log(roomIds);
						
						query._id = {
								$in: roomIds
							};
						
						//query.roomtype = new RegExp('^' + req.body.roomType + '$', "i")
						
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

						if(req.body.ratings){
							query.avgRating = {
									$in: req.body.ratings
								};
						}

						if(req.body.amenities){
							query.amenities = {
									$elemMatch : {
										amenityId : { $in: req.body.amenities }
									}
								};
						}
						
						console.log(query);
					if(req.body.selectedPrice){
						Rooms.find(query).limit(perPage).skip(skipCount).exec(function(err, rooms) {
							if (err) {
								return res.status(500).json({
									error : 'Can not load rooms'
								});
							}else{
								Rooms.populate( rooms, [{ path: 'spaceId' , select: 'name address1 address2 phone city locality state postal_code country'}], function(err, roomlist) {
									if(err){
										return res.status(500).json({
											error : 'Can not populate rooms'
										});
									}
									var result = {};
									result.rooms = [];
									result.rooms = roomlist;
									res.json(result);
								});
							}
							
						}).sort({
			                pricePerhour: priceSorting
			            })
					} else {
						Rooms.find(query).limit(perPage).skip(skipCount).exec(function(err, rooms) {
							if (err) {
								return res.status(500).json({
									error : 'Can not load rooms'
								});
							}else{
								Rooms.populate( rooms, [{ path: 'spaceId' , select: 'name address1 address2 phone city locality state postal_code country'}], function(err, roomlist) {
									if(err){
										return res.status(500).json({
											error : 'Can not populate rooms'
										});
									}
									var result = {};
									result.rooms = [];
									result.rooms = roomlist;
									res.json(result);
								});
							}
							
						});
					}	
						
				}
				else{
					res.jsonp({"code": "2904" ,"msg": "Search result not found"});
				}    
			}
		});
	}
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

			if(req.body.ratings){
				query.avgRating = {
						$in: req.body.ratings
					};
			}

			if(req.body.amenities){
				query.amenities = {
						$elemMatch : {
							amenityId : { $in: req.body.amenities }
						}
					};
			}
			
			
			
			Rooms.find(query).limit(perPage).skip(skipCount).exec(function(err, rooms) {
				if (err) {
					return res.status(500).json({
						error : 'Cannot load rooms'
					});
				}else{
					Rooms.populate( rooms, [{ path: 'spaceId' , select: 'name address1 address2 phone city locality state postal_code country'}], function(err, roomlist) {
						if(err){
							return res.status(500).json({
								error : 'Cannot load rooms'
							});
						}
						/*if(roomlist.length > 0 || (searchRadius == 10)){
							var result = {};
							result.rooms = [];
							result.rooms = roomlist;
							result.searchRadius = searchRadius;
							res.json(result);
						}else{
							if(searchRadius == 2){
								searchRadius = 5;
							}else if(searchRadius == 5){
								searchRadius =  10;
							}
							searchMeetingRoom(req, res, searchRadius, perPage, skipCount, locationArr);
						}*/
						var result = {};
						result.rooms = [];
						result.rooms = roomlist;
						res.json(result);
						
						
					});
				}
				
			});
		});	
			
		}
	});
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
			if(req.body.roomType === 'Meeting Room'){
				searchMeetingRoom(req, res, searchRadius, perPage, skipCount, locationArr);
			} else if(req.body.roomType === 'Board Room'){
				searchMeetingRoom(req, res, searchRadius, perPage, skipCount, locationArr);
			} else if(req.body.roomType === 'Training Room'){
				searchTrainingRoom(req, res, searchRadius, perPage, skipCount, locationArr);
			} else if(req.body.roomType === 'Hot Desk'){
				searchHotDesk(req, res, searchRadius, perPage, skipCount, locationArr);
			}
			
		}
		
	};
};

