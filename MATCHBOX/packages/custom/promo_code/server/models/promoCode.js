'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
var softremove = require('mongoose-soft-remove');

/**
 * Promo Codes Schema.
 */
var PromoCodeSchema = new Schema({
	promo_code: {
		type: String,
		default: ""
	},
	description: {
		type: String,
		default: ""
	},
	isPercent: {
		type: Boolean
	},
	value: {
		type: Number,
		min: 0
	},
	isActive: {
		type: Boolean,
		default: true
	},
	maxCount: {
		type: Number
	},
	useCount: {
		type: Number
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	updatedAt: {
		type: Date,
		default: Date.now
	}
});

/**
 * Enabling soft delete
 */
PromoCodeSchema.plugin(softremove);

/**
 * IndexesSS
 */

PromoCodeSchema.index({rating: 1, createdAt: 1})
PromoCodeSchema.index({rating: 1, createdAt: -1})
PromoCodeSchema.index({rating: -1, createdAt: 1})

/**
 * Statics
 */
PromoCodeSchema.statics.load = function(id, callback) {
	this.findOne({
		promo_code: id
	}).exec(callback);
};

mongoose.model('PromoCode', PromoCodeSchema);