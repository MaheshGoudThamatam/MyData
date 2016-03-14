'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var validateUniqueAddressName = function(value, callback) {
	  var Address = mongoose.model('Address');
	  Address.find({
	    $and: [{
	      mentorName: { $regex : new RegExp(value, "i") }
	    }, {
	      _id: {
	        $ne: this._id
	      }
	    }]
	  }, function(err, address) {
	    callback(err || address.length === 0);
	  });
	};

/**
 * Address Schema.
 */
var AddressSchema = new Schema({
	user: {
        type: Schema.ObjectId, 
        ref: 'User'
    },
    addressType: {
        type: String,
	    default: 'Permanent Address',
	    trim: true
	},
    addressLine1: {
        type: String,
	    default: '',
	    trim: true
	},
	addressLine2: {
        type: String,
	    default: '',
	    trim: true
	},
	city: {
        type: String,
	    default: '',
	    trim: true
	},
	state: {
        type: String,
	    default: '',
	    trim: true
	},
	country: {
        type: String,
	    default: '',
	    trim: true
	},
	pincode: {
        type: String,
	    default: '',
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
AddressSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};

mongoose.model('Address', AddressSchema);