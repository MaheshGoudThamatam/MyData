'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Course-installment Schema.
 */
var CourseInstallmentSchema = new Schema({
   course: {
     type: Schema.ObjectId,
	 ref: 'Course'
	},
   courseMode: {
    type: Schema.ObjectId,
    ref: 'CourseMode'
	},	    
	sequence:{
		type:Number
	},
	isLoanApplicable:{
		type:Boolean
	},
	loanPercentage:{
		type:Number
	},
	
   paid_amount:{
    	type:Number
    },
    remaining_amount:{
    	type:Number
    },
    due_date:{
    	type: Number,
    
    },
    due_date_type:{
    	type: String,
    
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
CourseInstallmentSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};




mongoose.model('CourseInstallment', CourseInstallmentSchema);