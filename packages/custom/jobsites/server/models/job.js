'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var JobSchema = new Schema({
  
	companyName:{
		type:String
	},
	skills:[{
		type:String
	}],
	provider:{
		type:String
	},
	cost:{
		type:Number
	},
	description:{
		type:String
	},
	lastDate:{
		type:String
	}

});

JobSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};


mongoose.model('Job', JobSchema);