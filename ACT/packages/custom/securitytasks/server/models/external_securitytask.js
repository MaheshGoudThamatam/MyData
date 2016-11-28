'use strict';
/*
 * <Author: Abha Singh> <Date: 11-07-2016> <audit-perform Schema >
 */
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var softremove = require('mongoose-soft-remove');

var ExternalSecurityTaskSchema = new Schema({

    company: {
        type: Schema.ObjectId,
        required: true
    },

    building: {
        type: Schema.ObjectId
            //        required:true
    },

    task_name: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    query: {
        type: String
    },
    status: {
        type: String
    },
    estimated_hours: {
        type: Number
    },
    estimated_cost: {
        type: Number
    },
    actual_hours: {
        type: Number
    },
    actual_cost: {
        type: Number
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
    isUpdated: {
        type: Boolean,
        default: false
    },
    attach_invoice:{
    	type:String
    },
    securitytask:{
    	type: Schema.ObjectId
    },
    comments: [],
    isDeclined: {
        type: Boolean,
        default: false
    },
    isClosed:{
        type: Boolean,
        default: false
    },
    attach_photo:{
    	type:String
    }
});

/**
 * Enabling soft delete
 */
ExternalSecurityTaskSchema.plugin(softremove);

ExternalSecurityTaskSchema.statics.load = function(id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};

module.exports = function(connection, callback) {
    return connection.model('ExternalSecurityTask', ExternalSecurityTaskSchema);
};
