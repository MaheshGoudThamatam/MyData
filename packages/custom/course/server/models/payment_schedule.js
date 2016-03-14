'use strict';

 var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

 var PaymentscheduleSchema = new Schema({
	
 paymentschemeId: {
    type: Schema.ObjectId,
    ref: 'PaymentScheme'
 },
 course: {
		type: Schema.ObjectId,
		ref: 'Course'
	},
 batch: {
		type: Schema.ObjectId,
		ref: 'Batch'
	},
 student:{
	 type: Schema.ObjectId,
	 ref: 'User'
 },
 courseRequest:{
	 type: Schema.ObjectId,
	 ref: 'CourseRequest'
 },
 cost: {
		type: Number
	},
 
installments: [{
	paymentFor : String,
	isDownPayment: Boolean,
    amount : Number,
    dueDays : Number,
    fineAmount : Number,
    fineCharge : Number,
    discountAmount : Number,
    remarks : String,
    totalAmount : Number,
    dueDate : Date,
    paidDate : Date,
    paid : Boolean ,
    isLoan : Boolean,
	loanId : {
		type: Schema.ObjectId,
		ref: 'Loan'
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


PaymentscheduleSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};


mongoose.model('Paymentschedule', PaymentscheduleSchema);