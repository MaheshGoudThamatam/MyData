'use strict';

/**
 * <Author:Akash Gupta>
 * <Date:24-06-2016>
 * <Access Control Schema>
 */

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var softremove = require('mongoose-soft-remove');

/**
 * ConfigType Schema.
 */
var AccessControlSchema = new Schema({
    accessControl_provider: {
        type: String,
        trim: true,
        required: true
    },
    model: {
        type: String,
        trim: true
    },
    year: {
        type: Number,
        trim: true
    },
    replacement_year: {
        type: Number,
        trim: true
    },
    reader: {
        type: String,
        trim: true
    },
    lock: {
        type: String,
        trim: true
    },
    system_responsible: {
        name:{
            type: String,
            trim: true
        },
        email: {
            type: String,
            trim: true
        },
        contact_number: {
            type:String,
            trim:true
        }
    },
    external_person: {
        model:{
            type: String,
            trim: true
        },
        provider:{
        	type: String,
            trim: true
        },
        email: {
            type: String,
            trim: true
        },
        contact_number: {
            type:String,
            trim:true
        }
    },
    readers: {
        type: Number,
        trim:true
    },
    nodes: {
        type: Number,
        trim: true
    },
    user_licenses: {
        type: Number,
        trim: true
    },
    service_agreement: {
        emergencyDuty: {
            type: Boolean,
            default: false
        },
        annualService: {
            type: Boolean,
            default: false
        }
    },
    service_provider: {
        type: String,
        trim: true
    },
    contact_person: {
        name:{
            type: String,
            trim: true
        },
        email: {
            type: String,
            trim: true
        },
        contact_number: {
            type:String,
            trim:true
        }
    },
    cost_per_year: {
        type: Number,
        trim:true
    },
    contract: {
        type: String,
        trim: true
    },
    contract_validity: {
        type: Date,
        default: Date.now
    },
    notice_period: {
        type: String
    },
    reminder: {
        type: Boolean,
        default: false
    },
    orientation_drawing: {
        type: String,
        trim: true
    },
    user_manual: {
        type: String,
        trim: true
    },
    yearly_budget_cost: {
        type: Number,
        trim: true
    },
    //Need Clarification
    // access_control_system: {
    //     type: Boolean,
    //     default: true
    // },
    // asset_categories: {
        // type: Schema.ObjectId,
    //     trim:true
    // },
    building: {
        type: Schema.ObjectId
    },
    contractreminder:{
       type:Boolean
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
    },
    contractPersonEmail:{
    	type:String
    }
});

/**
 * Enabling soft delete
 */
AccessControlSchema.plugin(softremove);

AccessControlSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};

module.exports = function(connection) {
    return connection.model('AccessControl', AccessControlSchema);
};