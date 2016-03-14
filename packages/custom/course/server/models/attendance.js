var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var AttendanceSchema = new Schema({
    batch_id:{
		type: Schema.ObjectId,
		  ref: 'Batch'
	},
	date:{
		type:Date,
        trim: true
	},
	student_id:{
		type: Schema.ObjectId,
		  ref: 'User'
	},
	attended:{
		type:Boolean,
		trim:true
	},
	comment:{
      type:String,
      default:""
	}
});

mongoose.model('Attendance', AttendanceSchema);