'use strict';

/**
 * Module dependencies.
 */
var mongoose  = require('mongoose'),
    Schema    = mongoose.Schema,
    crypto    = require('crypto'),
          _   = require('lodash');

/**
 * Bucket List Schema
 */
var UserAuthSchema = new Schema({
  firstName: {
    type: String,
    default: '',
    trim: true
  },
  lastName:{
    type: String,
    default:'',
    trim:true
  },
  image:{
    type:String,
    default:'',
    trim:true
  },
  email: {
    type: String,
    default: '',
    trim: true
  },
  profileId: {
    type: String,
    default: '',
    trim: true
  },
  provider: {
    type: String,
    default: '',
    trim: true
  }
});
UserAuthSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).exec(cb);
};
mongoose.model('Userauth', UserAuthSchema);