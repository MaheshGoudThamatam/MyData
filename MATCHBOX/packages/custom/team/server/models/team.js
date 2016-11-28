'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
var softremove = require('mongoose-soft-remove');
/**
 * Team Type Schema.
 */
var Team = new Schema({
	name: {
		type: String,
		default: '',
		trim: true
	},
	description: {
		type: String,
		default: '',
		trim: true
	},
	address: {
		type: String,
		default: ""
	},
	phone: {
		type: Number
	},
	city: {
		type: String,
		default: ""
	},
	locality: {
		type: String,
		default: ""
	},
	state: {
		type: String,
		default: ""
	},
	country: {
		type: String,
		default: ""
	},
	type: {
		type: String,
		default: ''
	},
	created: {
		type: Date,
		default: Date.now
	},
	modified: {
		type: Date,
		default: Date.now
	}
});

/**
 * Enabling soft delete
 */
Team.plugin(softremove);

/**
 * Statics
 */
Team.statics.load = function(id, callback) {
	this.findOne({
		_id: id
	}).populate('role').exec(callback);
};

mongoose.model('Team', Team);