'use strict';

/**
 * <Author:Akash Gupta>
 * <Date:27-06-2016>
 * <Guarding Schema>
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
var GuardingSchema = new Schema({
    guarding_provider: {
        type: String,
        trim: true,
        required: true
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
    service: {
        stationary_service: {
            type: Boolean,
            default: false
        },
        mobile_service: {
            type: Boolean,
            default: false
        },
        reception_service: {
            type: Boolean,
            default: false
        },
        scheduled_patrols: {
            type: Boolean,
            default: false
        },
        scheduled_patrols_k9: {
            type: Boolean,
            default: false
        },
        response:{
            type: Boolean,
            default: false
        }
    },
    duration: {
        type: Number,
        trim: true
    },
    cost: {
        type: Number,
        trim: true
    },
    guarding_allTime: {
        type: Boolean,
        default: false
    },
    description: {
        type: String,
        trim: true
    },
    budget: {
        type: Number,
        trim: true
    },
    contract_validity: {
        type: Date
    },
    notice_period: {
        type: String
    },
    reminder: {
        type: Boolean,
        default: false
    },
    guarding_responsible: {
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
    building_providers: {
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
    contract: {
        type: String,
        trim: true
    },
    building_manual: {
        type: String,
        trim: true
    },
    //Need Clarification
    // guard_service: {
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
GuardingSchema.plugin(softremove);

GuardingSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};

module.exports = function(connection) {
    return connection.model('Guarding', GuardingSchema);
}