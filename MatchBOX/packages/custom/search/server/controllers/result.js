'use strict';

/**
 * Module dependencies.
 */
require('../../../../custom/rooms/server/models/rooms.js');
require('../../../../custom/space/server/models/space.js');
var utility = require('../../../../core/system/server/controllers/util.js');
var mongoose = require('mongoose'), RoomsSchemaModel = mongoose.model('Rooms'), SpacesSchemaModel= mongoose
        .model('Space'),SearchSchemaModel= mongoose
        .model('Schedule'), _ = require('lodash');
/*var Spaces = require('../../../space/server/models/space.js');
var Rooms = require('../../../rooms/server/models/rooms.js');
//var Roomstype = require('../../../../rooms/server/models/roomtype.js');
var mongoose = require('mongoose');
 RoomsSchemaModel = mongoose.model('Rooms'),
 SpacesSchemaModel = mongoose.model('Spaces'),
 RoomtypeSchemaModel = mongoose.model('Roomstype');
_ = require('lodash');*/

module.exports = function(Result) {
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


      getAllRoomResult : function(req, res) {
		
  		RoomsSchemaModel.find().exec(function(err, rooms) {
			if (err) {
				return res.status(500).json({
					error : 'Cannot list the rooms'
				});
			}
			res.json(rooms);
		});
	},
	show: function (req, res) {

        res.json(req.room);
    },
    
    
    
  /*  pagination : function (req, res) {
    	
        var page = req.query.page;
        console.log(req.query.page);
        var pageSize = req.query.pageSize;
        console.log(pageSize);
        var skipCount = (page-1) * pageSize;
        console.log("++++++++++++++++++");
        console.log(skipCount);
        var roomList = {};
        RoomsSchemaModel.find({skip: skipCount, limit: pageSize }).exec(function (err, rooms) {
            if (err) {
                return res.status(500).json({
                    error: 'Cannot list the rooms'
                });
            }
            console.log("===============");
            console.log(rooms);
            roomList.rooms = rooms;
            RoomsSchemaModel.count().exec(function (err, CollectionCount) {
                if (err) {
                    return 'Cannot list the ' + ArtworkModel + 's';
                }
                if (CollectionCount) {
                    pageSize = parseInt(pageSize);             
                    if (CollectionCount % pageSize === 0) {
                    	roomList.totalPage = parseInt(CollectionCount / pageSize);
                    }else {
                    	roomList.totalPage = parseInt(CollectionCount / pageSize) + 1;
                    }
                    roomList.totalArtworkCount = CollectionCount;
                }
                    
            });
            res.json(roomList);
            console.log("*************************");
            console.log(roomList);
        });
    },*/
    
    

	

};
  }