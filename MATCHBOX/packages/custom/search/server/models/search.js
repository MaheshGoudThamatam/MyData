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
var SearchTypeSchema = new Schema({
	room: {
		type: Schema.ObjectId,
		ref: 'Rooms'
	},
	spaceId: {
		type: Schema.ObjectId,
		ref: "Space"
	},
	loc: {
		type: [Number],
		index: '2dsphere'
	},
	roomType: {
		type: Schema.ObjectId,
		ref: "Roomstype"
	},
	day: {
		type: String
	},
	date: {
		type: Date
	},
	updatedAt: {
		type: String,
		default: new Date().toISOString().slice(0, -5).concat('Z')
	},
	createdAt: {
		type: String,
		default: new Date().toISOString().slice(0, -5).concat('Z')
	},
	initialAval: [{
		startTime: Date,
		/* schedule start time */
		endTime: Date,
		/* schedule end time */

	}],
	currentAval: [{
		startTime: Date,
		/* schedule start time */
		endTime: Date,
		/* schedule end time */
		isBlocked: {
			type: Boolean,
			default: false
		}

	}],
	bookings: [{
		bookingId: {
			type: Schema.ObjectId,
			ref: 'Booking'
		},
	}],
	isAllday: {
		type: Boolean
	},
	isClosed: {
		type: Boolean
	}

});

/**
 * Enabling soft delete
 */
SearchTypeSchema.plugin(softremove);

/**
 * Statics
 */
SearchTypeSchema.statics.load = function(id, callback) {
	this.findOne({
		_id: id
	}).exec(callback);
};

mongoose.model('Schedule', SearchTypeSchema);