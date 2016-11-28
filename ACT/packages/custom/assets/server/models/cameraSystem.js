'use strict';

/**
 * <Author:Akash Gupta>
 * <Date:24-06-2016>
 * <Camera System Schema>
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
var CameraSystemSchema = new Schema({
    camera_provider: {
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
    usability: {
        dayNight : {
            type: Boolean,
            default: false
        },
        outdoor: {
            type: Boolean,
            default: false
        },
        indoor: {
            type: Boolean,
            default: false
        },
        ptz: {
            type: Boolean,
            default: false
        },
        rotation: {
            type: Number,
            trim: false
        }
    },
    name: {
        type: String,
        trim: true
    },
    resolution: {
        type: String,
        trim: true
    },
    place: {
        type: String,
        trim: true
    },
    place_image: {
        type: String,
        trim:true
    },
    purpose: {
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
        },
        id_number: {
            type: Number,
            trim: true
        }
    },
    approval_by_country_board: {
        type: Boolean,
        default: false
    },
    documentation: {
        type: String,
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
    //Need Clarification
    // document: [{
    //     type: String,
    //     trim: true
    // }],
    // camera_surveillance: {
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
    contractnoticeperiod:{
       type:String
    },
    contractreminder:{
       type:Boolean
    },
    orientation_drawings:{
      type:String
    },
    camera_documentation:{
      type:String
    },
     contract_validity: {
        type: Date,
        default: Date.now
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
    cameraPhotos: [],
    contractPersonEmail:{
    	type:String
    }
});

/**
 * Enabling soft delete
 */
CameraSystemSchema.plugin(softremove);

CameraSystemSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};

module.exports = function(connection) {
    return connection.model('CameraSystem', CameraSystemSchema);
}