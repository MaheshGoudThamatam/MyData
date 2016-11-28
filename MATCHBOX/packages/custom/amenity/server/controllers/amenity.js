'use strict';

/**
 * Module dependencies.
 */
require('../../../space_type/server/models/space_types.js');
var mongoose = require('mongoose'), 
	AmenitiesModel = mongoose.model('Amenities'), 
	UserModel = mongoose.model('User'), _ = require('lodash');

var Amenities = mongoose.model('Amenities'), 
	PartOfModel = mongoose.model('PartOf'),
	SpaceTypeModel = mongoose.model('SpaceType');

module.exports = function(Amenity) {
	return {

		/**
		 * Find holiday by id
		 */
		amenity : function(req, res, next, id) {
			AmenitiesModel.load(id, function(err, amenity) {
				if (err) {
					return next(err);
				}
				if (!amenity) {
					return next(new Error('Failed to load amenity' + id));
				}
				req.amenity = amenity;
				next();

			});
		},
		
		spaceType : function(req, res, next, id) {
			SpaceTypeModel.load(id, function(err, spaceType) {
				if (err) {
					return next(err);
				}
				if (!spaceType) {
					return next(new Error('Failed to load space type' + id));
				}
				req.spaceType = spaceType;
				next();

			});
		},
		
		/**
		 * list all amenities
		 */
		all : function(req, res) {
			var user = req.user;
			/*if (user.roles.indexOf('admin') === -1) {
				return res.status(401).send('User is not authorized');
			}*/
			AmenitiesModel.find().exec(function(err, amenities) {
				if (err) {
					return res.status(500).json({
						error : 'Cannot list the amenities'
					});
				}
				res.json(amenities);
			});
		},

		/**
		 * show a specific amenity
		 */
		show : function(req, res) {
			var user = req.user;
			/*if (user.roles.indexOf('admin') === -1
					&& user.roles.indexOf('partner') === -1) {
				return res.status(401).send('User is not authorized');
			}*/
			res.json(req.amenity);
		},

		/**
		 * create an amenity
		 */
		create : function(req, res) {
			 req.body.isStatus = false;
			var user = req.user;
		
			/*if (user.roles.indexOf('admin') === -1) {
				return res.status(401).send('User is not authorized');
			}*/
			req.assert('name', 'You must enter a name').notEmpty();
			req.assert('description', 'You must enter a description')
					.notEmpty();
			req.assert('partOf', 'You must enter a partOf')
			.notEmpty();
			req.assert('appliesTo', 'You must enter a appliesTo')
			.notEmpty();
			req.body['admin'] = user;
		
			SpaceTypeModel.load(req.body.appliesTo, function (err, spaceType) {
	              if (err) { return next(err); }
	              if (!spaceType) { return next(new Error('Failed to load space type ' + id)); }
	            
	            if(spaceType.name.toLowerCase() == 'any')
	            {
	            	  req.body.isStatus = true;
	              }
	            var amenities = req.body;
	         
			var amenity = new AmenitiesModel(amenities);
			var errors = req.validationErrors();
			if (errors) {
				return res.status(400).send(errors);
			}
			amenity.save(function(err) {
				if (err) {
					switch (err.code) {
					case 11000:
					case 11001:
						res.status(400).json([ {
							msg : 'Name already exists',
							param : 'name'
						} ]);
						break;
					default:
						var modelErrors = [];
						if (err.errors) {
							for ( var x in err.errors) {
								modelErrors.push({
									param : x,
									msg : err.errors[x].message,
									value : err.errors[x].value
								});
							}
							console.log('mod' + modelErrors);
							res.status(400).json(modelErrors);
						}
					}
					return res.status(400);
				}
				res.json(amenity);
			});
			 });
		},
		/**
		 * update an amenity
		 */
		update : function(req, res) {
			var user = req.user;
			req.body.isStatus = false;
			/*if (user.roles.indexOf('admin') === -1) {
				return res.status(401).send('User is not authorized');
			}*/
			var amenity = req.amenity;
			req.assert('name', 'Please enter  Name').notEmpty();
			req.assert('description', 'Please enter  description').notEmpty();
			var errors = req.validationErrors();
			if (errors) {
				return res.status(400).send(errors);
			}
			SpaceTypeModel.load(req.body.appliesTo, function (err, spaceType) {
	              if (err) { return next(err); }
	              if (!spaceType) { return next(new Error('Failed to load space type ' + id)); }
	            
	           
	              
	            if(spaceType.name.toLowerCase() == 'any'){
	            	  req.body.isStatus = true;
	              }
	            var amenities = req.body;
	            amenity = _.extend(amenity, amenities);
			amenity.save(function(err) {
				if (err) {
					switch (err.code) {
					case 11000:
					case 11001:
						res.status(400).json([ {
							msg : 'Name already exists',
							param : 'name'
						} ]);
						break;
					default:
						var modelErrors = [];
						if (err.errors) {
							for ( var x in err.errors) {
								modelErrors.push({
									param : x,
									msg : err.errors[x].message,
									value : err.errors[x].value
								});
							}
							console.log('mod' + modelErrors);
							res.status(400).json(modelErrors);
						}
					}
					return res.status(400);
				}
				res.json(amenity);
			});
			});
		},
		/**
		 * delete an amenity
		 */
		destroy : function(req, res) {
			var user = req.user;
			/*if (user.roles.indexOf('admin') === -1) {
				return res.status(401).send('User is not authorized');
			}*/
			var amenity = req.amenity;

			amenity.remove(function(err) {
				if (err) {
					return res.status(500).json({
						error : 'Cannot delete the amenity'
					});
				}
				res.json(amenity);
			});
		},

		/**
		 * Fetch selected amenities 
		 */
		selectedAmenities : function(req, res) {

			var partOfQuery = {
				'name' : new RegExp('^' + req.query.partOf + '$', "i")
			};
			PartOfModel.findOne(partOfQuery, function(err, partOf) {
				if (err) {
					return res.status(500).json({
						error : 'Cannot find part of'
					});
				}
				var query = {};
				if(null != partOf){
					query.partOf = partOf._id;
				}else{
					res.json({msg:"No amenities found"})
				}
				
				query.appliesTo = {
					$in: [req.spaceType._id]
				};
				
				var spaceTypeQuery = {
					'name' : new RegExp('^' + 'any' + '$', "i")
				};
				SpaceTypeModel.findOne(spaceTypeQuery, function(err, spaceType) {
					if (err) {
						return res.status(500).json({
							error : 'Cannot find part of'
						});
					}
					if (!spaceType) {
						return res.status(500).json({
							error : 'Cannot find Space Type'
						});
					}
					
					query.appliesTo.$in.push(spaceType._id);
					AmenitiesModel.find(query, function(err, amenities) {
						if (err) {
							return res.status(500).json({
								error : 'Cannot load amenities'
							});
						}
						res.json(amenities);
					});
				});
			});
		}
	};
}