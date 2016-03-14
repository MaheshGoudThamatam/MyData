'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var validateUniqueTaskName = function(value, callback) {
      var Mentorproject = mongoose.model('Mentorproject');
      Mentorproject.find({
        $and: [{
          taskName: { $regex : new RegExp(value, "i") }
        }, {
          _id: {
            $ne: this._id
          }
        }]
      }, function(err, mentorproject) {
        callback(err || mentorproject.length === 0);
      });
    };
/**
 * Task Schema.
 */
var MentorprojectSchema = new Schema({
    taskName: {
        type: String,
        default: '',
        trim: true,
        required: true,
        unique:true,
        validate:[validateUniqueTaskName,'Project Name already exists']
    },
    taskImage:{
       type: String,
       trim: true,
       required: false
   },
    description:{
	   type: String,
       default: '',
       trim: true
    },
    skills:{
       type: Array,
    },
    cost:{
       type: Number,
    },
    duration:{
       type: Number
    },
    durationType:{
       type: String,
       default: 'Week',
       trim: true
    },
    position:{
       type: Number,
    },
    availability:{
       type: String,
       default: 'Full Time',
       trim: true
    },
    type:{
       type: String,
       default: 'Online',
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
MentorprojectSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};




mongoose.model('Mentorproject', MentorprojectSchema);