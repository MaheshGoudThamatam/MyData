'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var CancelBookingReasonsSchema = new Schema({
   
    reason: {
        type: String
    }
    
});


CancelBookingReasonsSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    });
};
mongoose.model('CancelBookingReasons', CancelBookingReasonsSchema);



