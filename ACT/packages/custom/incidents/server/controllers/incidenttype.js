'use strict';
/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
	IncidentTypeModel = mongoose.model('IncidentType'),
	_ = require('lodash');

module.exports = function(IncidentTypeCtrl) {

	return {
		/**
		 * Loads the Feature based on id
		 */

		incidenttype: function(req, res, next, id) {
			IncidentTypeModel.load(id, function(err, incidenttype) {
				if (err) {
					return next(err);
				}
				if (!incidenttype) {
					return next(new Error('Failed to load incidenttype ' + id));
				}
				req.incidenttype = incidenttype;
				next();
			});
		},

		/**
		 * Show the Feature
		 */
		show: function(req, res) {

			res.json(req.incidenttype);
		},

		/**
		 * List of Features
		 */
		all: function(req, res) {

			IncidentTypeModel.find().sort({
				name: 'asc'
			}).exec(function(err, incidenttypes) {
				if (err) {
					return res.status(500).json({
						error: 'Cannot list the incidenttypes'
					});
				}

				res.json(incidenttypes);
			});
		}

	}
};