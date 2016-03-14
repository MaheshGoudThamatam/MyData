'use strict';
/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var validateUniqueProjectName = function(value, callback) {
	  var Courseproject = mongoose.model('Courseproject');
	  Courseproject.find({
	    $and: [{
	    	projectName: { $regex : new RegExp(value, "i") }
	    }, {
	      _id: {
	        $ne: this._id
	      }
	    }]
	  }, function(err, courseproject) {
	    callback(err || courseproject.length === 0);
	  });
	};
	
/**
 * Course Project Schema.
 */
var CourseprojectSchema = new Schema({
	
	projectName: {
        type: String,
        default: '',
        trim: true,
        unique:true,
        required:true,
        validate:[validateUniqueProjectName,'Project Name already exists']
    },
    description: {
        type: String,
        default: '',
        required:true,
        trim: true
    },
    totalMarks: {
        type: Number,
        default: '',
        required:true,
        trim: true
    },
    minimumMarks: {
        type: Number,
        default: '',
        required:true,
        trim: true
    },
   requiredSkill: [{
        skill: {
        	type: Schema.ObjectId, ref: 'Skill',
        	required:true,
        	trim: true
        },
        level: {
        	type: Number,
        	required:true,
        	trim: true
        },
        rewardPoint: {
        	type: Number,
        	required:true,
        	trim: true
        }
    }],
    questionsfields: {
    	type: Array,
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

CourseprojectSchema.plugin(deepPopulate, {whitelist: [
                                             'requiredSkill',
                                             'requiredSkill.skill'
                                         ]});


/**
 * Statics
 */
CourseprojectSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).populate('requiredSkill').deepPopulate('requiredSkill.skill').exec(callback);
};

mongoose.model('Courseproject', CourseprojectSchema);