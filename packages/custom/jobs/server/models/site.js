'use strict';
/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var validateUniqueWebsiteName = function(value, callback) {
	  var Site = mongoose.model('Site');
	  Site.find({
	    $and: [{
	    	websiteName: { $regex : new RegExp(value, "i") }
	    }, {
	      _id: {
	        $ne: this._id
	      }
	    }]
	  }, function(err, site) {
	    callback(err || site.length === 0);
	  });
	};
	
/**
 * Site Schema.
 */
var SiteSchema = new Schema({
	
	websiteName: {
        type: String,
        default: '',
        trim: true,
        unique:true,
        validate:[validateUniqueWebsiteName,'Website Name already exists']
    },
    websiteUrl: {
        type: String,
        default: '',
        trim: true
    },
    siteUsername: {
        type: String,
        default: '',
        trim: true
    },
    sitePassword: {
        type: String,
        default: '',
        trim: true
    },
    apiUrl: {
        type: String,
        default: '',
        trim: true
    },
    apiSecret: {
        type: String,
        default: '',
        trim: true
    },
    apiSiteId: {
        type: String,
        default: '',
        trim: true
    },
    checkLoginAPIendpoint: {
        type: String,
        default: '',
        trim: true
    },
    /*checkLoginAPIJSON: {
        type: String,
        default: '',
        trim: true
    },*/
    getUserInfoAPIendpoint: {
        type: String,
        default: '',
        trim: true
    },
    /*getUserInfoAPIJSON: {
        type: String,
        default: '',
        trim: true
    },*/
    getSingleJobAPIendpoint: {
        type: String,
        default: '',
        trim: true
    },
    /*getSingleJobAPIJSON: {
        type: String,
        default: '',
        trim: true
    },*/
    getAllJobsAPIendpoint: {
        type: String,
        default: '',
        trim: true
    },
    /*getAllJobsAPIJSON: {
        type: String,
        default: '',
        trim: true
    },*/
    enabled: {
        type: Boolean,
        default: ''
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
SiteSchema.statics.load = function (id, callback) {
    this.findOne({
        _id: id
    }).exec(callback);
};

mongoose.model('Site', SiteSchema);