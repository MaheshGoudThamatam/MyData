'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
Schema = mongoose.Schema,
deepPopulate = require('mongoose-deep-populate')(mongoose);


/**
 * PlugNPlay Schema.
 */
var PlugNPlaySchema = new Schema ({

/*	name: {
		type: String,
	default : ""
	},
	address1: {
		type: String,
	default : ""
	}, 
	address2: {
		type: String,
	default : ""
	},
	phone : {
		type: Number
	},
	city: {
		type: String,
	default : ""
	},
	locality: {
		type: String,
	default : ""
	},
	state : {
		type: String,
	default : ""
	}, 
	postal_code: {
		type: Number
	},
	country : {
		type: String,
	default : ""
	},
	loc: {
		type : [Number], 
		index: '2dsphere'
	},
	description: {
		type: String,
	default : ""
	},
	capacity: {
		type: Number,
	default : ""
	},
	images:{
		name:String,
		description:String,
		url:String
	},
	avgRating : {
		type: Number,
	},*/
	seqNo:{
		type:Number
	},
	city:{
		type:String
	},
	lat:{
		type:Number
	},
	lng:{
		type:Number
	},
	radius:{
		type:Number
	},
	areas:[ ],
	image:[ {
		type: String,
		default: '',
		trim: true
	}],
	createdAt: {
		type: Date,
	default: Date.now
	}

});

PlugNPlaySchema.statics.load = function(id, callback) {
	this.findOne({
		_id: id
	}).exec(callback);
};

mongoose.model('PlugNPlay', PlugNPlaySchema);