'use strict';

/**
 * Module dependencies.
 */

require('../../../promo_code/server/models/promoCode.js');
require('../../../booking/server/models/booking.js');

var mongoose = require('mongoose'),
	PromoCodeModel = mongoose.model('PromoCode'),
	BookingModel = mongoose.model('Booking'),
    _ = require('lodash'),
	async = require('async');


function promoCodeUsed(req, res) {
	var user = req.user;
    var promoCode = req.promoCode;
    
	BookingModel.find({user: user._id}).exec(function(err, booking){
		
		async.eachSeries(booking, function(bookingObj, callback) {
			if(JSON.stringify(bookingObj.promoCode) === JSON.stringify(promoCode._id)){
				res.json({
	        		status: 'SUCCESS',
	        		obj: {
	        			msg: 'used'
	        		}
	        	});
			} else {
				callback();
			}
		}, function(err) {
			if(err) {
				return res.status(500).json({
					error: err
				});
			} 
			res.json({
        		status: 'SUCCESS',
        		obj: {
        			msg: 'valid',
        			promoCode: promoCode
        		}
        	});
		});
	});
}


module.exports = function(Rooms) {
	  return {
		  
		  /**
		   * Load Space Type
		   */
		  promoCode: function(req, res, next, id){
			  PromoCodeModel.load(id, function (err, promoCode) {
	              if (err) { return next(err); }
	               if (!promoCode) { 
	                	return next(new Error('Failed to load promo Code ' + id)); 
	               }
	              req.promoCode = promoCode;
	              next();
	          });
		  },
		  
		  
	    /**
		 * get a specific promo Code
		 */
		  get : function(req, res) {
			  var user = req.user;
	          res.send(req.promoCode);
		  },
		  
	    /**
		 * create a space type
		 */
	    create: function(req, res) {
	      var user = req.user;
	      
	      req.assert('isPercent', 'You must enter a if it is percent or not').notEmpty();
	      req.body['admin'] = user;
	      if(req.body.maxCount){
	    	  req.body.useCount = 0;
	      }
	      var promoCode = new PromoCodeModel(req.body);
	      var errors = req.validationErrors();
	      if (errors) {
	    	  return res.status(400).send(errors);
	      }
	      promoCode.save(function(err) {
	        if (err) {
	          switch (err.code) {
	            case 11000:
	            	res.status(400).json([{
		                msg: 'name already taken',
		                param: 'name',
		                err: err
		            }]);
	            	break;
	            case 11001:
		            res.status(400).json([{
		                msg: 'name already taken',
		                param: 'name',
		                err: err
		            }]);
		            break;
	            default:
		            var modelErrors = [];
		            if (err.errors) {
		              for (var x in err.errors) {
		                modelErrors.push({
		                  param: x,
		                  msg: err.errors[x].message,
		                  value: err.errors[x].value
		                });
		              }
		              res.status(400).json(modelErrors);
		            }
	          }
	          return res.status(400);
	        }
	        res.status(200).json(promoCode)
	      });
	    },
	    
	    /**
		 * update a promo Code
		 */
	    update : function(req, res) {
	        var user = req.user;
	        var promoCode = req.promoCode;
	        
	        promoCode = _.extend(promoCode, req.body);
	        var errors = req.validationErrors();
	        if (errors) {
	            return res.status(400).send(errors);
	        }
	        promoCode.save(function (err) {
	            if (err) {
	            	return res.status(500).json({
	                    error: 'Cannot update the promo Code'
	                });
	            }
	            res.json(promoCode);
	        });   
	    },
	    
	    /**
		 * delete a promo Code
		 */
	    delete : function(req, res) {
	        var user = req.user;
	    	var promoCode = req.promoCode;
	    	
	    	promoCode.remove({ _id: req.promoCode._id}, function(err) {
	    		if (err) {
	    			return res.status(500).json({
	                    error: 'Cannot delete the promo Code'
	                });
	            }
	    		res.json(promoCode);
	    	});
	    },
	    
	    /**
		 * List all promo Code
		 */
		all : function(req, res) {
			var user = req.user;
			
			PromoCodeModel.find().exec(function(err, promoCodes) {
				if (err) {
					return res.status(500).json({
						error : 'Cannot list the promoCodes'
					});
				}
				res.json(promoCodes);
			});
		},
		
		deActivatePromoCode : function(req, res) {
			var user = req.user;
	        var promoCode = req.promoCode;
	        
	        promoCode.isActive = req.query.isActive;
	        var errors = req.validationErrors();
	        if (errors) {
	            return res.status(400).send(errors);
	        }
	        promoCode.save(function (err) {
	            if (err) {
	            	return res.status(500).json({
	                    error: 'Cannot update the promo Code'
	                });
	            }
	            res.json(promoCode);
	        });   
		},
		
		validatePromoCode : function(req, res) {
			var user = req.user;
	        var promoCode = req.promoCode;
	        
	        if(promoCode.isActive){
	        	if(promoCode.maxCount){
	        		if(promoCode.maxCount > promoCode.useCount){
	        			promoCodeUsed(req, res);
		        	} else {
		        		res.json({
			        		status: 'SUCCESS',
			        		obj: {
			        			msg: 'expired'
			        		}
			        	});
		        	}
	        	} else {
	        		promoCodeUsed(req, res);
	        	}
	        	
	        } else {
	        	res.json({
	        		status: 'ERROR',
	        		obj: {
	        			msg: 'invalid'
	        		}
	        	});
	        }
		},
	    
	  };
};