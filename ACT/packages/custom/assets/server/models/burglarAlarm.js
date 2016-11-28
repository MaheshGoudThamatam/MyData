'use strict';

/**
 * <Author:Akash Gupta>
 * <Date:27-06-2016>
 * <Burglar Alarm Schema>
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
var BurglarAlarmSchema = new Schema({
    burglarAlarm_provider: {
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
    type: {
        panic_alarm: {
            type: Boolean,
            default: false
        },
        ir_detector: {
            type: Boolean,
            default: false
        },
        glass_break_detector: {
            type: Boolean,
            default: false
        },
        magnetic_contact: {
            type: Boolean,
            default: false
        },
        radar_detector: {
            type: Boolean,
            default: false
        },
        vibration_sensors: {
            type: Boolean,
            default: false
        },
        flash_light_indoor: {
        	type: Boolean,
            default: false
        },
        flash_light_outdoor: {
        	type: Boolean,
            default: false
        },
        outdoor_siren: {
        	type: Boolean,
            default: false
        },
        indoor_siren: {
        	type: Boolean,
          default: false
       },
	    smoke_cloak: {
	    	type: Boolean,
	        default: false
	   },
	   electric_fencing: {
	    	type: Boolean,
	        default: false
	   }
   
   },
    sections: {
        type: Number,
        trim: true
    },
    alarm_point: {
        type: Number,
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
        },
        id_number: {
            type:Number,
            trim:true
        }
    },
    automatic: {
        type: Boolean,
        default: false
    },
    weekdays: {
        type: Boolean,
        default: false
    },
    holidays: {
        type: Boolean,
        default: false
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
        type: Date
    },
    notice_period: {
        type: Date
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
    // burglar_alarm: {
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
BurglarAlarmSchema.plugin(softremove);

BurglarAlarmSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};

module.exports = function(connection) {
    return connection.model('BurglarAlarm', BurglarAlarmSchema);
}