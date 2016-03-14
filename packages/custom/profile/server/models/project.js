'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var validateUniqueProjectName = function(value, callback) {
	  var Project = mongoose.model('Project');
	  Project.find({
	    $and: [{
	      projectName: { $regex : new RegExp(value, "i") }
	    }, {
	      _id: {
	        $ne: this._id
	      }
	    }]
	  }, function(err, project) {
	    callback(err || project.length === 0);
	  });
	};

/**
 * Project Schema.
 */
var ProjectSchema = new Schema({
    projectName: {
        type: String,
        trim: true,
        required: true,
        unique:true,
        validate:[validateUniqueProjectName,'Project Name already exists']
    },
    price: {
        type: Number,
        trim: true,
        required: true
    },
    currency: {
        type: String,
        trim: true,
        required: true
    },
   skills:{
	   type:Array,
	   required: true
   },
   description:{
	   type: String,
       trim: true,
       required: true
   },
   links:{
	   type: Array,
	   required: true
  },
   projectPicture:{
	   type: String,
       trim: true,
       required: false
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
ProjectSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};

mongoose.model('Project', ProjectSchema);