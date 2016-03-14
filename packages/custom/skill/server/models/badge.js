'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var validateUniqueBadgeName = function(value, callback) {
      var Badge = mongoose.model('Badge');
      Badge.find({
        $and: [{
          badgeName: { $regex : new RegExp(value, "i") }
        }, {
          _id: {
            $ne: this._id
          }
        }]
      }, function(err, badge) {
        callback(err || badge.length === 0);
      });
    };
/**
 * Skill Schema.
 */
var BadgeSchema = new Schema({
    badgeName: {
        type: String,
        default: '',
        trim: true,
        required: true,
        unique:true,
        validate:[validateUniqueBadgeName,'Badge Name already exists']
    },
    badgeImage:{
       type: String,
       default: '',
       trim: true
   },
    description:{
	   type: String,
       default: '',
       trim: true
    },
    qualifySkills:{
       type: String,
       default: '',
       trim: true
    },
    qualifyPoints:{
       type: String,
       default: '',
       trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
   
});

/**
 * Statics
 */
BadgeSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};

mongoose.model('Badge', BadgeSchema);
