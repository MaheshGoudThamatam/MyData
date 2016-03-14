'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var validateUniqueQualificationDetailName = function(value, callback) {
	  var QualificationDetail = mongoose.model('QualificationDetail');
	  QualificationDetail.find({
	    $and: [{
	      mentorName: { $regex : new RegExp(value, "i") }
	    }, {
	      _id: {
	        $ne: this._id
	      }
	    }]
	  }, function(err, qualificationDetail) {
	    callback(err || qualificationDetail.length === 0);
	  });
	};

/**
 * QualificationDetail Schema.
 */
var QualificationDetailSchema = new Schema({
	user: {
        type: Schema.ObjectId, 
        ref: 'User'
    },
    examination: {
        type: String,
	    default: '',
	    trim: true
	},
	institution: {
        type: String,
	    default: '',
	    trim: true
	},
	university: {
        type: String,
	    default: '',
	    trim: true
	},
	year_of_passing: {
        type: Number
	},
	grade_obtained: {
        type: String,
	    default: 'Percentage',
	    trim: true
	},
	percentage_of_marks: {
        type: Number
	},
	specialisation: {
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
QualificationDetailSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};

mongoose.model('QualificationDetail', QualificationDetailSchema);