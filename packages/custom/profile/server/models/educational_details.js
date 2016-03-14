'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Educational Details Schema.
 */
var EducationalDetailSchema = new Schema({
    name: {
        type: String,
    },
    board:{
    	type:String
    },
    university:{
    	type:String
    },
    percentage:{
    	type:Number
    },
    yearOfPassing:{
    	type:Number
    },
    subjects:{
    	type:String
    },
    user:{
 	   type: Schema.ObjectId,
 		  ref: 'User'  
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
EducationalDetailSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};




mongoose.model('EducationalDetail', EducationalDetailSchema);