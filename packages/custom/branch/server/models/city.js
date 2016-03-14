'use strict';
//validations
var validateUniqueCityName = function(value, callback) {
    var City = mongoose.model('City');
    City.find({
        $and: [{
            cityName: {
                $regex: new RegExp(value, "i")
            }
        }, {
            _id: {
                $ne: this._id
            }
        }]
    }, function(err, city) {
        callback(err || city.length === 0);
    });
};
var validateUniqueCityCode = function(value, callback) {
    var City = mongoose.model('City');
    City.find({
        $and: [{
            cityCode: {
                $regex: new RegExp(value, "i")
            }
        }, {
            _id: {
                $ne: this._id
            }
        }]
    }, function(err, city) {
        callback(err || city.length === 0);
    });
};
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
/**
 * City Schema.
 */
var CitySchema = new Schema({
    zone: {
        type: Schema.ObjectId,
        ref: 'Zone'
    },
    cityName: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        validate: [validateUniqueCityName, 'City  already exists']
    },
    cityCode: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        validate: [validateUniqueCityCode, 'City code  already exists']
    },
    branch: [{
        type: Schema.ObjectId,
        ref: 'Branch'
    }],
    fundsallocated: {
        type: Number,
        default: 0,
        trim: true
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
 * Statics
 */
CitySchema.statics.load = function(id, callback) {
    this.findOne({
        _id: id
    }).populate('branch', 'name').exec(callback);
};
mongoose.model('City', CitySchema);