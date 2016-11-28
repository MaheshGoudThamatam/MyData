'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var softremove = require('mongoose-soft-remove');


/**
 * Create a Schema.
 */
var AuditQuestionSchema = new Schema({

    audit_question: {
        type: String,
        trim: true,
        required: true
    },
    audit_category: {
        type: Schema.ObjectId
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
    sequence: {
        type: Number,
        unique: false
    },
    securityTask: {
      type: Boolean,
      default: false  
    }

});



/**
 * Enabling soft delete
 */
AuditQuestionSchema.plugin(softremove);

/**
 * Statics
 */
AuditQuestionSchema.statics.load = function(id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};

/**
 * Create a model using schema
 */
mongoose.model('AuditQuestion', AuditQuestionSchema);