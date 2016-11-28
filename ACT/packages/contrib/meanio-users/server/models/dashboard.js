'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
var softremove = require('mongoose-soft-remove');

/**
 * ConfigType Schema.
 */
var DashboardSchema = new Schema({
	name: {
		type: String,
		trim: true,
		required: true
	},

	description: {
		type: String,
		trim: true,
		required: true
	},

	dimension: {
		type: String,
		trim: true,
		required: true
	}

});

/**
 * Enabling soft delete
 */
DashboardSchema.plugin(softremove);

/**
 * Statics
 */
DashboardSchema.statics.load = function(id, callback) {
	this.findOne({
		_id: id
	}).exec(callback);
};
mongoose.model('Dashboard', DashboardSchema);