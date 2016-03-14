'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var validateUniqueStudentCourseName = function(value, callback) {
	  var StudentCourse = mongoose.model('StudentCourse');
	  StudentCourse.find({
	    $and: [{
	      studentName: { $regex : new RegExp(value, "i") }
	    }, {
	      _id: {
	        $ne: this._id
	      }
	    }]
	  }, function(err, studentCourse) {
	    callback(err || studentCourse.length === 0);
	  });
	};

/**
 * Schema.
 */
var StudentCourseSchema = new Schema({
	course: {
        type: Schema.ObjectId, 
        ref: 'Course'
    },
	user: {
        type: Schema.ObjectId, 
        ref: 'User'
    },
    user_status: {
    	type: String,
	    default: 'Pending',
	    trim: true
	},
	batch: {
		type: Schema.ObjectId, 
        ref: 'Batch'
	},
	branch: {
		type: Schema.ObjectId, 
        ref: 'Branch'
	},
	Accepted_Date:{
		type:Date,
		default: Date.now
	},
	assign_Test: {
		type: Schema.ObjectId, 
        ref: 'Onlinetest'
	},
	course_status: {
    	type: String,
	    default: 'Open',
	    trim: true
	},
	paymentschedule: {
		type: Schema.ObjectId, 
        ref: 'PaymentScheme'
	},
	remarks:{
		type: String,
	    default: '',
	    trim: true
	},	
	 test: [{
		   marks_obtained: {
		   type: Number,
		    default: 70
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

StudentCourseSchema.plugin(deepPopulate, {whitelist: [
     'user',
     'user.address',
     'user.qualification_details',
     'user.additional_documents',
     'user.experience_details',
     'user.references',
     'user.skills',
     'user.role'
 ]});

/**
 * Statics
 */
StudentCourseSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).populate('paymentschedule').exec(callback);
};

mongoose.model('StudentCourse', StudentCourseSchema);