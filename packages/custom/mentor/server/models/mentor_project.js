'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var validateUniqueMentorProjectName = function(value, callback) {
	  var mentorProject = mongoose.model('mentorProject');
	  mentorProject.find({
	    $and: [{
	      mentorName: { $regex : new RegExp(value, "i") }
	    }, {
	      _id: {
	        $ne: this._id
	      }
	    }]
	  }, function(err, mentorProject) {
	    callback(err || mentorProject.length === 0);
	  });
	};

/**
 * mentorProject Schema.
 */
var mentorProjectSchema = new Schema({
	user: {
        type: Schema.ObjectId, 
        ref: 'User'
    },
    project: {
    	type: Schema.ObjectId, 
        ref: 'Task'
	},
    start_date: {
    	type: Date,
    	default: Date.now
	},
    end_date: {
        type: Date,
	    default: Date.now
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
mentorProjectSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};

mongoose.model('MentorProject', mentorProjectSchema);