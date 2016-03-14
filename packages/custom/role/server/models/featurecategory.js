'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var validateUniqueName = function (value, callback) {
    var FeatureCategory = mongoose.model('FeatureCategory');
    FeatureCategory.find({
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
    }, function (err, featurecategory) {
        callback(err || featurecategory.length === 0);
    });
};


/**
 * ConfigType Schema.
 */
var FeatureCategorySchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        validate: [validateUniqueName, 'Name already exists']

    },
    icon: {
        type: String,
        trim: true,
        required: true
    },
    description: {
        type: String,
        trim: true,
        required: true
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

FeatureCategorySchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};
mongoose.model('FeatureCategory', FeatureCategorySchema);