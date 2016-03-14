'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Topic Schema.
 */
var CourseTopicSchema = new Schema({
    course: {
        type: Schema.ObjectId,
        ref: 'Course'
    },
    name: {
        type: String,
        trim: true,        
    },
    sessionHrs: {
        type: Number,
        default: 0
    },

    labHrs: {
        type: Number,
        default: 0
    },

	AssignmentHrs :{
		type :Number,
		default : 0
	},
	sequence : {
		type : Number	
	},
	parent : {
		type: Schema.ObjectId,
        ref: 'CourseTopic' 		
	},
	description: {
        type: String,	   
        default:'',
        trim:true
	},   
    subTopics: [

    ],
    topicSkill: {
        type: Schema.ObjectId,
        ref: 'Skill'
    },
    level: {
        type: Number,
        trim: true
    }
});


/**
 * Statics
 */
CourseTopicSchema.statics.load = function(id, callback) {
    this.findOne({
        _id: id
    }).sort({sequence : 1}).exec(callback);
};


mongoose.model('CourseTopic', CourseTopicSchema);
