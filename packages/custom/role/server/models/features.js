'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var validateUniqueName = function (value, callback) {
    var Feature = mongoose.model('Feature');
    Feature.find({
        $and: [
            {
                name: { $regex: new RegExp(value, "i") }

            },
            {
                _id: {
                    $ne: this._id
                }
            }
        ]
    }, function (err, feature) {
        callback(err || feature.length === 0);
    });
};

/**
 * ConfigType Schema.
 */
var FeatureSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        validate: [validateUniqueName, 'Name already exists!']
    },
    featureCategory: {
    	type: Schema.ObjectId, 
    	ref: 'FeatureCategory'
    },
    url: {
        type: String,
        trim: true,
        required: true
    },
    icon: {
        type: String,
        trim: true,
        required: true
    },
    color: {
        type: String,
        trim: true,
        required: true
    },
    description: {
        type: String,
        trim: true,
        required: true
    },
    width: {
        type: String,
        trim: true,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    isComponent: {
        type: Boolean,
        default: false
    }
});

FeatureSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).populate('featureCategory').exec(callback);
};
mongoose.model('Feature', FeatureSchema);