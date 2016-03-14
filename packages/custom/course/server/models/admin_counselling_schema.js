'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Counselling Schema.
 */
var CounsellingSchema = new Schema({
	branch:{
	   type: Schema.ObjectId,
		  ref: 'Branch'  
	},
	course:{
	   type: Schema.ObjectId,
		  ref: 'Course'  
	},
	studentName:{
	   type: Schema.ObjectId,
		  ref: 'User'  
	},
   	counsellingDate: {
      type: Date
    },
    counsellingSlot: {
   		type: String
   	},
    counsellingQuery: {
      type: String,
      default: ""
    },
   	status: {
   		type: String,
      default: "Pending"
   	},
   	mentorAssigned: {
   		type: Schema.ObjectId,
   		ref: 'User'
   	},
   	remarks: {
   		type: String,
      default: ""
   	},
   	stuentRemarks: {
   		type: String,
      default: ""
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
CounsellingSchema.statics.loadByUser = function (id, callback) {
    this.find({
        studentName : id
    }).sort({status: -1 }).populate('branch', 'branchName').populate('course', 'name').populate('studentName', 'name').populate('mentorAssigned', 'name').exec(callback);
};
CounsellingSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};



mongoose.model('Counselling', CounsellingSchema);