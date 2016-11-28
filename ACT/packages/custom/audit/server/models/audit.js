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
var AuditSchema = new Schema({
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
    location: {
        type: Schema.ObjectId
    },
    company: {
        type: Schema.ObjectId,
    },
    createdBy: {
        type: Schema.ObjectId
    },

    updatedBy: {
        type: Schema.ObjectId
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date,
        default: Date.now
    },
    building: {
        type: Schema.ObjectId
    },
    date: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    },
    audit_category: {
        type: Schema.ObjectId
    },
    security_manager: {
        type: Schema.ObjectId
    },
    isPerformed:{
    	type:Boolean,
    	default:false
    }

});

/**
 * Enabling soft delete
 */
AuditSchema.plugin(softremove);

/**
 * Statics
 */
AuditSchema.statics.load = function(id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};

/**
 * Create a model using schema
 */

module.exports = function(connection) {
    return connection.model('Audit', AuditSchema);
};