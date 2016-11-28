'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	deepPopulate = require('mongoose-deep-populate')(mongoose);
var softremove = require('mongoose-soft-remove');
/**
 * Virtual Schema.
 */
var virtualOfficeSchema = new Schema({

	name: {
		type: String,
		default: ""
	},
	loc: {
		type: [Number],
		index: '2dsphere'
	},
	spaceId: {
		type: Schema.ObjectId,
		ref: "Space"
	},
	created: {
		type: Date,
		default: Date.now
	},
	image: {
		type: String,
		default: ''
	},
	description: {
		type: String,
		default: ''
	},
	packages: [{
		packageName: {
			type: String,
			default: ""
		},
		packageUrl: {
			type: String,
			default: ""
		},
		paymentPlan: [{
			plan: {
				type: String
			},
			amount: {
				type: Number
			}
		}],
		facilityList: [{
			facility: {
				type: String
			},
			description: {
				type: String
			},
			isAvailable: {
				type: Boolean
			}
		}]
	}],
	createdBy: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	roomtype: {
		type: Schema.ObjectId,
		ref: "Roomstype"
	},
	partner: { // hotel or business center
		type: Schema.ObjectId,
		ref: 'User'
	}

});

/**
 * Enabling soft delete
 */
virtualOfficeSchema.plugin(softremove);

virtualOfficeSchema.plugin(deepPopulate, {
	whitelist: [
		'spaceId',
		'spaceId.partner'
	]
});
virtualOfficeSchema.statics.load = function(id, callback) {
	this.findOne({
		_id: id
	}).deepPopulate(['spaceId', 'spaceId.partner']).exec(callback);
};

mongoose.model('virtualOffice', virtualOfficeSchema);