'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
* Validation
*/
var validateUniqueCourseName = function(value, callback) {
      var Course = mongoose.model('Course');
      Course.find({
        $and: [{
          name: { $regex : new RegExp(value, "i") }
        }, {
          _id: {
            $ne: this._id
          }
        }]
      }, function(err, course) {
        callback(err || course.length === 0);
      });
    };
/**
 * Course Schema.
 */
var CourseSchema = new Schema({
    name: {
        type: String,
        default: '',
        trim: true,
        required: true,
        unique:true,
        validate:[validateUniqueCourseName,'Course Name already exists']
    },

    description: {
        type: String,
        default: '',
        trim: true
    },

    delivery_method:{
        type: String,
        default: 'Online',
        trim: true
    },

    course_picture:{
        type: String,
        default: '',
        trim: true
    },

    online_mentor_support:{
        type: String,
        default: 'No',
    },

    project_based_learning:{
        type: String,
        default: 'No',
    },

    counselling:{
        type: String,
        default: 'No',
    },

    cost:{
        type:Number,
    },

    hours:{
        type:Number,
    },

    duration:{
        type:Number,
    },

    duration_type:{
        type: String,
        default: '',
        trim: true
    },

    course_startDate:{
        type: Date,
        default: Date.now
    },

    user:{
        type: Schema.ObjectId,
        ref: 'User'  
    },

    usercourse:{
        type: Schema.ObjectId,
        ref: 'UserCourse'  
    },

    coursemode:{
        type: Schema.ObjectId,
        ref: 'CourseMode'
    },

    security_deposit:{
        type:Number
    },

    join_ct_agency:{
        type:String
    },

    service_charge:{
        type:Number
    },

    payment:{
        type:String
    },

    course_discount:{
        type:Number
    },

    course_category: {
        type: String,
        default: '',
        trim: true
    },

    course_type: {
        type: String,
        default: 'CodersTrust Course',
        trim: true
    },

    course_thirdparty_url:{
        type:String, 
        default: '',
        trim: true
    },

    costType: {
        type: String,
        default: 'Free',
        trim: true
    },

    courseSkill: [{
        pre_requisite: {
            type: Number
        },  

        target_value: {
            type: Number
        },
        skillName: {
            type: Schema.ObjectId,
            ref: 'Skill'
        }
    }],

    qualification: {
        type: String,
        default: '',
        trim: true
    },
    companyName: {
        type: Schema.ObjectId,
        ref: 'Franchise'  
    },
    
    course_icon:{
        type: String,
        default: '',
        trim: true
    },
    
     publish:{
        type: String,
        default: 'False',
        trim: true
     },
     checklist: {
         type: [
             {type: Schema.ObjectId, ref: 'CourseCounsellingChecklist'}
         ]
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
CourseSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).populate('coursemode', 'mode deposit_amount').populate('usercourse', 'payment_method course').populate('user', 'name').populate('curriculum').populate('companyName').populate('courseSkill.skillName').populate("branch").populate('payment_scheme').exec(callback);
};




mongoose.model('Course', CourseSchema);