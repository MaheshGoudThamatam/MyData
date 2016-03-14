'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
   UserAvailabilityModel = mongoose.model('UserAvailability'),
    _ = require('lodash');

module.exports = function (UserAvailability) {

    return {

        /**
         * Find UserAvailability by id
         */
        useravailability: function (req, res, next, id) {
            UserAvailabilityModel.load(id, function (err, useravailability) {
                if (err) return next(err);
                if (!useravailability) return next(new Error('Failed to load useravailability ' + id));
                req.useravailability = useravailability;
                next();
            });
        },
         
        /**
         * Create an useravailability
         */
        create: function (req, res) {
            var useravailability = new UserAvailabilityModel(req.body);
            useravailability.save(function (err) {
                if (err) {
                    console.log(err);
                    return res.status(500).json({
                        error: 'Cannot save the useravailability'
                    });
                }

                res.json(useravailability);
            });
        },
        
        /**
         * Update an useravailability
         */
        update: function (req, res) {
            var useravailability = req.useravailability;
            useravailability = _.extend(useravailability, req.body);
            useravailability.save(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot update the useravailability'
                    });
                }

                res.json(useravailability);
            });
        },
        
        /**
         * Delete a useravailability
         */
        destroy: function (req, res) {
            var useravailability = req.useravailability;
            
            useravailability.remove(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete the useravailability'
                    });
                }

                res.json(useravailability);
            });
        },
        
        /**
         * Show an useravailability
         */
        show: function (req, res) {
            res.json(req.useravailability);
        },
        
        /**
         * List of useravailability
         */
        all: function (req, res) {
            UserAvailabilityModel.find().exec(function (err, useravailabilities) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the useravailabilities'
                    });
                }

                res.json(useravailabilities);
            });
        }
        
    };
}