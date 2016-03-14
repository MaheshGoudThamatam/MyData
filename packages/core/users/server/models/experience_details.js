'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var validateUniqueExperienceDetailName = function(value, callback) {
	  var ExperienceDetail = mongoose.model('ExperienceDetail');
	  ExperienceDetail.find({
	    $and: [{
	      mentorName: { $regex : new RegExp(value, "i") }
	    }, {
	      _id: {
	        $ne: this._id
	      }
	    }]
	  }, function(err, experienceDetail) {
	    callback(err || experienceDetail.length === 0);
	  });
	};

/**
 * ExperienceDetail Schema.
 */
var ExperienceDetailSchema = new Schema({
	user: {
        type: Schema.ObjectId, 
        ref: 'User'
    },
    employer: {
        type: String,
	    default: '',
	    trim: true
	},
	designation: {
        type: String,
	    default: '',
	    trim: true
	},
	start_date: {
       type: Date,
   },
   end_date: {
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


/**
 * Statics
 */
ExperienceDetailSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};

mongoose.model('ExperienceDetail', ExperienceDetailSchema);