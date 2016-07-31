'use strict';
 
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
 

/**
 * partOf Schema.
 */
var PartOfSchema = new Schema ({
  name : {
    type: String,
    required: true,
    unique:true
  }, 
  description : {
	  type:String,
	  required:true
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
PartOfSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};

mongoose.model('PartOf', PartOfSchema);