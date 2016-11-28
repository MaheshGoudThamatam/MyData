'use strict';
/*
 * <Author: Abha Singh>
 * <Date:22-06-2016>
 * <document Schema >
 */

/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var softremove = require('mongoose-soft-remove');

var DocumentSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        required: true,
        trim: true
    },

    documentUpload: {
        type: String,
        trim: true,
        required: true
    },

    document_category: {
        type: Schema.ObjectId,
        ref: 'DocumentCategory',
        required: true,
        trim: true
    },

    company: {
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
    }
});

/**
 * Enabling soft delete
 */
DocumentSchema.plugin(softremove);

DocumentSchema.statics.load = function(id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};

module.exports = function(connection, callback) {
    return connection.model('Document', DocumentSchema);
};