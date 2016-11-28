'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var softremove = require('mongoose-soft-remove');

/**
 * Unique Field Validations.
 */
var validateUniqueName = function(value, callback) {
    var Dashboard = mongoose.model('Dashboard');
    Dashboard.find({
        $and: [{
            name: {
                $regex: new RegExp(value, "i")
            }

        }, {
            _id: {
                $ne: this._id
            }
        }]
    }, function(err, dashboard) {
        callback(err || dashboard.length === 0);
    });
};

/**
 * ConfigType Schema.
 */
var RoleSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },

    description: {
        type: String,
        trim: true
    },

    permissions: {},

    dashboard: [{
        type: Schema.ObjectId,
        ref: 'Dashboard'
    }],

    isActive: {
        type: Boolean,
        default: false
    },
    company: {
        type: Schema.ObjectId,
        ref: 'Company'
    },
    pristine: {
        type: Boolean,
        default: false
    },
    system: {
        type: Boolean,
        default: false
    },
    admin: {
        type: Boolean,
        default: false
    }
});

/**
 * Enabling soft delete
 */
RoleSchema.plugin(softremove);

/**
 * Statics
 */
RoleSchema.statics.load = function(id, callback) {
    this.findOne({
        _id: id
    }).populate('feature', 'name').populate('dashboard', 'name').populate('company').exec(callback);
};
mongoose.model('Role', RoleSchema);