'use strict';
 
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
 

/**
 * Space Type Schema.
 */
var SpaceTypeSchema = new Schema ({
  name : {
    type: String,
    default: '',
    trim: true
  },
  description : {
    type: String,
    default: '',
    trim: true
  },
  status : {
    type: Boolean,
    default: false
  },
  created: {
    type: Date,
    default: Date.now
  },
  modified: { 
    type: Date, 
    default: Date.now 
  } 
});

/**
 * Statics
 */
SpaceTypeSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};

mongoose.model('SpaceType', SpaceTypeSchema);