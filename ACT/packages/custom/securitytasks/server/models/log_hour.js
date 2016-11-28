'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var softremove = require('mongoose-soft-remove');

var LogHourSchema = new Schema({

    company: {
        type: Schema.ObjectId
    },

    person: {
        type: Schema.ObjectId,
        required: true
    },
//subTask reference
    task: {
        type: Schema.ObjectId,
        required: true
            //TODO ref
    },
    securitytask: {
        type: Schema.ObjectId,
        required: true
            //TODO ref
    },

    actual_time: {
        type: Number,
        required: true
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
LogHourSchema.plugin(softremove);

LogHourSchema.statics.load = function(id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};

module.exports = function(connection, callback) {
    return connection.model('LogHour', LogHourSchema);
};
