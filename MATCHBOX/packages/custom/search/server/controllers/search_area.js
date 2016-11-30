'use strict';

/**
 * Module dependencies.
 */

require('../../../search/server/models/search_area.js');
require('../../../search/server/models/city.js');

var logger = require('../../../../core/system/server/controllers/logs.js');

var mongoose = require('mongoose'),
	AreaModel = mongoose.model('Area'),
	CityModel = mongoose.model('City'),
	async = require('async'),
    _ = require('lodash');


module.exports = function(Search) {
  return {
	  
	  /**
	   * Load Area
	   */
	  area: function(req, res, next, id){
		  AreaModel.load(id, function (err, area) {
              if (err) { return next(err); }
              if (!area) { return next(new Error('Failed to load area ' + id)); }
              req.area = area;
              next();
          });
	  },
	  
	  /**
	   * Load city by Name
	   */
	  cityName: function(req, res, next, id){
		  AreaModel.loadByName(id, function (err, area) {
              if (err) { return next(err); }
              if (!area) { return next(new Error('Failed to load area ' + id)); }
              req.area = area;
              next();
          });
	  },
	  
     /**
	  * get a specific area
	  */
	  get : function(req, res) {
		  var user = req.user;
		  res.send(req.area);
	  },
	  
	  /**
	   * get a all area
	   */
	  all : function(req, res) {
		  var user = req.user;
		  res.send(req.area);
	  },
	  
	  /**
	   * Load City
	   */
	  city: function(req, res, next, id){
		  CityModel.load(id, function (err, city) {
              if (err) { return next(err); }
              if (!city) { return next(new Error('Failed to load city ' + id)); }
              req.city = city;
              next();
          });
	  },
	  
	  /**
	   * get a specific city
	   */
	  getCity : function(req, res) {
		  var user = req.user;
		  res.send(req.city);
	  },
	  
	  /**
	   * get a all city
	   */
	  allCity : function(req, res) {
		  var query = {};
		  CityModel.find(query, function (err, cities) {
              if (err) { return next(err); }
              if (!cities) { return next(new Error('Failed to load cities')); }
    		  res.send(cities);
          });
	  },
	  
	  allCityDetail : function(req, res) {
		  var query = {};
		  CityModel.find(query, function (err, cities) {
              if (err) { return next(err); }
              if (!cities) { return next(new Error('Failed to load cities')); }
    		  res.send(cities);
          });
	  },
	  
    /**
	 * create a area
	 */
    create: function(req, res) {
      var user = req.user;
      var counter = 0;
      
      /*var geocodeObj = {};
      var geocoderProvider = 'google';
      var httpAdapter = 'https';
      var extra = {
    	  serverKey: 'AIzaSyA3mNMJvbJ6MJ3n4KJ4_I0MEDesB1SH4kE',   
          formatter: null                           
      };*/
      
      var locationList = req.body;
      var location = {};
      location.areas = [];
      location.city = locationList.city;
      location.timeZoneOffset = locationList.timeZoneOffset;
      
      for(var i = 0; i < locationList.areas.length; i++){
    	  var valueObj = {
    		  value : locationList.areas[i].value,
      		  loc : []
    	  }
    	  location.areas.push(valueObj);
      }
      
      /*var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter, extra);

	  async.eachSeries(location.areas, function(areaObj, callback) {
		  counter++;
	      var address = areaObj.value + ',' + location.city + ',' + 'India';
	      geocoder.geocode(address).then(function(response) {
	    	  	console.log(counter);
	    	  	geocodeObj = response[0];
	    	  	areaObj.loc = [geocodeObj.longitude, geocodeObj.latitude];
	    	  	location.areas[counter-1].loc = [geocodeObj.longitude, geocodeObj.latitude];
	    	  	
	    	  	if(counter === location.areas.length){*/
	    	      var area = new AreaModel(location);
			      area.save(function(err) {
			        if (err) {
			          switch (err.code) {
			            case 11000:
			            case 11001:
				            res.status(400).json([{
				                msg: 'city already taken',
				                param: 'city'
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
			          return res.status(400).json(err);
			        }
			        res.status(200).json(area);
			      });
			      /*} 
	    	  	callback();
	      }).catch(function(err) {
              logger.log('error', 'POST ' + req._parsedUrl.pathname + ' Fetching geocode for specific location failed ' + err);
	     	  res.status(400).json(err);
	      });

	  }, function(err) {
			if(err) {
	            logger.log('error', 'POST ' + req._parsedUrl.pathname + ' Async Each series failed ' + err);
				return res.status(500).json({
					error: 'Error for inner loop. ' + err
				});
			} 
	  	});*/
    },
    
    /**
	 * update a area
	 */
    update : function(req, res) {
    	var user = req.user;
        var locationList = req.area;
        var counter = 0;

        var localityList = req.body;
        var location = {};
        location.areas = [];
        location.city = locationList.city;
        
        for(var i = 0; i < locationList.areas.length; i++){
        	location.areas.push(locationList.areas[i]);
        }
        
        for(var i = 0; i < localityList.areas.length; i++){
        	var valueObj = {
        		value : localityList.areas[i].value,
        		loc : []
      	  	}
      	  	location.areas.push(valueObj);
        }
        
        locationList = _.extend(locationList, location);
        
        locationList.save(function(err) {
	        if (err) {
	          switch (err.code) {
	            case 11000:
	            case 11001:
		            res.status(400).json([{
		                msg: 'city already taken',
		                param: 'city'
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
	          return res.status(400).json(err);
	        }
	        res.status(200).json(location);
	      });
  	    	  	
      },
    
     /**
  	  * Update the latitude and longitude of a locality based on city.
  	  * Updates the Area Model based on city id and specific locality id 
  	  * from the array of areas.
  	  */
      updateLatLong : function(req, res) {
      	  var user = req.user;
          var locationList = req.area;
          var counter = 0;

          var localityObj = req.body;
          
          AreaModel.update({
        	  _id: locationList._id, 
        	  'areas._id': localityObj.originalObject._id
          }, {
        	  '$set': {
        		   'areas.$.loc': localityObj.originalObject.loc          
        	  }
          }, function(err, numAffected) {
        	  	if (err) {
      	          switch (err.code) {
      	            case 11000:
      	            case 11001:
      		            res.status(400).json([{
      		                msg: 'city already taken',
      		                param: 'city'
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
      	          return res.status(400).json(err);
      	        }
      	        res.status(200).json(numAffected);
          });
    	    	  	
        },
      
    /**
	 * delete a area
	 */
    delete : function(req, res) {
        var user = req.user;
    	var area = req.area;
    	area.remove({ _id: req.area._id}, function(err) {
    		if (err) {
    			return res.status(500).json({
                    error: 'Cannot delete the area'
                });
            }
    		res.json(area);
    	});
    }, 
      
    location : function(req, res) {
    	var query = {
			'city' : new RegExp('^' + req.query.city + '$', "i")
		};
		
    	AreaModel.findOne(query, function(err, areas) {
			if(err){
				res.json({'code': '0001', 'msg': err});
			}
			res.json(areas);
		});
    },
    
    /**
	 * create a city
	 */
    createCity : function(req, res) {
      var user = req.user;
      var city = req.body;
      
      var city = new CityModel(city);
      city.save(function(err) {
        if (err) {
          switch (err.code) {
            case 11000:
            case 11001:
	            res.status(400).json([{
	                msg: 'city already taken',
	                param: 'city'
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
          return res.status(400).json(err);
        }
        res.status(200).json(city);
      });
    },
    
    /**
	 * update a city
	 */
    updateCity : function(req, res) {
    	var user = req.user;
        var city = req.city;
        var cityBody = req.body;
     
        city = _.extend(city, cityBody);
        
        city.save(function(err) {
	        if (err) {
	          switch (err.code) {
	            case 11000:
	            case 11001:
		            res.status(400).json([{
		                msg: 'city already taken',
		                param: 'city'
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
	          return res.status(400).json(err);
	        }
	        res.status(200).json(city);
	      });
      },
      
      /**
  	   * Update the localities with lat - long explicitly.
  	   */
      updateLocality : function(req, res) {
    	  var user = req.user;
          var area = req.area;
          var localityName = req.query.localityName;
          var loc = [];
          
          var geocodeObj = {};
          var geocoderProvider = 'google';
          var httpAdapter = 'https';
          var extra = {
       	      serverKey: 'AIzaSyA3mNMJvbJ6MJ3n4KJ4_I0MEDesB1SH4kE',   
              formatter: null                           
          };
          var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter, extra);
          
      	 async.waterfall([ function(done) {
      		 
      		 var address = localityName + ', ' + area.city + ', ' + 'India';
      		 var subAddress = localityName;
			 var result = subAddress.match(/\((.*)\)/);
			 
			 if(result){
				 
				 subAddress = result[1] + ', ' + area.city + ', ' + 'India';
				 geocoder.geocode(subAddress).then(function(subResponse) {
					 geocodeObj = subResponse[0];
					 loc = [geocodeObj.longitude, geocodeObj.latitude];
					 done(null, loc);
	   	  	 
	             }).catch(function(err) {
	             	  res.status(400).send(err);
	             });
				 
			 } else {
				 res.status(400).json({
	                ERR_MSG: "Unable to fetch latitude and longitude for the address"
	            });
			 }
      		
			 /* Warning: a promise was created in a handler but was not returned from it
			 Can be handled with below code i.e by using return statment
			 https://github.com/petkaantonov/bluebird/blob/master/docs/docs/warning-explanations.md */
			 
      		/*geocoder.geocode(address).then(function(response) {
      			 console.log(response);
      			 if(response.length <= 0){
      				 var subAddress = localityName;
      				 var result = subAddress.match(/\((.*)\)/);
      				 subAddress = result[1] + ', ' + area.city + ', ' + 'India';
      				
      				 return geocoder.geocode(subAddress).then(function(subResponse) {
      					 geocodeObj = subResponse[0];
                	  	 loc = [geocodeObj.longitude, geocodeObj.latitude];
                	  	 return done(null, loc);
                	  	 
      	             }).catch(function(err) {
      	             	  res.status(400).send(err);
      	             });
      				
      			 } else {
             	  	 geocodeObj = response[0];
             	  	 loc = [geocodeObj.longitude, geocodeObj.latitude];
            	  	 done(null, loc);
      			 }
      			 
             }).catch(function(err) {
             	  res.status(400).send(err);
             });*/
			 
		 }, function(loc, done) {
	           done(null, loc);
	    	    	  	
		 } ], function(err, loc) {
      		 if(err){
      			res.status(400).send(err);
      		 }
 	         res.status(200).json({
 	        	 location: loc
 	         });
		 });
          
      }
      
  };
};