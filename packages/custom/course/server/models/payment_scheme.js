'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var deepPopulate = require('mongoose-deep-populate')(mongoose);


var PaymentSchemeSchema = new Schema({
	course: {
		type: Schema.ObjectId,
		ref: 'Course'
	},
	cost: {
		type: Number
	},
	paymentScheme: {
		type: String
	},
	installments: [{
		paymentFor : String,
		installmentAmount : Number,
		fineAmount : Number,
		dueDate : Number,
		isDownPayment: Boolean,
		isLoan : Boolean,
		loanId : {
			type: Schema.ObjectId,
			ref: 'Loan'
		},
		discounts: [{
			marks_form: Number,
			marks_to: Number,
			rate: Number
		}]
	}],
	country: {
		type: Schema.ObjectId,
		ref: 'Country'
	},
	branch: {
		type: Schema.ObjectId,
		ref: 'Branch'
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

PaymentSchemeSchema.plugin(deepPopulate, {whitelist: [
     'loanId',
     'installments.loanId'
 ]});


PaymentSchemeSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).populate('skill', 'name description').populate('course', 'name description').populate('installments.loanId').exec(callback);
};


mongoose.model('PaymentScheme', PaymentSchemeSchema);