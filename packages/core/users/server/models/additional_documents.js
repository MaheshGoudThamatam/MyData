'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var validateUniqueAdditionalDocumentName = function(value, callback) {
	  var AdditionalDocument = mongoose.model('AdditionalDocument');
	  AdditionalDocument.find({
	    $and: [{
	      mentorName: { $regex : new RegExp(value, "i") }
	    }, {
	      _id: {
	        $ne: this._id
	      }
	    }]
	  }, function(err, additionalDocument) {
	    callback(err || additionalDocument.length === 0);
	  });
	};

/**
 * AdditionalDocument Schema.
 */
var AdditionalDocumentSchema = new Schema({
	user: {
        type: Schema.ObjectId, 
        ref: 'User'
    },
    doc_name: {
        type: String,
	    default: '',
	    trim: true
	},
	doc_file: {
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
AdditionalDocumentSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};

mongoose.model('AdditionalDocument', AdditionalDocumentSchema);