'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
/**
 * Policy Schema.
 */
var RiskFactorSchema = new Schema({
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
    technology: {
        type: Boolean
    },
   
});
/**
 * Statics
 */
RiskFactorSchema.statics.load = function(id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};
mongoose.model('RiskFactors', RiskFactorSchema);