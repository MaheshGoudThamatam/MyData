'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
* Validation
*/
var validateUniqueHolidayName = function(value, callback) {
      var Holiday = mongoose.model('Holiday');
      Holiday.find({
        $and: [{
          name: { $regex : new RegExp(value, "i") }
        }, {
          _id: {
            $ne: this._id
          }
        }]
      }, function(err, holiday) {
        callback(err || holiday.length === 0);
      });
    };

var HolidaySchema = new Schema({
  
	name: {
        type: String,
        default: '',
        trim: true,
        required: true,
        unique:true,
        validate:[validateUniqueHolidayName,'Holiday Name already exists']
    },

	description:{
		type:String
	},
	year:{
		type:Number
	},
	has_admin_created: {
		type: Boolean,
		default: false
	},
	partner: {
		type: Schema.ObjectId, 
	    ref: 'User'
	},
	holiday_date: {
       type: Date,
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

HolidaySchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};


mongoose.model('Holiday', HolidaySchema);