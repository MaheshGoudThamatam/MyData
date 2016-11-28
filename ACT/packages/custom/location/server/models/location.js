'use strict';
/*
 * <Author: Abha Singh>
 * <Date:21-06-2016>
 * <location Schema >
 */
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var softremove = require('mongoose-soft-remove');

var LocationSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    address_line_1: {
        type: String,
        required: true,
        trim: true
    },

    address_line_2: {
        type: String,
        trim: true
    },

    city: {
        type: String,
        trim: true,
        required: true
    },

    country: {
        type: String,
        required: true,
        trim: true
    },

    zip_code: {
        type: String,
        required: true,
        trim: true
    },

    contact_number: {
        type: String,
        required: true,
        trim: true
    },

    square_feet: {
        type: Number,
        //required: true,
        trim: true
    },

    /*policy: [{
    	type: String     //Need to confirm if required
      }],*/

    company: {
        type: Schema.ObjectId
    },

    loc: {
        type: [Number]
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
LocationSchema.plugin(softremove);

LocationSchema.statics.load = function(id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};

module.exports = function(connection, callback) {
    return connection.model('Location', LocationSchema);
};