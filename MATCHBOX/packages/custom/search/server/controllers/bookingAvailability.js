'use strict';

/**
 * Module dependencies.
 */
  require('../../../rooms/server/models/rooms.js');
var mongoose = require('mongoose'),
   ScheduleModel = mongoose.model('Schedule'),
    RoomsSchemaModel = mongoose.model('Rooms'),
 	_ = require('lodash');

 module.exports = function (Schedule) {

    return {

        /**
         * Find Booking by id
         */
        schedule: function (req, res, next, id) {
        	ScheduleModel.load(id, function (err, schedule) {
                if (err) return next(err);
                if (!schedule) return next(new Error('Failed to load schedule ' + id));
                req.schedule = schedule;
                next();
            });
        },
       /* room: function(req, res, next, id) {
             RoomsSchemaModel.load(id, function(err, room) {
                if (err) {
                    return next(err);
                }
                if (!room) {
                    return next(new Error('Failed to load room ' + id));
                }
                req.room = room;
                next();
            });
        },
        */
        /**
         * List of schedules
         */
        all: function (req, res) {
            var roomId=req.params.roomId;
            console.log(roomId);
        	ScheduleModel.find({room: roomId}).exec(function (err, schedules) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the schedules'
                    });
                }
                res.json(schedules);
            });
        }
        
    };
}