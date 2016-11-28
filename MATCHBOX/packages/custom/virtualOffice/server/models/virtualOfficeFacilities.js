'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
var softremove = require('mongoose-soft-remove');
/**
 * Space Type Schema.
 */
var VitualOfficeFacilitySchema = new Schema({
	name: {
		type: String,
		default: ''
	},
	description: {
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
VitualOfficeFacilitySchema.plugin(softremove);

/**
 * Statics
 */
VitualOfficeFacilitySchema.statics.load = function(id, callback) {
	this.findOne({
		_id: id
	}).exec(callback);
};

mongoose.model('VitualOfficeFacility', VitualOfficeFacilitySchema);