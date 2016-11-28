'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var softremove = require('mongoose-soft-remove');

/**
 * Create a Schema.
 */
var RiskSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },

    description: {
        type: String,
        trim: true,
        required: true
    },

    members_participating: [{
        type: Schema.ObjectId
    }],

    riskRating: {
        type: Number,
        trim: true
    },

    createdBy: {
        type: Schema.ObjectId
    },

    updatedBy: {
        type: Schema.ObjectId
    },

    isActive: {
        type: Boolean,
        default: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date,
        default: Date.now
    },

    company: {
        type: Schema.ObjectId
    },

    location: {
        type: Schema.ObjectId
    },

    building: {
        type: Schema.ObjectId
    },

    likelihood: {
        type: Number
    },

    consequence: {
        type: Number
    },

    locations: {}
});

/**
 * Enabling soft delete
 */
RiskSchema.plugin(softremove);

/**
 * Statics
 */
RiskSchema.statics.load = function(id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};

/**
 * Create a model using schema
 */

module.exports = function(connection) {
    return connection.model('Risk', RiskSchema);
};