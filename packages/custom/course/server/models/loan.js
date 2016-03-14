'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var LoanSchema = new Schema({
	payment_for: {
		type: String
	},
	loan_amount: {
		type: Number
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


LoanSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).populate('PaymentScheme').exec(callback);
};


mongoose.model('Loan', LoanSchema);