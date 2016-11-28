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
var NotificationSchema = new Schema({
	isRead: {
		type: Boolean,
		trim: false,
		default: false
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User',
		required: true
	},
	title: {
		type: String,
		default: ''
	},
	description: {
		type: String,
		default: ''
	},
	url: {
		type: String,
		default: ''
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
NotificationSchema.plugin(softremove);

NotificationSchema.statics.load = function(id, callback) {
	this.findOne({
		_id: id
	}).populate('user').exec(callback);
};

NotificationSchema.statics.loadByUser = function(id, callback) {
	this.find({
			user: id
		})
		.sort({
			name: 'asc',
			createdAt:-1
		}).populate('user').exec(callback);
};

NotificationSchema.statics.loadActiveByUser = function(id, callback) {
	this.find({
			user: id,
			isRead: false
		})
		.sort({
			name: 'asc',
			createdAt:-1
		}).populate('user').exec(callback);
};

mongoose.model('Notification', NotificationSchema);