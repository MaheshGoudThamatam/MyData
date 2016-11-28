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
    var AuditCategory = mongoose.model('AuditCategory');
    AuditCategory.find({
        $and: [{
            name: {
                $regex: new RegExp('^' + value + '$', "i")
            }

        }, {
            _id: {
                $ne: this._id
            }
        }]

    }, function(err, auditCategory) {
        callback(err || auditCategory.length === 0);
    });

};

/**
 * Create a Schema.
 */
var AuditCategorySchema = new Schema({
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
    },
    admin: {
        type: Boolean,
        default: false
    },
    questionscount:
    {
       type: Number
    }
});

/**
 * Enabling soft delete
 */
AuditCategorySchema.plugin(softremove);

/**
 * Statics
 */
AuditCategorySchema.statics.load = function(id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};

/**
 * Create a model using schema
 */
mongoose.model('AuditCategory', AuditCategorySchema);