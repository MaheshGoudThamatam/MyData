'use strict';

/**
 * Module dependencies.
 */

require('../../../space_type/server/models/space_types.js');

var mongoose = require('mongoose'),
	SpaceTypeModel = mongoose.model('SpaceType'),
    _ = require('lodash');


module.exports = function(Rooms) {
  return {
	  
	  /**
	   * Load Space Type
	   */
	  spaceType: function(req, res, next, id){
		  SpaceTypeModel.load(id, function (err, spaceType) {
              if (err) { return next(err); }
              if (!spaceType) { return next(new Error('Failed to load space type ' + id)); }
              req.spaceType = spaceType;
              next();
          });
	  },
	  
	 /**
	  * list all space types
	  */
	  pagination : function(req, res) {
	      var user = req.user;
	      /*if(user.roles.indexOf('admin') === -1) {
	    	  return res.status(401).send('User is not authorized');
	      }*/
	      SpaceTypeModel.find().exec(function (err, spaceTypes) {
	    	  if(err) {
	    		  return res.json(err);
	    	  }
	    	  res.json(spaceTypes);
	      });
	  },
	  
    /**
	 * get a specific space_type
	 */
	  get : function(req, res) {
		  var user = req.user;
		  /*if(user.roles.indexOf('admin') === -1 && user.roles.indexOf('partner') === -1) {
			  return res.status(401).send('User is not authorized');
		  }*/
        res.send(req.spaceType);
		 /* SpaceTypeModel.load(req.params.id).exec(function(err, space_type) {
			  if (err)  {
				  return res.json(err);
			  }
			  if(!space_type) {
				  return res.json({ "error": "unable to find space_type"});
			  }
			  return res.json(space_type);
		  });*/
		  // res.send('Only authenticated users can access this');
	  },
	  
    /**
	 * create a space type
	 */
    create: function(req, res) {
      var user = req.user;
      /*if(user.roles.indexOf('admin') === -1) {
        return res.status(401).send('User is not authorized');
      }*/
      console.log(req.body);
      req.assert('name', 'You must enter a name').notEmpty();
      req.body['admin'] = user;
      var space_type = new SpaceTypeModel(req.body);
      var errors = req.validationErrors();
      if (errors) {
        return res.status(400).send(errors);
      }
      space_type.save(function(err) {
        if (err) {
          switch (err.code) {
            case 11000:
            case 11001:
            res.status(400).json([{
                msg: 'name already taken',
                param: 'name'
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
        res.status(200).send({'status' : true})
      });
    },
    /**
	 * update a space type
	 */
    update : function(req, res) {
        var user = req.user;
        /*if(user.roles.indexOf('admin') === -1) {
        	return res.status(401).send('User is not authorized');
        }*/
        var spaceType = req.spaceType;
        spaceType = _.extend(spaceType, req.body);
        var errors = req.validationErrors();
        if (errors) {
            return res.status(400).send(errors);
        }
        spaceType.save(function (err) {
            if (err) {
            	return res.status(500).json({
                    error: 'Cannot update the space type'
                });
            }
            res.json(spaceType);
        });   
    },
    /**
	 * delete a space type
	 */
    delete : function(req, res) {
        var user = req.user;
    	var spaceType = req.spaceType;
    	/*if(user.roles.indexOf('admin') === -1) {
    		return res.status(401).send('User is not authorized');
    	}*/
    	spaceType.remove({ _id: req.spaceType._id}, function(err) {
    		if (err) {
    			return res.status(500).json({
                    error: 'Cannot delete the space type'
                });
            }
    		res.json(spaceType);
    	});
    } 
  };
};