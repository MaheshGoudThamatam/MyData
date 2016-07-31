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
var RoomsSchema = new Schema ({

  name: {
    type: String,
    default : ""
  },   
  roomtype : {
    type: Schema.ObjectId,
    ref : "Roomstype"
  },
   loc: {
    type : [Number], 
    index: '2dsphere'
  },
  spaceId : {
    type: Schema.ObjectId,
    ref : "Space"
  },
  pricePerhour: {
    type: Number,
    default : ""
  },
  pricePerhalfday: {
    type: Number,
    default : ""
  },
  pricePerfullday: {
    type: Number,
    default : ""
  },
  description: {
    type: String,
    default : ""
  },
   capacity: {
    type: Number,
    default : ""
  },
  created: {
	    type: Date,
	    default: Date.now
	  },
  amenities:[{
    "amenityId":{type:Schema.ObjectId,ref:"Amenities"},
    "facilityavailable":{type:Boolean},
    "name":{type:String},
    "icon":{type:String},
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
		  type:Boolean
	  }
  }],
   roomsslotschedule:[{
    "day":{type:String},
    "min":{type:Date},
    "max":{type:Date},
    "startTime":{type:Date},
    "endTime":{type:Date},
    "isAllday":{type:Boolean},
    "isClosed":{type:Boolean}
  }],
  images:[{
    name:String,
    description:String,
    url:String
  }],
  status:{
	  type:String,
    default:"pending"
  },
  avgRating : {
	   type: Number,
  },
    createdBy:{
    type: Schema.ObjectId, 
    ref: 'User' 
  },
  relatedHotDeskIds: [{
	  type: Schema.ObjectId,
	  ref : 'Rooms'
  }],
  isAdminAdded:{
    type:Boolean,
    default:false
  },
  sentToAdminApproval:{
    type:Boolean,
    default:false
  },
  isPublished:{
    type:Boolean,
    default:false
  },
  partner : { // hotel or business center
    type: Schema.ObjectId, 
    ref: 'User'
  },
  isActive:{
    type:Boolean,
    default:true
  }

});
RoomsSchema.plugin(deepPopulate, {whitelist: [
    'spaceId',
    'spaceId.partner',
    'spaceId.space_type'
]});
RoomsSchema.statics.load = function(id, callback) {
    this.findOne({
        _id: id
    }).deepPopulate(['spaceId', 'spaceId.partner', 'spaceId.space_type']).populate("roomtype","").populate("createdBy","").exec(callback);
};

mongoose.model('Rooms', RoomsSchema);