'use strict';


/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var deepPopulate = require('mongoose-deep-populate')(mongoose);

var validateUniqueCountryName = function(value, callback) {
	  var Country = mongoose.model('Country');
	  Country.find({
	    $and: [{
	      countryName: { $regex : new RegExp(value, "i") }
	    }, {
	      _id: {
	        $ne: this._id
	      }
	    }]
	  }, function(err, country) {
	    callback(err || country.length === 0);
	  });
	};

	var validateUniqueCountryCode = function(value, callback) {
		  var Country = mongoose.model('Country');
		  Country.find({
		    $and: [{
		    	countryCode: { $regex : new RegExp(value, "i") }
		    }, {
		      _id: {
		        $ne: this._id
		      }
		    }]
		  }, function(err, country) {
		    callback(err || country.length === 0);
		  });
		};

/**
 * Country Schema.
 */
var CountrySchema = new Schema({
    countryName: {
        type: String,
        trim: true,
        required: true,
        unique:true,
        validate:[validateUniqueCountryName,'Country already exists']
    },
    countryCode: {
        type: String,	  
	    trim: true,
	    required: true,
        unique:true,
        validate:[validateUniqueCountryCode,'Country code already exists']
	},
	currency: {
        type: String,
	    trim: true,
	    required: true
	},
	languageName: {
        type: String,
	    trim: true,
	    required: true
	},
	languageCode: {
        type: String,
	    trim: true,
	    required: true
	},
	zone: [{
        type: Schema.ObjectId,
        ref: 'Zone'
    }],
	course: [{
		type: Schema.ObjectId,
	    ref: 'Course'
	}],
    createdAt: {
        type: Date,
        default: Date.now
    },
    fundsallocated : {
        type: Number,
        default: 0,
        trim: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
  

});

CountrySchema.plugin(deepPopulate, {
    whitelist: [
        'zone',
        'zone.city',
        'zone.city.branch'
    ]
});
                                            

/**
 * Statics
 */
CountrySchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).populate('zone','name').deepPopulate('zone.city.branch', 'name').exec(callback);
};
mongoose.model('Country', CountrySchema);
