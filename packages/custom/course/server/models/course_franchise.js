'use strict';

/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
Schema = mongoose.Schema;

var validateUniqueName = function (value, callback) {
    var Franchise = mongoose.model('Franchise');
    Franchise.find({
        $and: [
            {
                name: { $regex: new RegExp(value, "i") }

            },
            {
                _id: {
                    $ne: this._id
                }
            }
        ]
    }, function (err, franchiseCourse) {
        callback(err || franchiseCourse.length === 0);
    });
};

/**
 * Creates Franchise/Third Party Provider Schema.
 */

var FranchiseSchema = new Schema({
	
	  name: {
	        type: String,
	        default: '',
	        trim: true,
	        required: true,
	        unique:true,
	        validate: [validateUniqueName, 'Name already exists!']
	    },
	    
	  url: {
	       type: String,
	       trim: true,
	       required: true
	    },
	    
	   email: {
		      type: String,
		      trim: true,
		      required: true
		    },
		    
	 contactDetails: [{
		 
		   phoneNumber: {
		        type: Number,
		        default: '',
		        required: true,
		        trim: true
		       		    },
		    mobileNumber: {
		        type: Number,
		        default: '',
		        required: true,
		        trim: true
		    },
		    personName: {
		        type: String,
                trim: true,
	            required: true
	        },
	        designation: {
		        type: String,
	            trim: true,
		        required: true
		    },
		    
		    emailId: {
		        type: String,
	            trim: true,
		        required: true
		    }
		    
		    
	   }],
	   
	   franchise_type: {
	        type: String,
	        default: 'Franchise',
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
FranchiseSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};

/**
 * Mongoose creates a MongoDB collection called 'Franchise/ Third Party
 * Provider'.
 */
mongoose.model('Franchise', FranchiseSchema);