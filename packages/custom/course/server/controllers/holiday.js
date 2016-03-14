'use strict';

/**
 * Module dependencies.
 */
require('../../../branch/server/models/branch.js');
var utility = require('../../../../core/system/server/controllers/util.js');
var mongoose = require('mongoose'), HolidayModel = mongoose.model('Holiday'), CountryModel = mongoose
		.model('Country'), BranchModel = mongoose.model('Branch'), UserModel = mongoose
		.model('User'), _ = require('lodash');

module.exports = function(holidayCtrl) {
	return {

		/**
		 * Find holiday by id
		 */
		holiday : function(req, res, next, id) {
			HolidayModel.load(id, function(err, holiday) {
				if (err) {
					return next(err);
				}
				if (!holiday) {
					return next(new Error('Failed to load holiday' + id));
				}
				req.holiday = holiday;
				next();

			});
		},
		country : function(req, res, next, id) {
			CountryModel.load(id, function(err, country) {
				if (err) {
					return next(err);
				}
				if (!country) {
					return next(new Error('Failed to load country' + id));
				}
				req.countryId = country;
				next();

			});
		},
		branch : function(req, res, next, id) {
			BranchModel.load(id, function(err, branch) {
				if (err) {
					return next(err);
				}
				if (!branch) {
					return next(new Error('Failed to load branch' + id));
				}
				req.branchId = branch;
				next();

			});
		},
		user : function(req, res, next, id) {
			UserModel.load(id, function(err, user) {
				if (err) {
					return next(err);
				}
				if (!user) {
					return next(new Error('Failed to load user' + id));
				}
				req.userId = user;
				next();

			});
		},

		/**
		 * create the holiday
		 */
		create : function(req, res) {
			var holiday = new HolidayModel(req.body);
			req.assert('name', 'Please enter  Name').notEmpty();
			req.assert('description', 'You must enter description').notEmpty();
			req.assert('start_date', 'You must enter start_date').notEmpty();
			req.assert('end_date', 'You must enter end_date').notEmpty();

			var errors = [];
			errors.concat(req.validationErrors());

			var d = new Date();
			var d1 = new Date(req.body.start_date);
			var d2 = new Date(req.body.end_date);

			if (d2 < d1) {
				var dateError = {
					msg : "End date should be greater than start date",
					param : "end_date"
				};
				errors.push(dateError);
			}
			if (d1 < d) {
				var dateError = {
					msg : "Start date should be greater than current date",
					param : "start_date"
				};
				errors.push(dateError);
			}

			if (errors.length > 0) {
				return res.status(400).send(errors);
			}

			holiday.save(function(err) {
				if (err) {
					switch (err.code) {
					case 11000:
					case 11001:
						res.status(400).json([ {
							msg : ' Name already exists',
							param : 'name'
						} ]);
						break;
					default:
						var modelErrors = [];

						if (err.errors) {
							for ( var x in err.errors) {
								modelErrors.push({
									param : x,
									msg : err.errors[x].message,
									value : err.errors[x].value
								});
							}
							console.log('mod' + modelErrors);
							res.status(400).json(modelErrors);
						}
					}
					return res.status(400);
				}
				res.json(holiday);
			});
		},
		/**
		 * delete the holiday
		 */

		destroy : function(req, res) {
			var holiday = req.holiday;

			holiday.remove(function(err) {
				if (err) {
					return res.status(500).json({
						error : 'Cannot delete the holiday'
					});
				}
				res.json(holiday);
			});
		},
		/**
		 * List of holiday
		 */
		all : function(req, res) {
			HolidayModel.find().exec(function(err, holiday) {
				if (err) {
					return res.status(500).json({
						error : 'Cannot list the holiday'
					});
				}
				res.json(holiday);
			});

		},
		/**
		 * update the holiday
		 */

		update : function(req, res) {
			var holiday = req.holiday;
			holiday = _.extend(holiday, req.body);
			req.assert('name', 'Please enter  Name').notEmpty();
			req.assert('description', 'You must enter description').notEmpty();
			req.assert('start_date', 'You must enter start_date').notEmpty();
			req.assert('end_date', 'You must enter end_date').notEmpty();
			var errors = [];
			errors.concat(req.validationErrors());
			var d = new Date();
			var d1 = new Date(req.body.start_date);
			var d2 = new Date(req.body.end_date);
			if (d2 < d1) {
				var dateError = {
					msg : "End date should be greater than start date",
					param : "end_date"
				};
				errors.push(dateError);
			}
			if (d1 < d) {
				var dateError = {
					msg : "Start date should be greater than current date",
					param : "start_date"
				};
				errors.push(dateError);
			}

			if (errors.length > 0) {
				return res.status(400).send(errors);
			}
			holiday.save(function(err) {
				if (err) {
					switch (err.code) {
					case 11000:
					case 11001:
						res.status(400).json([ {
							msg : 'Name already exists',
							param : 'name'
						} ]);
						break;
					default:
						var modelErrors = [];
						if (err.errors) {
							for ( var x in err.errors) {
								modelErrors.push({
									param : x,
									msg : err.errors[x].message,
									value : err.errors[x].value
								});
							}
							console.log('mod' + modelErrors);
							res.status(400).json(modelErrors);
						}
					}
					return res.status(400);
				}
				res.json(holiday);
			});
		},
		/**
		 * Show holiday
		 */
		show : function(req, res) {

			res.json(req.holiday);
		},
		holidayListByPagination : function(req, res) {
			var populateObj = {};
			utility.pagination(req, res, HolidayModel, {}, {}, populateObj,
					function(result) {
						if (utility.isEmpty(result.collection)) {

						}

						return res.json(result);
					});
		},

	};
}