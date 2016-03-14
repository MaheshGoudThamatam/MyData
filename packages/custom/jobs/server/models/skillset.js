'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var validateUniqueSkillSetName = function(value, callback) {
    var skillsetModel = mongoose.model('skillset');
    skillsetModel.find({
        $and: [{
            normalizedname: value
        }, {
            _id: {
                $ne: this._id
            }
        }]
    }, function(err, role) {
        callback(err || role.length === 0);
    });
};

var skillsetSchema = new Schema({
   name: {
        type: String,
        trim: true
    },
    normalizedname:{
        type: String,
        unique: true,
        trim: true,
        validate:[validateUniqueSkillSetName,'Skill Set already exists']
    },
    skill:[{
         skillid:{type:Schema.ObjectId,ref:'Skill'},
         skilllevel:{type:Number},
         main:{type:Boolean}
    }],
    cost: {
        type: Number,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


skillsetSchema.statics.load = function(id, callback) {
    this.findOne({
        _id: id
    }).populate('skill.skillid','name').exec(callback);
};

mongoose.model('skillset', skillsetSchema);