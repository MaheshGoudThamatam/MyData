'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var deepPopulate = require('mongoose-deep-populate')(mongoose);

/**
 * validations
 */
var validateUniqueZoneName = function (value, callback) {
    var Zone = mongoose.model('Zone');
    Zone.find({
        $and: [
            {
                zoneName: { $regex: new RegExp(value, "i") }
            },
            {
                _id: {
                    $ne: this._id
                }
            }
        ]
    }, function (err, zone) {
        callback(err || zone.length === 0);
    });
};

var validateUniqueZoneCode = function (value, callback) {
    var Zone = mongoose.model('Zone');
    Zone.find({
        $and: [
            {
                zoneCode: { $regex: new RegExp(value, "i") }
            },
            {
                _id: {
                    $ne: this._id
                }
            }
        ]
    }, function (err, zone) {
        callback(err || zone.length === 0);
    });
};


/**
 * Zone Schema.
 */
var ZoneSchema = new Schema({
    country: {
        type: Schema.ObjectId,
        ref: 'Country'
    },
    zoneName: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        validate: [validateUniqueZoneName, 'Zone already exists']
    },
    zoneCode: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        validate: [validateUniqueZoneCode, 'Zone code already exists']
    },
    city: [
        {
            type: Schema.ObjectId,
            ref: 'City'
        }
    ],
    cities: [],
    createdAt: {
        type: Date,
        default: Date.now
    },
    fundsallocated : {
        type: Number,
        default: 0,
        trim: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }

});

ZoneSchema.plugin(deepPopulate, {
    whitelist: [
        'city',
        'city.branch'
    ]
});


/**
 * Statics
 */
ZoneSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).populate('country', 'countryName').deepPopulate('city.branch').exec(callback);
};


mongoose.model('Zone', ZoneSchema);
