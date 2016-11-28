'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
var softremove = require('mongoose-soft-remove');

/**
 * City Schema.
 */
var CitySchema = new Schema({
	city : {
		type: String,
	},
	state : {
		type: String,
	},
	country : {
		type: String,
	},
	lat : {
		type: Number,
	},
	long : {
		type: Number,
	},
	radius : {
		type: Number,
	},
	country_code : {
		type: String
	},
	STD_code : [{
		type: String
	}],
	createdAt: {
		type: String,
		default: new Date().toISOString().slice(0, -5).concat('Z')
	},
	updatedAt: {
		type: String,
		default: new Date().toISOString().slice(0, -5).concat('Z')
	}
});

/**
 * Enabling soft delete
 */
CitySchema.plugin(softremove);

/**
 * Statics
 */
CitySchema.statics.load = function(id, callback) {
	this.findOne({
		_id: id
	}).exec(callback);
};

mongoose.model('City', CitySchema);