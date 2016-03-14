'use strict';
/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var deepPopulate = require('mongoose-deep-populate')(mongoose);
	
/**
 * Course Material Page Schema.
 */
var CoursematerialPageSchema = new Schema({
	name: {
        type: String,
        default: '',
        trim: true
    },
    pageNo: {
        type: Number,
        default: '',
        trim: true
    },
    content: {
        type: String,
        default: '',
        trim: true
    },
    notes: {
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
    },
    topic:{
        type: Schema.ObjectId,
        ref: 'Coursematerial'
    }
});

CoursematerialPageSchema.plugin(deepPopulate, {whitelist: [
     'topic',
     'topic.parentId',
     'topic.parentId,parentId',
 ]});

/**
 * Statics
 */
CoursematerialPageSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};

mongoose.model('CoursematerialPage', CoursematerialPageSchema);