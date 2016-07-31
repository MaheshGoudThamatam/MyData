'use strict';
 
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
 

/**
 * Partner Schema.
 */
var PartnerSchema = new Schema ({
  name : {
    type: String,
    required: true,
    unique:true
  }, 
  description : {
	  type:String,
	  required:true
  },
  price: {
	  type: Number
  },
  price_class: {
	  type: String
  },
  occupancy: {
	  type: Number
  },
  status : {
    type: Number,
    min: 0, // not approved / pending
    max: 1,	// approved
    default: 0
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
PartnerSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};

mongoose.model('Partner', PartnerSchema);