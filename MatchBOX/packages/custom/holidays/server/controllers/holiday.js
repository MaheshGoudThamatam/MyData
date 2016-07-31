'use strict';

/**
 * Module dependencies.
 */

require('../../../role/server/models/role.js');

var mongoose = require('mongoose'),
    HolidayModel = mongoose.model('Holiday'),
    RoleModel = mongoose.model('Role'),
	_ = require('lodash');

module.exports = function (Holiday) {

    return {

        /**
         * Find Holiday by id
         */
        holiday: function (req, res, next, id) {
        	HolidayModel.load(id, function (err, holiday) {
                if (err) return next(err);
                if (!holiday) return next(new Error('Failed to load holiday ' + id));
                req.holiday = holiday;
                next();
            });
        },
        /**
         * Create an holiday
         */
        create: function (req, res) {
    		var holiday = new HolidayModel(req.body);
    		holiday.has_admin_created = true;
            holiday.save(function (err) {
                 if (err) {
                     return res.status(500).json({
                         error: 'Cannot save the holiday'
                     });
                 }
                 res.json(holiday);
             });
        },
        
        /**
         * Update an holiday
         */
        update: function (req, res) {
            var holiday = req.holiday;
            holiday = _.extend(holiday, req.body);
            holiday.save(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot update the holiday'
                    });
                }

                res.json(holiday);
            });
        },
        
        /**
         * Delete a holiday
         */
        destroy: function (req, res) {
            var holiday = req.holiday;
            
            holiday.remove(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete the holiday'
                    });
                }

                res.json(holiday);
            });
        },
        
        /**
         * Show an holiday
         */
        show: function (req, res) {
        	
            res.json(req.holiday);
        },
        
        /**
         * List of holiday
         */
        all: function (req, res) {
        	HolidayModel.find({
        		has_admin_created: true
        	}).exec(function (err, holidays) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the holidays'
                    });
                }
                console.log(holidays);
                res.json(holidays);
            });
        },
        loadHolidayBasedOnYear:function(req, res){
        	var yearselected;
            if(req.query.selectedyears){
            	yearselected = req.query.selectedyears;
            } else {
                yearselected = 'undefined';
            }
            var query = {};
            query.has_admin_created = true;
            query.year = yearselected;
            HolidayModel.find(query).exec(function (err, holidays) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the holidays'
                    });
                }
                res.json(holidays);
            });
        }
        
    };
}