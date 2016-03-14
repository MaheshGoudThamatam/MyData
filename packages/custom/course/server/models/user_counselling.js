'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Counselling Schema.
 */
var UserCounsellingSchema = new Schema({
	
	Counselling_remarks:{
	  type:String	
	},
	start_time:{
		type:Number
	},
	end_time:{
		type:Number
	},
	 user:{
	   type: Schema.ObjectId,
	   ref: 'User'  
	   },
	 batch:{
		type: Schema.ObjectId,
	    ref: 'Batch'  
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
 * Statics
 */
UserCounsellingSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};




mongoose.model('UserCounselling', UserCounsellingSchema);