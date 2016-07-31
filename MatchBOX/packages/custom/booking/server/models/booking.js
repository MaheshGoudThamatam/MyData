'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
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
        default: 1234
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
    }
    
});

BookingSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).populate('user').populate('space').populate('partner').populate('room').exec(callback);
};

mongoose.model('Booking', BookingSchema);
//BookingSchema.plugin(autoIncrement.plugin, { model: 'Booking', field: 'sequenceNumber',startAt: 1234 });
BookingSchema.plugin(autoIncrement.plugin, {
    model: 'Booking',
    field: 'sequenceNumber',
    startAt: 1004377
});