'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var validateUniqueProjectRequestName = function(value, callback) {
	  var ProjectRequest = mongoose.model('ProjectRequest');
	  ProjectRequest.find({
	    $and: [{
	      mentorName: { $regex : new RegExp(value, "i") }
	    }, {
	      _id: {
	        $ne: this._id
	      }
	    }]
	  }, function(err, ProjectRequest) {
	    callback(err || ProjectRequest.length === 0);
	  });
	};

/**
 * ProjectRequest Schema.
 */
var ProjectRequestSchema = new Schema({
	user: {
        type: Schema.ObjectId, 
        ref: 'User'
    },
    project: {
    	type: Schema.ObjectId, 
        ref: 'Task'
	},
    user_status: {
    	type: String,
	    default: 'Pending',
	    trim: true
	},
	project_status:{
		type: String,
	    default: 'Open',
	    trim: true
	},
	applied_date:{
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
ProjectRequestSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};

mongoose.model('ProjectRequest', ProjectRequestSchema);