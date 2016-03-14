'use strict';
 
 /**
 * Module dependencies.
 */
 var mongoose = require('mongoose'),
 Schema = mongoose.Schema;
 var validateUniqueName = function(value, callback) {
	  var Onlinetest = mongoose.model('Onlinetest');
	  Onlinetest.find({
	    $and: [{
	    	name: { $regex : new RegExp(value, "i") }
	    }, {
	      _id: {
	        $ne: this._id
	      }
	    }]
	  }, function(err, Onlinetest) {
	    callback(err || Onlinetest.length === 0);
	  });
	};
	

/**
	ConfigType Schema
*/
 var OnlineTestSchema =new Schema({

 	name : {
 		type : String,
 		default : '',
 		unique : true,
 		validate:[validateUniqueName,'Name already exists']
 	},
 	description : {
 		type : String ,
 		default : '',
 		required : true
 	},
 	instructions : {
 		type : String ,
 		default : '',
 		required : true
 	},
 	duration : {
 		type:Number,
 		required : true
 	},
 	numberOfQuestions : {
 		type:Number,
 		required : true
 	},
 	passMark : {
 		type:Number,
 		required : true
 	},

 	created_At : {
 		type: Date,
        default: Date.now
 	},
 	updated_At : {
 		type : Date ,
 		default : Date.now
 	},
 	testSkills : []

 });

/**
 * Statics
 */
 OnlineTestSchema.statics.load = function(id,callback){
 	this.findOne({
 		_id: id
 	}).exec(callback);
 };



 mongoose.model('Onlinetest',OnlineTestSchema);