'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var GuestSchema = new Schema({
	
    first_name: {
    type: String,
    },
  phone:{
   type:Number,
  },
  email:{
    type:String,
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

GuestSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};

mongoose.model('Guest', GuestSchema);