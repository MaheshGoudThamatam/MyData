'use strict';
 
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    deepPopulate = require('mongoose-deep-populate')(mongoose);

/**
 * Rooms Schema.
 */
var SpaceSchema = new Schema ({
  name: {
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
  rooms : [{ 
    roomId:{type: Schema.ObjectId, ref: 'Rooms'},
    status:{type:String} 
  }],
  amenities : [{ // amenities related to this space like, cafeteria, lobby
	  amenityId	:{
		  type: Schema.ObjectId, 
		  ref: 'Amenities' ,
	  },
	  name : {
		  type : String,
  	  		default : ""
	  },
	  icon:{
		  type:String,
	  },
	  isApplicable :{
		  type : Boolean,
	  	  default : false
	  },
	  isChargeable :{
		  type : Boolean,
	  	  default : false
	  },
	  price:{
		  type:Number,
		  default:''
	  },
	  isStatus:{
		  type : Boolean,
		  default: true
	  },
	  facilityavailable :{
		  type:Boolean
	  }
  }],
  space_type : { // hotel or business center
    type: Schema.ObjectId, 
    ref: 'SpaceType'
  },
  partner : { // hotel or business center
    type: Schema.ObjectId, 
    ref: 'User'
  },
  back_office:[{ // back office staffs for this space
    type: Schema.ObjectId, 
    ref: 'User' 
  }],
  front_office :[{ // front office staffs for this space
    type: Schema.ObjectId, 
    ref: 'User' 
  }],
  created: {
    type: Date,
    default: Date.now
  },
  modified: { 
    type: Date, 
    default: Date.now 
  },
  rating : {
	   type: Number,
 },

  images : [{
	  name: {
		  type:String
	  },
	  url :{
		  type:String,
		  required:true
	  },
	  description:{
		  type:String,
	  }
	 
  }],

  officeHours:[{
	  day : { 
		  type: String,
	    default : ""
		  },
	  startTime : { 
		  type: String,
		  default : ""
	  	  },
	  endTime : {
		  type: String,
		  default : ""
	  },
	  isAllday : {
		  type: Boolean,
		  default : false
	  },
	  isClosed : {
		  type: Boolean,
		  default : false
	  }
  }],
  space_holiday: [{

    name: {
	    type: String,
		default: '',
		trim: true,
	},
	description:{
		type: String
	},
	has_admin_created: {
		type: Boolean,
		default: false
	},
	year:{
		type: Number
	},
	holiday_date: {
		type: Date,
	}
  }],
  teams:[{ // team for the space
    type: Schema.ObjectId, 
    ref: 'User' 
  }],
  createdBy:{
    type: Schema.ObjectId, 
    ref: 'User' 
  }
});

/**
 * Statics
 */
SpaceSchema.plugin(deepPopulate,
		{whitelist: [
                 'teams.role'
     ]});
SpaceSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).deepPopulate(['teams.role']).populate("partner").populate("amenities").exec(callback);
};

mongoose.model('Space', SpaceSchema);