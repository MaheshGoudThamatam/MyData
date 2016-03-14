'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Batch Schema.
 */
var UserAvailabilitySchema = new Schema({
	batch:{
		type: Schema.ObjectId,
          ref: 'Batch'
	},
	user:{
		type: Schema.ObjectId,
		  ref: 'User'
	},
    slotDate:{
        type: Date,
        required: true
    },
	start_time:{
		type: String,
         required:true
	},
    end_time:{
        type: String,
         required:true
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
UserAvailabilitySchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};




mongoose.model('UserAvailability', UserAvailabilitySchema);