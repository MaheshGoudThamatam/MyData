'use strict';

/**
 * <Author:Akash Gupta>
 * <Date:22-06-2016>
 * <schema for Training>
 */

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var softremove = require('mongoose-soft-remove');

//Training Unique validation for case sensitive
var validateUniqueName = function (value, callback) {
    var Training = mongoose.model('Training');
    Training.find({
        $and: [
            {
                training_name: { $regex: new RegExp(value, 'i') }

            },
            {
                _id: {
                    $ne: this._id
                }
            }
        ]
    }, function (err, training) {
        callback(err || training.length === 0);
    });
};


/**
 * ConfigType Schema.
 */
var TrainingSchema = new Schema({
    training_name: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        validate:[validateUniqueName,'Training already exists']
    },
    shortName: {
        type: String,
        trim: true
    },
    company: {
        type: Schema.ObjectId
    },
    active: {
        type: Boolean,
        default: true
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
TrainingSchema.plugin(softremove);

TrainingSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};

module.exports = function(connection) {
    return connection.model('Training', TrainingSchema);
};