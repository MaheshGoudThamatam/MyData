'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var validateUniqueReferenceName = function(value, callback) {
	  var Reference = mongoose.model('Reference');
	  Reference.find({
	    $and: [{
	      mentorName: { $regex : new RegExp(value, "i") }
	    }, {
	      _id: {
	        $ne: this._id
	      }
	    }]
	  }, function(err, Reference) {
	    callback(err || Reference.length === 0);
	  });
	};

/**
 * Reference Schema.
 */
var ReferenceSchema = new Schema({
	user: {
        type: Schema.ObjectId, 
        ref: 'User'
    },
    ref_name: {
        type: String,
	    default: '',
	    trim: true
	},
	ref_phno: {
        type: String,
	    default: '',
	    trim: true
	},
	comments: {
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
ReferenceSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};

mongoose.model('Reference', ReferenceSchema);