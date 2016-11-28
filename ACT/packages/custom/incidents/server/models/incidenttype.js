'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var softremove = require('mongoose-soft-remove');

/**
 * ConfigType Schema.
 */
var IncidentTypeSchema = new Schema({
    incidenttype: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    description: {
        type: String,
        trim: true,
        required: true
    }
});

/**
 * Enabling soft delete
 */
IncidentTypeSchema.plugin(softremove);

/**
 * Statics
 */
IncidentTypeSchema.statics.load = function(id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};
mongoose.model('IncidentType', IncidentTypeSchema);