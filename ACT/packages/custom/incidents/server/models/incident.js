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
var IncidentSchema = new Schema({
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
    building: {
        type: Schema.ObjectId
    },
    location: {
        type: Schema.ObjectId
    },
    company: {
        type: Schema.ObjectId
    },
    securitytask: {
        type: Schema.ObjectId
    },
    photo: {
        type: String
    },
    incidenttype :{
        type: Schema.ObjectId
    }
});

/**
 * Enabling soft delete
 */
IncidentSchema.plugin(softremove);

/**
 * Statics
 */
IncidentSchema.statics.load = function(id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};

/**
 * Create a model using schema
 */

module.exports = function(connection) {
    return connection.model('Incident', IncidentSchema);
};