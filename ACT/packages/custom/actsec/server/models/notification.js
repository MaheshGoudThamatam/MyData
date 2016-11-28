var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var NotificationSchema = new Schema({
	title: {
		type: String,
		required: true
	},
	icon: {
		//Font-awesome icon string (Ex: 'fa-user')
		type: String,
		required: true
	},
	link: {
		type: String,
		required: true
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User',
		required: true
	},
	read: {
		type: Boolean,
		default: false
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
});

NotificationSchema.index({
	createdAt: -1
});
NotificationSchema.index({
	createdAt: 1
});

NotificationSchema.statics.getUserNotifs = function(userId, callback) {
	return this.find({
		$and: [{
			user: userId
		}, {
			read: false
		}]
	}).sort({
		createdAt: -1
	}).exec(callback);
};

NotificationSchema.statics.markRead = function(notifId, callback) {
	return this.findOne({
		_id: notifId
	}).update({
		$set: {
			read: true
		}
	}).exec(function(err, notif) {
		if (err) {
			callback(err, undefined);
		} else {
			callback(undefined, notif);
		}
	});
};

NotificationSchema.statics.markAllRead = function(userId, callback) {
	return this.update({
		user: userId
	}, {
		$set: {
			read: true
		}
	}, {
		multi: true
	}).exec(callback);
};

NotificationSchema.statics.addNotif = function(title, icon, link, userId, callback) {
	var notif = new this({
		title: title,
		icon: icon,
		link: link,
		user: userId
	});
	notif.save(callback);
};

NotificationSchema.statics.getAllUserNotifs = function(userId,perPage,skipCount, callback) {
	return this.find({
		user: userId
	}).limit(perPage).skip(skipCount)
	  .sort({
		createdAt: -1
	}).exec(callback);
};

mongoose.model('Notification', NotificationSchema);