'use strict';

/**
 * Module dependencies.
 */

var mongoose = require('mongoose'), 
EducationalDetailModel = mongoose.model('EducationalDetail'),
UserModel = mongoose.model('User'),
_ = require('lodash');

module.exports = function(EducationalDetail) {

	return {

		/**
		 * Find EducationalDetail by id
		 */
		educationalDetail : function(req, res, next, id) {
			EducationalDetailModel.load(id, function(err, educationalDetail) {
				if (err) {
					return next(err);

				}
				if (!educationalDetail) {
					return next(new Error('Failed to load educationalDetail ' + id));
				}
				req.educationalDetail = educationalDetail;
				next();
			});
		},
		user: function (req, res, next, id) {
    		UserModel.load(id, function (err, user) {
                if (err) return next(err);
                if (!user) return next(new Error('Failed to load user ' + id));
                req.user = user;
                next();
            });
        },

		/**
		 * Create an EducationalDetail
		 */
		create : function(req, res) {
			var educationalDetail = new EducationalDetailModel(req.body);
			educationalDetail.save(function(err) {
				if (err) {
					return res.status(500).json({
						error : 'Cannot save the EducationalDetail'
					});
				}
				res.json(educationalDetail);
			});
		},

		/**
		 * Update an EducationalDetail
		 */
		update : function(req, res) {
			var educationalDetail = req.educationalDetail;
			educationalDetail = _.extend(educationalDetail, req.body);
			educationalDetail.save(function(err) {
				if (err) {
					return res.status(500).json({
						error : 'Cannot update the educationalDetail'
					});
				}

				res.json(educationalDetail);
			});
		},

		/**
		 * Delete a EducationalDetail
		 */
		destroy : function(req, res) {
			var educationalDetail = req.educationalDetail;

			educationalDetail.remove(function(err) {
				if (err) {
					return res.status(500).json({
						error : 'Cannot delete the EducationalDetail'
					});
				}

				res.json(educationalDetail);
			});
		},

		/**
		 * Show an EducationalDetail
		 */
		show : function(req, res) {
			res.json(req.educationalDetail);
		},

		/**
		 * List of EducationalDetails
		 */
		all : function(req, res) {
			EducationalDetailModel.find().exec(function(err, educationalDetails) {
				if (err) {
					return res.status(500).json({
						error : 'Cannot list the EducationalDetail'
					});
				}

				res.json(educationalDetails);
			});
		},
		
	};
}
