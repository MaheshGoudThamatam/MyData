'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    deepPopulate = require('mongoose-deep-populate')(mongoose),
    autoIncrement = require('mongoose-auto-increment');

var connection = mongoose.createConnection("mongodb://localhost/mymatchbox");
autoIncrement.initialize(connection);

var BookingSchema = new Schema({
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    room: {
        type: Schema.ObjectId,
        ref: 'Rooms'
    },
    status: {
        type: String,
        default: 'Failed'
    },
    sequenceNumber: {
        type: Number,
    },
    isAgreed: {
        type: Boolean,
        default: false,
    },
    bookingDate: {
        type: Date,
    },
    bookingFrom: {
  	  type: Date
    },
    bookingTo: {
  	  type: Date
    },
    bookingStartTime: {
        type: Date
    },
    bookingEndTime: {
        type: Date
    },
    price: {
        type: Number
    },
    schedule: {
        type: Schema.ObjectId,
        ref: 'Schedule'
    },
    scheduleTraining: [{
  	  	type: Schema.ObjectId, 
  	  	ref: 'Schedule'
    }],
    relatedBookedRooms: [{
    	
    }],
    partner: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    space: {
        type: Schema.ObjectId,
        ref: 'Space'
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    day: {
        type: String
    },
    bookingStartTimeNumber: {
        type: Number
    },
    bookingEndTimeNumber: {
        type: Number
    },
    startTime: {
        type: String
    },
    endTime: {
        type: String
    },
    fromDate : {
        type: String
    },
    endDate: {
        type: String
    },
    no_of_days: {
    	type: Number
    },
    timeZoneOffset: {
        type: Number
    },
    payUMoneyId: {
        type: String,
        default: ''
    },
    totalHours:{
    	type: Number,
        default: ''
    },
    priceWithoutTax:{
    	type: Number,
         default: ''
    },
    reviewed: {
    	type: Boolean,
    	default: false
    },
    bookingConfirmationId:{
    	type: String
    },
    partnerAmount:{
    	type:Number
    },
    adminAmount:{
    	type:Number
    },
    capacity:{
    	type:Number
    },
    roomPrice:{
    	pricePerHour:Number,
    	pricePerHalfday:Number,
    	pricePerFullday:Number
    },
    requestReview :{
    	type:Boolean,
    	default:false
    },
    promoCode: {
    	type: Schema.ObjectId,
        ref: 'PromoCode'
    },
    guestUser:{
    	type: Schema.ObjectId,
        ref: 'Guest'
    },
    isWalkin:{
    	type:Boolean,
    	default:false
    },
    isFaliedMerge:{
    	type:Boolean,
    	default:false
    },
    specialNoteDescription:{
        type: String
    },
    address:{
        address1: String,
        address2: String,
        city: String,
        state: String,
        pinCode: String,
        country: String
    },
    service_tax: {
        type: Number
    },
    reason:{
        type:String,
        default:""
    },
    reasondescription:{
        type:String,
        default:""
    },
    isMerged:{
    	type:Boolean,
	    default:false
    },
    initiatedBy : {
        type:String,
        default:""
    },
    cancelledBy : {
        type: Schema.ObjectId,
        ref: 'User'
    },
    feature : {
        type : String,
	    default : ""
	}
    
});
BookingSchema.plugin(deepPopulate, {
	whitelist: [
		'room',
		'room.roomtype'
	]
});

BookingSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).deepPopulate(['room','room.roomtype']).populate('user').populate('space').populate('partner').populate('room').populate('promoCode').populate('guestUser').exec(callback);
};
mongoose.model('Booking', BookingSchema);
BookingSchema.plugin(autoIncrement.plugin, {
    model: 'Booking',
    field: 'sequenceNumber'
});


