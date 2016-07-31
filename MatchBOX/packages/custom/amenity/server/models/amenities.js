'use strict';
 
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var validateUniqueAmenityName = function(value, callback) {
    var Amenities = mongoose.model('Amenities');
    Amenities.find({
      $and: [{
        name: { $regex : new RegExp(value, "i") }
      }, {
        _id: {
          $ne: this._id
        }
      }]
    }, function(err, course) {
      callback(err || course.length === 0);
    });
  };
 

/**
 * Amenities Schema.
 */
var AmenitiesSchema = new Schema ({
  name : {
    type: String,
    required: true,
    unique:true,
    validate:[validateUniqueAmenityName,'Amenity Name already exists']
  }, 
  description : {
	  type:String,
	  required:true
  },
  status : {
    type: Number,
    min: 0, // not approved, approved
    max: 1,
    default: 1
  },
  created: {
    type: Date,
    default: Date.now
  },
  modified: { 
    type: Date, 
    default: Date.now 
  },
  icon: {
	  type: String,
      default: '',
      trim: true  
  },
  appliesTo:{
      type: Schema.ObjectId, ref: 'SpaceType',
      required:true
  },
  partOf:{
      type: Schema.ObjectId, ref: 'PartOf',
      required:true
  },
  isStatus:{
	  type:Boolean
  }
});

/**
 * Statics
 */
AmenitiesSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};

mongoose.model('Amenities', AmenitiesSchema);