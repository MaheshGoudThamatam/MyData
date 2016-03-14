'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var deepPopulate = require('mongoose-deep-populate')(mongoose);

/**
 * Topic Schema.
 */
var CourseCuriculumSchema = new Schema({
	course: {
        type: Schema.ObjectId,
        ref: 'Course'
    },
    topic : {
    	type:Schema.ObjectId,
        ref: 'CourseTopic'
    },
    test : {
    	type:Schema.ObjectId,
        ref: 'Onlinetest'
    },
    project : {
    	type : Schema.ObjectId,
        ref: 'Courseproject'
    },
    sequence : {
    	type: Number
    },
    testType : {
    	type :  String,
    	default:'',
    	 trim:true
    }
});


CourseCuriculumSchema.plugin(deepPopulate, {
    whitelist: [
        'topic.topicSkill'   ,
        'project.requiredSkill.skill'
    ]
});

/**
 * Statics
 */
CourseCuriculumSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).populate('topic').populate('test').populate('project').populate('course','name courseSkill').deepPopulate('topic.topicSkill,project.requiredSkill.skill', 'name').exec(callback);
};


mongoose.model('CourseCurriculum', CourseCuriculumSchema);

