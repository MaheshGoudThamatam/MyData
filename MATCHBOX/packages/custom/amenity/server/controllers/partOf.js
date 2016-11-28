'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'), PartOfModel = mongoose.model('PartOf'),UserModel = mongoose.model('User'),_ = require('lodash');
var PartOf = mongoose.model('PartOf');


module.exports = function(Partof) {
  return {
	  
    /**
     * list all amenities
     */
		all : function(req, res) {
      var user = req.user;
       /* if(user.roles.indexOf('admin') === -1) {
        return res.status(401).send('User is not authorized');
      }*/
        PartOfModel.find().exec(function(err, partOfs) {
			if (err) {
				return res.status(500).json({
					error : 'Cannot list the partOfs'
				});
			}
			res.json(partOfs);
		});
    },
   
       
    /**
     * create an amenity
     */
    create: function(req, res) {
      var user = req.user;
         /*if(user.roles.indexOf('admin') === -1) {
        return res.status(401).send('User is not authorized');
      }*/
      req.assert('name', 'You must enter a name').notEmpty();
      req.assert('name', 'You must enter a description').notEmpty();
      req.body['admin'] = user;
      var partof = new PartOf(req.body);
      var errors = req.validationErrors();
      if (errors) {
        return res.status(400).send(errors);
      }
      partof.save(function(err) {
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
		res.json(partof);
	});
    }
    
};
}