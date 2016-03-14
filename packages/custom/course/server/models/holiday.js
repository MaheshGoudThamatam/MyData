'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var validateUniqueHolidayName = function(value, callback) {
	var holiday = mongoose.model('Holiday');
	  holiday.find({
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



/**
 * holiday Schema.
 */
var holidaySchema = new Schema({
	country: {
        type: Schema.ObjectId,
        ref: 'Country'
    },
    branch: {
    	type: Schema.ObjectId, 
        ref: 'Branch'
	},
	user: {
		type: Schema.ObjectId,
		ref:'User'
	},
    start_date: {
    	type: Date,
    	default: Date.now,
    	required : true
	},
    end_date: {
        type: Date,
	    default: Date.now,
	    required: true
	},
	name : {
		type: String,
		unique :true,
		validate:[validateUniqueHolidayName,'Name already exists']
	},
	description : {
		type: String,
		required : true
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
holidaySchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};

mongoose.model('Holiday', holidaySchema);