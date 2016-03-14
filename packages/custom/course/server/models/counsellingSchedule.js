'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var counsellingScheduleSchema = new Schema({
  
	 branch:{
	    type: Schema.ObjectId,
	 	   ref: 'Branch'  
	 },
	 mentorAssigned:{
	    type: Schema.ObjectId,
	 	   ref: 'User'
	 },
	 course:{
	    type: Schema.ObjectId,
		   ref: 'Course'  
	 },
	 callDate: {
	 	type: Date,
	 	default: Date.now
	 },
	 start_hr: {
	 	type: String
	 },
	 start_min: {
	 	type: String
	 },
	 end_hr: {
	 	type: String
	 },
	 end_min: {
	 	type: String
	 },
	 start_total: {
	 	type: Number
	 },
	 end_total: {
	 	type: Number
	 },
	 description: {
	 	type: String
	 },
	 interval: {
	 	type: String
	 },
	 capacity: {
	 	type: String
	 },
	 slots:[{
         slotTime: {
         	type: String
         },
         counter: {
         	type: Number
         }
     }]
});

counsellingScheduleSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).populate('branch', 'branchName').populate('course', 'name').exec(callback);
};

mongoose.model('CounsellingSchedule', counsellingScheduleSchema);