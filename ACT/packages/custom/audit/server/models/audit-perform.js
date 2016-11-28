'use strict';
/*
 * <Author: Abha Singh> <Date: 11-07-2016> <audit-perform Schema >
 */
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var softremove = require('mongoose-soft-remove');

var AuditPerformSchema = new Schema({ 
    
    audit: {
        type: Schema.ObjectId,
        ref: 'Audit'      
    },
    
    responses: [{ 
        question: {
            type: String
        },
        answer:{
            type: String,
            required:true
        },
        security_task:{
            type: Schema.ObjectId
        }
    }],
    
    company: {
        type: Schema.ObjectId
    },
    
    performed_By: {
        type: Schema.ObjectId
    },
    
    performed_At: {
        type: Date,
        default: Date.now
    }

});

/**
 * Enabling soft delete
 */
AuditPerformSchema.plugin(softremove);

AuditPerformSchema.statics.load = function(id, callback) {
    this.findOne({
        _id: id
    }).populate('audit','').exec(callback);
};

module.exports = function(connection, callback) {
    return connection.model('AuditPerform', AuditPerformSchema);
};