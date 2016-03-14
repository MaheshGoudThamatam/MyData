'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


var SkillkeywordsSchema = new Schema({
  skillId: {
    type: Schema.ObjectId,
    ref:'Skill'
  },
  keyword: {
    type: String,
    trim: true,
    unique:true
  },
  normalizedKeyword:{
   type:String,
   trim:true,
   unique:true
  }
});

mongoose.model('Skillkeyword', SkillkeywordsSchema);