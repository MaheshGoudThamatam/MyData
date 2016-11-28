'use strict';
/*
 * <Author: Mahesh Goud>
 * <Date:21-07-2016>
 * <Sub task Schema >
 */
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var softremove = require('mongoose-soft-remove');

var SubTaskSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    company: {
        type: Schema.ObjectId
    },

    building: {
        type: Schema.ObjectId
    },
    security_task: {
        type: Schema.ObjectId
    },
    isPerformed: {
        type: Boolean,
        default: false
    },
    assignTo: {
        type: Schema.ObjectId
    },
    createdBy: {
        type: Schema.ObjectId
    },

    updatedBy: {
        type: Schema.ObjectId
    },

    active: {
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
    estimated_hour: {
        type: Number
    }
});

/**
 * Enabling soft delete
 */
SubTaskSchema.plugin(softremove);

SubTaskSchema.statics.load = function(id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};

module.exports = function(connection, callback) {
    return connection.model('SubTask', SubTaskSchema);
};