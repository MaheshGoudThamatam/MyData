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
var CoursematerialSchema = new Schema({
	course: {
		type: Schema.ObjectId,
		ref: 'Course'
	},

// MaterialTittle/book name
    material: {
        type: Schema.ObjectId,
        ref: 'Coursemateriallist'
    },
// MaterialTittle/book name

	parentId: {
		type: Schema.ObjectId,
		ref: 'Coursematerial'
	},

    childId:[{
        type: Schema.ObjectId,
        ref: 'Coursematerial'
    }],

	name: {
		type:String,
	    default: '',
        trim: true
	},
	description: {
        type: String,
        default: '',
        trim: true
    },
	pageStart: {
        type: Number,
        default: '',
        trim: true
    },
    pageEnd: {
        type: Number,
        default: '',
        trim: true
    },
    pages: [{
    	type: Schema.ObjectId,
		ref: 'CoursematerialPage'
    }],
    level: {
        type: String,
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

CoursematerialSchema.plugin(deepPopulate, {whitelist: [
     'parentId',
     'parentId.parentId'
 ]});

/**
 * Statics
 */
CoursematerialSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};

mongoose.model('Coursematerial', CoursematerialSchema);