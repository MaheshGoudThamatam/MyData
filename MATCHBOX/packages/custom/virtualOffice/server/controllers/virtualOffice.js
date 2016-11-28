'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var VirtualOfficeModel = mongoose.model('virtualOffice');
var VirtualOfficeFacilityModel = mongoose.model('VitualOfficeFacility');
var Spaces = require('../../../space/server/models/space.js');
var SpaceModel = mongoose.model('Space');
var _ = require('lodash');
var async = require('async');
var logger = require('../../../../core/system/server/controllers/logs.js');



module.exports = function(Rooms) {
    return {
    	getVirtualOffice : function(req, res, next, id) {
    		VirtualOfficeModel.load(id, function(err, virtualOffice) {
				if (err) {
					return next(err);
				}
				if (!virtualOffice) {
					return next(new Error('Failed to load virtualOffice' + id));
				}
				req.virtualOffice = virtualOffice;
				next();

			});
		},
		
        create: function(req, res) {
            var virtualOffice = new VirtualOfficeModel(req.body);
            virtualOffice.save(function(err, virtualOfficeObj) {
                if (err) {
                	 logger.log('error', 'POST '+req._parsedUrl.pathname+' Failed to create virtual office ' + err); 
                    res.send(400);
                } else {
                	 logger.log('info', 'POST '+req._parsedUrl.pathname+'Virtual office created successfully ');
                    res.json(virtualOfficeObj);
                }
            });
        },
        
        update: function(req, res) {
        	console.log(req.body);
            var virtualOffice = _.extend(req.virtualOffice, req.body);
            console.log(virtualOffice);
            virtualOffice.save(function(err, virtualOfficeObj) {
                if (err) {
                	 logger.log('error', 'PUT '+req._parsedUrl.pathname+' Failed to create virtual office ' + err); 
                    res.send(400);
                } else {
                	 logger.log('info', 'PUT '+req._parsedUrl.pathname+'Virtual office updated successfully ');
                    res.json(virtualOfficeObj);
                }
            });
        },
        
        getVirtualOffices : function(req, res) {
        	
        	VirtualOfficeModel.find().deepPopulate(['spaceId', 'spaceId.partner']).populate('roomtype').exec(function (err, virtualOffices) {
                 if(err) {
                   return res.json(err);
                 }
                 else{
                 res.json(virtualOffices);
                  }
               });
        },
        
        getVirtualOfficebyId : function(req, res) {
        	 res.json(req.virtualOffice);
        },
        
        createFacilities : function(req, res) {
            var facilityObj = new VirtualOfficeFacilityModel(req.body);
            facilityObj.save(function(err, facilities) {
                if (err) {
                    res.send(400);
                } else {
                    res.send(200);
                }
            });
        },
        
        getFacilities : function(req, res) {
        	VirtualOfficeFacilityModel.find().exec(function (err, facilities) {
                 if(err) {
                   return res.json(err);
                 }
                 res.json(facilities);
               });
        },

        getVirtualOfficesPartner : function(req, res) {
            
            VirtualOfficeModel.find({$or:[{"createdBy":req.user._id},{"partner":req.user._id}]}).deepPopulate(['spaceId', 'spaceId.partner']).populate('roomtype').exec(function (err, virtualOffices) {
                 if(err) {
                   return res.json(err);
                 }
                 else{
                 res.json(virtualOffices);
                  }
               });
        },

        getVirtualOfficesBySapce : function(req, res) {

            var spaceId=req.query.spaceId;
            
            VirtualOfficeModel.find({"spaceId":spaceId}).deepPopulate(['spaceId', 'spaceId.partner']).populate('roomtype').exec(function (err, virtualOffices) {
                 if(err) {
                   return res.json(err);
                 }
                 else{
                 res.json(virtualOffices);
                  }
               });
        }
        
    };
};