'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var UserCourseSchema = new Schema({
  course: {
	  type: Schema.ObjectId,
	  ref: 'Course'
	    },
   user: {
	  type: Schema.ObjectId,
	  ref: 'User'
	  },
  payment_method:{
	  type:String
  },
  isEnrolled:{
	  type:Boolean,
	  default:'false'
  },
  batch:{
	  type: Schema.ObjectId,
	  ref: 'Batch'
  },
  counselling:{
	type:[String]  
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

 UserCourseSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).populate('user', 'name username').populate('course', 'name course_picture ').exec(callback);
};


mongoose.model('UserCourse', UserCourseSchema);