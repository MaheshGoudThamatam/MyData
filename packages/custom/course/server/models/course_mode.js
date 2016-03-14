'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var CourseModeSchema = new Schema({
  
	mode:{
		type:String
	},
	sequence:{
		type:Number
	},
	deposit_amount:{
		type:Number
	},
	period:{
		type:Number
	},
	period_type:{
		type:String
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

CourseModeSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).populate('user', 'name username').populate('course', 'name course_picture ').exec(callback);
};


mongoose.model('CourseMode', CourseModeSchema);