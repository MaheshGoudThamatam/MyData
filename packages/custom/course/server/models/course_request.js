'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var validateUniqueCourseRequestName = function(value, callback) {
	  var CourseRequest = mongoose.model('CourseRequest');
	  CourseRequest.find({
	    $and: [{
	      studentName: { $regex : new RegExp(value, "i") }
	    }, {
	      _id: {
	        $ne: this._id
	      }
	    }]
	  }, function(err, courseRequest) {
	    callback(err || courseRequest.length === 0);
	  });
	};

/**
 * CourseRequest Schema.
 */
var CourseRequestSchema = new Schema({
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
	requested_Date:{
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
	paymentscheme: {
	    type: Schema.ObjectId,
	    ref: 'PaymentScheme'
	 },
	 test: [{
		 marks_obtained: {
			type: Number,
		 	default: 70
		 }
	 }],
	 comments:{
			type: String,
		    default: '',
		    trim: true
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

CourseRequestSchema.plugin(deepPopulate, {whitelist: [
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
CourseRequestSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).populate('course').populate('payment_scheme').populate('branch').populate('user').exec(callback);
};

mongoose.model('CourseRequest', CourseRequestSchema);