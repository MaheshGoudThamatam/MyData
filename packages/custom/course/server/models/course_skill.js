'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var CourseSkillSchema = new Schema({
	course: {
		type: Schema.ObjectId,
		ref: 'Course'
	},
	skill: {
		type: Schema.ObjectId,
		ref: 'Skill'
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


CourseSkillSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).populate('skill', 'name description').populate('course', 'name description').exec(callback);
};


mongoose.model('CourseSkill', CourseSkillSchema);