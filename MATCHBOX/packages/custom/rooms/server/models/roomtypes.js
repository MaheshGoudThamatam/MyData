var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
 

/**
 * Rooms Schema.
 */
var Roomstype = new Schema ({
  name: {
    type: String,
    //default : ""
  },
  created: {
    type: Date,
    default: Date.now
  },
  commission:{
	  type:Number
  }
});

mongoose.model('Roomstype', Roomstype);