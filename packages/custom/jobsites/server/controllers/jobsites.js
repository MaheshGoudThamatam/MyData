'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
   JobSiteModel = mongoose.model('JobSite'),
	_ = require('lodash');

module.exports = function (JobSite) {

    return {

        /**
         * Find JobSite by id
         */
    	jobSite: function (req, res, next, id) {
    		JobSiteModel.load(id, function (err, jobSite) {
                if (err) return next(err);
                if (!jobSite) return next(new Error('Failed to load jobSite ' + id));
                req.jobSite = jobSite;
                next();
            });
        },
         
        /**
         * Create an jobSite
         */
        create: function (req, res) {
            var jobSite = new JobSiteModel(req.body);
            if(jobSite.apiAvailable=='true'){
            	jobSite.apiAvailable='Api Available';
               }
               else{
            	   jobSite.apiAvailable='Api not Available';
               }
            jobSite.save(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot save the jobSite'
                    });
                }

                res.json(jobSite);
            });
        },
        
        /**
         * Update an jobSite
         */
        update: function (req, res) {
            var jobSite = req.jobSite;
            
            
            jobSite = _.extend(jobSite, req.body);
            if(jobSite.apiAvailable=='true'){
            	jobSite.apiAvailable='Api Available';
               }
               else{
            	   jobSite.apiAvailable='Api not Available';
               }
            jobSite.save(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot update the jobSite'
                    });
                }

                res.json(jobSite);
            });
        },
        
        /**
         * Delete a jobSite
         */
        destroy: function (req, res) {
            var jobSite = req.jobSite;
            
            jobSite.remove(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete the jobSite'
                    });
                }

                res.json(jobSite);
            });
        },
        
        /**
         * Show an jobSite
         */
        show: function (req, res) {
            res.json(req.jobSite);
        },
        
        /**
         * List of jobSite
         */
        all: function (req, res) {
        	JobSiteModel.find().exec(function (err, jobSites) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the jobSites'
                    });
                }

                res.json(jobSites);
            });
        }
        
    };
}