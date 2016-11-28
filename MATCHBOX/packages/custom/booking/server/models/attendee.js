'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var AttendeeSchema = new Schema({
  
	booking: {
		  type: Schema.ObjectId, 
	    ref: 'Booking'
	},
    name: {
    type: String,
    },

  phoneNumber:{
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

AttendeeSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};

mongoose.model('Attendee', AttendeeSchema);