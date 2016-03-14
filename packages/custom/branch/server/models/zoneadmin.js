'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var zoneAdminSchema = new Schema({
	
	zone: {
        type: Schema.ObjectId,
        ref: 'Zone',
        required:true
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User',
        required:true
    },
    createdAt: {
        type: Date,
        default: Date.now
        //unique: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }

});

zoneAdminSchema.statics.load = function (id, callback) {
	// Perform database query that calls callback when it's done
	
    this.findOne({
        _id: id
    }).populate('zone', 'name').populate('user', 'name').exec(callback);
};

zoneAdminSchema.statics.loadzoneadminByZone = function (id, callback) {
    this.find(
    		{
        zone: id
    	}
    		).populate('zone', 'name').populate('user', 'name').exec(callback);
};
zoneAdminSchema.statics.loadzoneadminbyZones = function (ids, callback) {
    this.find({
       role: { 
           $in : ids 
       } 
   }).populate('zone', 'name').populate('user', 'name').exec(callback);
};

mongoose.model('ZoneAdmin', zoneAdminSchema);