'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var JobSiteSchema = new Schema({
  
	name:{
		type:String
	},
	description:{
		type:String
	},
	domain:{
		type:String
	},
	apiAvailable:{
		type:String
	},
	urlLogin:{
		type:String
	},
	urlProfile:{
		type:String
	},
	urlProject:{
		type:String
	},
	proposal:{
		type:String
	}

});

JobSiteSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};


mongoose.model('JobSite', JobSiteSchema);