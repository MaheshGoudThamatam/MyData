'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
/**
 * Policy Schema.
 */
var PolicySchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    description: {
        type: String,
        trim: true,
    },
    mininvestment: {
        type: Number,
        default: 0
    },
    maxinvestment: {
        type: Number,
        default: 0
    },
    policyduration: {
        type: Number,
        default: 0
    },
    policynoticeperiod: {
        type: Number,
        default: 0
    },
    preclosureconditions: [{
        start_month: {
            type: Number
        },
        end_month: {
            type: Number
        },
        rateofinterest: {
            type: Number
        }
    }],
    autorenewal: {
        type: Boolean
    },
    renewalperiod: {
        type: Number
    },
    policytype: {
        type: String,
        default: '',
        trim: true
    },
    fixedrateofinterest: {
        type: Number
    },
    riskfactors: [{ name :{
        type: Schema.ObjectId,
        ref: 'RiskFactors'
    },
    rateofinterest:{
        type: Number,
        trim: true
    }}],
    riskmininterest: {
        type: Number,
        trim: true
    },
    riskmaxinterest: {
        type: Number,
        trim: true
    },
    technologyriskfactors: [{ name :{
        type: Schema.ObjectId,
        ref: 'RiskFactors'
    },
    rateofinterest:{
        type: Number,
        trim: true
    }}],
    coustomdefinedrisks: [{
        name: {
            type: String
        },
        rateofinterest: {
            type: Number
        }
    }],
});
/**
 * Statics
 */
PolicySchema.statics.load = function(id, callback) {
    this.findOne({
        _id: id
    }).populate('riskfactors.name').populate('technologyriskfactors.name').exec(callback);
};
mongoose.model('Policy', PolicySchema);