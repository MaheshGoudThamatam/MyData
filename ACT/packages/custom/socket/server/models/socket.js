var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
var softremove = require('mongoose-soft-remove');

var SocketSchema = new Schema({
	socketId: {
		type: String
	},
	userId: {
		type: Schema.ObjectId
	},
	createdAt: {
		type: Date,
		default: Date.now		
	}
});

/**
 * Enabling soft delete
 */
SocketSchema.plugin(softremove);

SocketSchema.statics.getUserSockets = function(userId, callback) {
	return this.find({
		userId: userId
	}).exec(callback);
};

SocketSchema.statics.getSocketUser = function(socketId, callback) {
	return this.findOne({
		socketId: socketId
	}).exec(callback);
};

SocketSchema.statics.addSocket = function(socketId, userId, callback) {
	var socket = new this({
		socketId: socketId,
		userId: userId
	});
	socket.save(callback);
};

SocketSchema.statics.removeSocket = function(socketId, callback) {
	return this.findOne({
		socketId: socketId
	}).remove().exec(callback);
};

SocketSchema.statics.removeUserSockets = function(userId, callback) {
	return this.find({
		userId: userId
	}).remove().exec(callback);
};

mongoose.model('Socket', SocketSchema);