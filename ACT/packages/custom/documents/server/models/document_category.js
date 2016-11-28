'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var softremove = require('mongoose-soft-remove');

/**
 * Unique Field Validations to check case-sensitive.
 */
var validateUniqueName = function(value, callback) {
    var DocumentCategory = mongoose.model('DocumentCategory');
    DocumentCategory.find({
        $and: [{
            name: {
                $regex: new RegExp('^' + value + '$', "i")
            }

        }, {
            _id: {
                $ne: this._id
            }
        }]

    }, function(err, documentCategory) {
        callback(err || documentCategory.length === 0);
    });

};

/**
 * Create a Schema.
 */
var DocumentCategorySchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        validate: [validateUniqueName, 'Name already exists!']
    },

    description: {
        type: String,
        trim: true,
        required: true
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

    isActive: {
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
DocumentCategorySchema.plugin(softremove);

/**
 * Statics
 */
DocumentCategorySchema.statics.load = function(id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};

/**
 * Create a model using schema
 */

module.exports = function(connection) {
    return connection.model('DocumentCategory', DocumentCategorySchema);
};
