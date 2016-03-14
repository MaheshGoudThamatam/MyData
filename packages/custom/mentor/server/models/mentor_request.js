'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var validateUniqueMentorRequestName = function(value, callback) {
	  var MentorRequest = mongoose.model('MentorRequest');
	  MentorRequest.find({
	    $and: [{
	      mentorName: { $regex : new RegExp(value, "i") }
	    }, {
	      _id: {
	        $ne: this._id
	      }
	    }]
	  }, function(err, mentorRequest) {
	    callback(err || mentorRequest.length === 0);
	  });
	};

/**
 * MentorRequest Schema.
 */
var MentorRequestSchema = new Schema({
	user: {
        type: Schema.ObjectId, 
        ref: 'User'
    },
    status: {
        type: String,
	    default: 'Pending',
	    trim: true
	},
	project: {
    	type: Schema.ObjectId, 
        ref: 'Mentorproject'
	},
    user_status: {
    	type: String,
	    default: 'Pending',
	    trim: true
	},
	project_status:{
		type: String,
	    default: '',
	    trim: true
	},
	onlineTest: {
		type: [
		       {type: Schema.ObjectId, ref: 'Onlinetest'}
		]
	},
	comments:{
		type: String,
	    default: '',
	    trim: true
	},
    request_posted: {
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

MentorRequestSchema.plugin(deepPopulate, {whitelist: [
     'user',
     'user.address',
     'user.qualification_details',
     'user.additional_documents',
     'user.experience_details',
     'user.references',
     'user.skills',
     'user.role'
 ]});

/**
 * Statics
 */
MentorRequestSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};
MentorRequestSchema.statics.loadByUserId = function (id, callback) {
    this.findOne({
        user: id
    }).populate('project' ,'taskName').populate('onlineTest' , 'name').exec(callback);
};

mongoose.model('MentorRequest', MentorRequestSchema);