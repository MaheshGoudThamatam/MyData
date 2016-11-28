'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
var softremove = require('mongoose-soft-remove');

/**
 * Rooms Schema.
 */
var ReviewSchema = new Schema({
	space: {
		type: Schema.ObjectId,
		ref: 'Space'
	},
	booking: {
		type: Schema.ObjectId,
		ref: 'Booking'
	},
	title: {
		type: String,
		default: ""
	},
	text: {
		type: String,
		default: ""
	},
	rating: {
		type: Number
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	updatedAt: {
		type: Date,
		default: Date.now
	},
	createdBy: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

/**
 * Enabling soft delete
 */
ReviewSchema.plugin(softremove);

/**
 * Indexex
 */

ReviewSchema.index({rating: 1, createdAt: 1})
ReviewSchema.index({rating: 1, createdAt: -1})
ReviewSchema.index({rating: -1, createdAt: 1})

/**
 * Statics
 */
ReviewSchema.statics.load = function(id, callback) {
	this.findOne({
		_id: id
	}).populate('createdBy', '_id, first_name, avatar').populate('space', '_id').populate('booking', '_id, bookingDate').exec(callback);
};

mongoose.model('Review', ReviewSchema);