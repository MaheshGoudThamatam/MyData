'use strict';
/*
 * <Author:Akash Gupta>
 * <Date:25-07-2016>
 * <Security Task Schema>
 * <plugins used: mongoose, mongoose-soft-remove(soft delete)>
 */

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var softremove = require('mongoose-soft-remove');

/**
 * ConfigType Schema.
 */
var SecurityTaskSchema = new Schema({
    task_name: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    risk: {
        type: Schema.ObjectId
    },
    responsible_action: {
        type: Schema.ObjectId
    },
    responsible_followUp: {
        type: Schema.ObjectId
    },
    deadline: {
        type: Date
    },
    status: {
        type: Boolean,
        default: false
    },
    cost: {
        type:Number
    },
    company: {
        type: Schema.ObjectId
    },
    building: {
        type: Schema.ObjectId
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
    completedAt: {
        type: Date
    },
    source: {
        type: String
    },
    sourceId: {
        type: Schema.ObjectId
    },
    attachments: {
        type: String,
        trim:true
    }
});

/**
 * Enabling soft delete
 */
SecurityTaskSchema.plugin(softremove);

SecurityTaskSchema.statics.load = function(id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};

module.exports = function(connection, callback) {
    return connection.model('SecurityTask', SecurityTaskSchema);
};