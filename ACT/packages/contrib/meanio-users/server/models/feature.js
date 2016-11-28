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
var FeatureSchema = new Schema({
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
    url: {
        type: String,
        trim: true,
        required: true
    },
    position: {
        type: Number
    },
    access: {},
    icon: {
        type: String
    },
    system: {
        type: Boolean,
        default: false
    }
});

/**
 * Enabling soft delete
 */
FeatureSchema.plugin(softremove);

/**
 * Statics
 */
FeatureSchema.statics.load = function(id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};
mongoose.model('Feature', FeatureSchema);