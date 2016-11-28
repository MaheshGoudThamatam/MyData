'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
Schema = mongoose.Schema,
deepPopulate = require('mongoose-deep-populate')(mongoose);


/**
 * PlugNPlay Schema.
 */
var PlugNPlayUsersSchema = new Schema ({

first_name:{
	type:String
},
email:{
	type:String
},
phonenumber:{
	type:Number
},
noOfDesks:{
	type:Number
},
comments:{
	type:String
},
area:{
	type:String
},
city:{
	type:String
},
startDate:{
	type:String
},
duration:{
	type:String
},
budget:{
	type:String
},
companyName:{
	type:String
}






});

PlugNPlayUsersSchema.statics.load = function(id, callback) {
	this.findOne({
		_id: id
	}).exec(callback);
};

mongoose.model('PlugNPlayUsers', PlugNPlayUsersSchema);