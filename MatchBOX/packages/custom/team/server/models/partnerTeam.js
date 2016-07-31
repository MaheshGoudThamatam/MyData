'use strict';
 
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
 

/**
 * Team Type Schema.
 */
var partnerTeam = new Schema ({
	partner:{
        type: Schema.ObjectId,
        ref: 'User'  
    },
    team :{
    	type: Schema.ObjectId,
        ref: 'User' 
    },
   created: {
    type: Date,
    default: Date.now
  },
  modified: { 
    type: Date, 
    default: Date.now 
  } 
});



mongoose.model('PartnerTeam', partnerTeam);