'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Student Counselling Checklist Schema.
 */
var StudentCounsellingChecklistSchema = new Schema({
    user: {
			  type: Schema.ObjectId,
			  ref: 'User'
			  },
    questions: [{
			title:{
				type:String
			},
    description:{
					type:String
		},
			remarks:{
				type:String,
			required:true
		}
		
	}],
	counselling: {
		type: Schema.ObjectId,
		  ref: 'Counselling'
	},
	notes:{
		type:String,
		required:true
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
StudentCounsellingChecklistSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};




mongoose.model('StudentCounsellingChecklist', StudentCounsellingChecklistSchema);