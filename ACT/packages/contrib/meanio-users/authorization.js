'use strict';
require('../../custom/building/server/models/building.js');
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    _ = require('lodash');
var config = require('../../custom/actsec/server/config/config.js');

/**
 * Generic validates if the first parameter is a mongo ObjectId
 */
exports.isMongoId = function(req, res, next) {
    if ((_.size(req.params) === 1) && (!mongoose.Types.ObjectId.isValid(_.values(req.params)[0]))) {
        return res.status(500).send('Parameter passed is not a valid Mongo ObjectId');
    }
    next();
};

/* this function will match user permissions */
exports.checkPermission = function(req, res, next) {
    if (!req.user) {
        return res.status(401).send([{
            "permission": 'Access denied'
        }]);
    } else if (req.user.role.permissions[req.feature] && req.user.role.permissions[req.feature][req.action]) {
        next();
    } else {
        return res.status(403).send([{
            "permission": 'Unauthorized'
        }]);
    }

};

/**
 * TODO: Maybe required in the future.
 */
/* this function will fetch user buildings */
/*var userBuildings = function(req, res, next) {
	if (req.user.locations) {
		var userLocations = req.user.locations;

		BuildingModel.find({
			location: {
				$in: userLocations
			}
		}).exec(function(err, buildings) {
			var buildingsArray = [];
			if (err) {
				return res.status(500).json({
					error: 'Cannot list the building'
				});
			}
			buildingsArray = (buildings);
			if (req.user.buildings.length > 0) {
				var buildingScope = (req.user.buildings).concat(buildingsArray);
				req.buildingsScope = _.uniq(buildingScope);
				next();
			} else {
				req.buildingsScope = buildingsArray;
				next();
			}
		});

	} else {
		return res.status(400).send('Not authorized');
	}

};*/
exports.create = function(req, res, next) {
    req.action = 'create';
    next();
};

exports.read = function(req, res, next) {
    req.action = 'read';
    next();
};

exports.update = function(req, res, next) {
    req.action = 'update';
    next();
};

exports.delete = function(req, res, next) {
    req.action = 'delete';
    next();
};

/* to auhtenticate user based on buildings */
exports.buildingauthentication = function(req, buildingId, companyId) {
    if ((companyId == req.user.company._id + '') && (req.buildingsScope.indexOf(buildingId) >= 0)) {
        return true;
    } else {
        return false;
    }
};

/* to auhtenticate user based on company */
exports.companyAuthentication = function(req, companyId) {
    return (req.user.company._id + '' == companyId);
}

/* to authenticate compristine role*/
exports.companyAuthenticationRole = function(req, companyId) {
    if (req.user.role._id + '' !== config.roles.SUPER_ADMIN) {
        return (req.user.company._id + '' == companyId);
    } else {
        return (req.role.admin == true);
    }
}

exports.checkLogin = function(req, res, next) {
    if (!req.user) {
        return res.status(401).send([{
            "permission": 'Access denied'
        }]);
    } else {
        next();
    }
}