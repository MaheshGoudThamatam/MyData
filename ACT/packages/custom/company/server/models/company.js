'use strict';

/**
 * <Author:Akash Gupta>
 * <Date:30-06-2016>
 * <Company Schema:  Added unique validation for company name & database name>
 */

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
var softremove = require('mongoose-soft-remove');

//Company Unique validation for case sensitive
var validateUniqueName = function(value, callback) {
	var Company = mongoose.model('Company');
	Company.find({
		$and: [{
			company_name: {
				$regex: new RegExp(value, 'i')
			}

		}, {
			_id: {
				$ne: this._id
			}
		}]
	}, function(err, company) {
		callback(err || company.length === 0);
	});
};

//Database unique validation for case sensitive
var validateUniqueDatabase = function(value, callback) {
	var Company = mongoose.model('Company');
	Company.find({
		$and: [{
			database: {
				$regex: new RegExp(value, 'i')
			}

		}, {
			_id: {
				$ne: this._id
			}
		}]
	}, function(err, database) {
		callback(err || database.length === 0);
	});
};

/**
 * ConfigType Schema.
 */
var CompanySchema = new Schema({
	company_name: {
		type: String,
		trim: true,
		required: true,
		unique: true,
		validate: [validateUniqueName, 'Company already exists']
	},
	database: {
		type: String,
		trim: true,
		required: true,
		unique: true,
		validate: [validateUniqueDatabase, 'Database already exists']
	},
	address_line_1: {
		type: String,
		trim: true
	},
	address_line_2: {
		type: String,
		trim: true
	},
	city: {
		type: String,
		trim: true
	},
	country: {
		type: String,
		trim: true
	},
	zipcode: {
		type: String,
		trim: true
	},
	contact_number: {
		type: String,
		trim: true
	},
	loc: {
	    type: [Number]
	},
	active: {
		type: Boolean,
		default: true
	},
	createdBy: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	updatedBy: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	updatedAt: {
		type: Date,
		default: Date.now
	},
	token: {
		type: String
	},
	registration_number:{
		type:String
	},
	customer_reference:{
		type:String
	}
});

/**
 * Enabling soft delete
 */
CompanySchema.plugin(softremove);

CompanySchema.statics.load = function(id, callback) {
	this.findOne({
		_id: id
	}).exec(callback);
};

CompanySchema.statics.loadToken = function(token, callback) {
	this.findOne({
		token: {$regex: new RegExp(token, 'i')}
	}).exec(callback);
};
mongoose.model('Company', CompanySchema);