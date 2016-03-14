'use strict';
/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var deepPopulate = require('mongoose-deep-populate')(mongoose);
	
/**
 * Course Material Schema.
 */
var CoursemateriallistSchema = new Schema({
	childId:[{
        type: Schema.ObjectId,
        ref: 'Coursematerial'
    }],

    title:{
        type:String,
        default: '',
        trim: true        
    },

    description:{
        type:String,
        default: '',
        trim: true        
    },

    skills: [{
        skill:{
            type: Schema.ObjectId,
            ref: 'Skill'
        },
        pre_req: {
            type: Number
        },

        target: {
            type: Number
        }
    }],

    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }	
});


CoursemateriallistSchema.plugin(deepPopulate, {whitelist: [
     'childId',
     'childId.childId',
     'childId.childId.childId',
     'childId.childId.childId.pages'
 ]});

/**
 * Statics
 */
CoursemateriallistSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};

mongoose.model('Coursemateriallist', CoursemateriallistSchema);