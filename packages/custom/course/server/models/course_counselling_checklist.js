'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var validateUniqueChecklistTitle = function(value, callback) {
	  var CourseCounsellingChecklist = mongoose.model('CourseCounsellingChecklist');
	  CourseCounsellingChecklist.find({
	    $and: [{
	    	title: value
	    }, {
	      _id: {
	        $ne: this._id
	      }
	    }]
	  }, function(err, CourseCounsellingChecklist) {
	    callback(err || CourseCounsellingChecklist.length === 0);
	  });
	};
	var validateUniqueCourse = function(value, callback) {
		  var CourseCounsellingChecklist = mongoose.model('CourseCounsellingChecklist');
		  CourseCounsellingChecklist.find({
		    $and: [{
		    	course: value
		    }, {
		      _id: {
		        $ne: this._id
		      }
		    }]
		  }, function(err, CourseCounsellingChecklist) {
		    callback(err || CourseCounsellingChecklist.length === 0);
		  });
		};

/**
 *  Course Counselling checklist feedback Schema.
 */
var CourseCounsellingChecklistSchema = new Schema({
 course: {
			type: Schema.ObjectId,
		    ref: 'Course',
		    unique:true,
		    validate:[validateUniqueCourse,"Checklist for the course already exists"]
		},
 	questions :[{
 		title:{
 			type:String,
 			required:true,
 			unique:true,
 			validate:[validateUniqueChecklistTitle,"Title already exists"]
 		},
 		description: {
 			type:String,
 			required:true
 		}
 		 	}],
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
CourseCounsellingChecklistSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).populate('course').exec(callback);
};




mongoose.model('CourseCounsellingChecklist', CourseCounsellingChecklistSchema);