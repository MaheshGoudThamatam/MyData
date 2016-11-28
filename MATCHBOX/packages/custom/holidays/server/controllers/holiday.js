'use strict';

/**
 * Module dependencies.
 */

require('../../../role/server/models/role.js');
require('../../../holidays/server/models/holiday.js');
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
                         error: 'Cannot save the holiday',
                         errMsg : err
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
        
        /**
         * List of holiday by year
         */
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
        },
        
        /**
         * List of holiday for next 90 days
         */
        loadHolidayBasedByDays : function(req, res){
        	var days;
            if(req.query.days){
            	days = parseInt(req.query.days);
            } else {
            	/*days = 'undefined';*/
            	days = 90;
            }
            var query = {};
            query.has_admin_created = true;
             
            var todaysDate = new Date();
            var nintyDaysDate = new Date();
            nintyDaysDate.setDate(nintyDaysDate.getDate() + days);
            nintyDaysDate = new Date(nintyDaysDate);
            
            var date = todaysDate.getDate();
            var month = todaysDate.getMonth();
            var year = todaysDate.getFullYear();
            
            var date90 = nintyDaysDate.getDate();
            var month90 = nintyDaysDate.getMonth();
            var year90 = nintyDaysDate.getFullYear();
            
            query.holiday_date = {
				"$gte" : new Date(year, month, date),
				"$lt" : new Date(year90, month90, date90)
			}
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