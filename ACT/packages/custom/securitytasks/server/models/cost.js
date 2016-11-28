'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var softremove = require('mongoose-soft-remove');

var CostSchema = new Schema({

    company: {
        type: Schema.ObjectId
    },
    //subTask reference
    task: {
        type: Schema.ObjectId,
        require: true
            //TODO ref
    },
    securitytask: {
        type: Schema.ObjectId,
        required: true
            //TODO ref
    },

    actual_cost: {
        type: Number,
        require: true
    },

    article: {
        type: String,
        trim: true
    },

    currency: {
        type: String
        //require: true
    },

    attach_invoice: {
        type: String
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
    }
});

/**
 * Enabling soft delete
 */
CostSchema.plugin(softremove);

CostSchema.statics.load = function(id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};

module.exports = function(connection, callback) {
    return connection.model('Cost', CostSchema);
};
