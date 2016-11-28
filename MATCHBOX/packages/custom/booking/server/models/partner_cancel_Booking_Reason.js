'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var PartnerCancelBookingReasonsSchema = new Schema({
   
    reason: {
        type: String
    }
    
});


PartnerCancelBookingReasonsSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    });
};
mongoose.model('PartnerCancelBookingReason', PartnerCancelBookingReasonsSchema);



