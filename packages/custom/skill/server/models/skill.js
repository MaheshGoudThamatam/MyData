'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var validateUniqueSkillName = function(value, callback) {
    var skillModel = mongoose.model('Skill');
    skillModel.find({
        $and: [{
            normalizedName: value
        }, {
            _id: {
                $ne: this._id
            }
        }]
    }, function(err, role) {
        callback(err || role.length === 0);
    });
};
/**
 * Skill Schema.
 */
var SkillSchema = new Schema({
    name: {
        type: String,
        require: true,
        trim: true
    },
    //This field will store the normalized (lowercase and stripped) version of skill name.
    //This will help when storing the skills uniquely. Will avoid storing "HTML5", "HTML 5", "html5" as separate skills.
    normalizedName: {
        type: String,
        require: true,
        unique: true,
        trim: true,
        validate:[validateUniqueSkillName,'Skill already exists']
    },
    description: {
        type: String,
        default: '',
        trim: true
    },
    keywords:[{
        type: String
    }],
    subSkills:[],
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
SkillSchema.statics.load = function(id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};
SkillSchema.statics.loadByNormalizedName = function(skillName, callback) {
    this.findOne({
        normalizedName: skillName.replace(/\s/g, "").toLowerCase()
    }).exec(callback);
};
mongoose.model('Skill', SkillSchema);