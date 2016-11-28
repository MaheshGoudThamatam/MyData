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
var partnerTeam = new Schema({
	partner: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	team: {
		type: Schema.ObjectId,
		ref: 'User'
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
partnerTeam.plugin(softremove);

mongoose.model('PartnerTeam', partnerTeam);