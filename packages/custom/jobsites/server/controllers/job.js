'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
   JobModel = mongoose.model('Job'),
	_ = require('lodash');

module.exports = function (Job) {

    return {

        /**
         * Find Job by id
         */
    	job: function (req, res, next, id) {
    		JobModel.load(id, function (err, job) {
                if (err) return next(err);
                if (!job) return next(new Error('Failed to load job ' + id));
                req.job = job;
                next();
            });
        },
         
        /**
         * Create an job
         */
        create: function (req, res) {
            var job = new JobModel(req.body);
            job.save(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot save the job'
                    });
                }

                res.json(job);
            });
        },
        
        /**
         * Update an job
         */
        update: function (req, res) {
            var job = req.job;
            job = _.extend(job, req.body);
            job.save(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot update the job'
                    });
                }

                res.json(job);
            });
        },
        
        /**
         * Delete a job
         */
        destroy: function (req, res) {
            var job = req.job;
            
            job.remove(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete the job'
                    });
                }

                res.json(job);
            });
        },
        
        /**
         * Show an job
         */
        show: function (req, res) {
            res.json(req.job);
        },
        
        /**
         * List of job
         */
        all: function (req, res) {
        	JobModel.find().exec(function (err, jobs) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the job'
                    });
                }

                res.json(jobs);
            });
        }
        
    };
}