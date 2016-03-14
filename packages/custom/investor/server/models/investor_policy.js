'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var validateUniqueInvestorPolicyName = function(value, callback) {
	  var InvestorPolicy = mongoose.model('InvestorPolicy');
	  InvestorPolicy.find({
	    $and: [{
	      investorName: { $regex : new RegExp(value, "i") }
	    }, {
	      _id: {
	        $ne: this._id
	      }
	    }]
	  }, function(err, investorRequest) {
	    callback(err || investorRequest.length === 0);
	  });
	};

/**
 * InvestorPolicy Schema.
 */
var InvestorPolicySchema = new Schema({
	user: {
        type: Schema.ObjectId, 
        ref: 'User'
    },
	policy: {
    	type: Schema.ObjectId, 
        ref: 'Policy'
	},
	policy_amount: {
		type: Number
	},
    user_status: {
    	type: String,
	    default: 'Pending',
	    trim: true
	},
	policy_status:{
		type: String,
	    default: '',
	    trim: true
	},
	policy_payment_status:{
		type: String,
	    default: '',
	    trim: true
	},
	comments:{
		type: String,
	    default: '',
	    trim: true
	},
    request_posted: {
        type: Date,
	    default: Date.now
	},
	policy_accepted_date: {
		type: Date
	},
	pre_closed: {
		type: Boolean,
		default: false
	},
	pre_closure_amount: {
		type: Number
	},
	pre_closure_date: {
		type: Date
	},
	pre_closure_comments:{
		type: String,
	    default: '',
	    trim: true
	},
	auto_renewal:{
		type: Boolean,
	    default: '',
	    trim: true
	},
	fund_control:{
		type: Number,
	    default: 0,
	    trim: true
	},
	assigned_by:{
		 type: Schema.ObjectId, 
        ref: 'User'
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

InvestorPolicySchema.plugin(deepPopulate, {whitelist: [
     'user',
     'user.address',
     'user.qualification_details',
     'user.additional_documents',
     'user.experience_details',
     'user.references',
     'user.skills',
     'user.role',
     'policy',
     'policy.technologyriskfactors',
     'policy.riskfactors'
 ]});

/**
 * Statics
 */
InvestorPolicySchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).populate('user').deepPopulate(['policy', 'policy.technologyriskfactors', 'policy.riskfactors']).exec(callback);
};


mongoose.model('InvestorPolicy', InvestorPolicySchema);