'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
var softremove = require('mongoose-soft-remove');

/**
 * Area Schema.
 */
var AreaSchema = new Schema({
	city : {
		type: String,
	},
	areas : [{
		value : String,
		loc: {
			type: [Number],
			index: '2dsphere'
		}
	}],
	timeZoneOffset : {
		type: Number
	},
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
AreaSchema.plugin(softremove);

/**
 * Statics
 */
AreaSchema.statics.load = function(id, callback) {
	this.findOne({
		_id: id
	}).exec(callback);
};

AreaSchema.statics.loadByName = function(id, callback) {
	this.findOne({
		city: id
	}).exec(callback);
};

mongoose.model('Area', AreaSchema);