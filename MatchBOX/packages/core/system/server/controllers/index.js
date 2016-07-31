'use strict';

var mean = require('meanio');
module.exports = function(System){
  return {
    render:function(req,res){
      res.render('index',{ locals: { config: System.config.clean }});
    },
    aggregatedList:function(req,res) {
      res.send(res.locals.aggregatedassets);
    }
  };
};




/*'use strict';

var Variables = require('../../../../contrib/permission/server/models/permission.js');
var mean = require('meanio');
var Variable = require('mongoose').model('Variables');

module.exports = function(System){
  return {
    render:function(req, res) {
      var modules = [];
      // Preparing angular modules list with dependencies
      for (var name in mean.modules) {
        modules.push({
          name: name,
          module: 'mean.' + name,
          angularDependencies: mean.modules[name].angularDependencies
        });
      }

      function isAdmin() {
        return req.user && req.user.roles.indexOf('admin') !== -1;
      }

      function listPermissions(allPermission) { // checking for user role and permission
        var permission = [];
        
        allPermission[0].data.forEach(function(value) {
          value.roles.forEach(function(role) {
            if (req.user.roles.indexOf(role) > -1)
              permission.push(value.permission);
          });
        });
        return permission;
      }

      // Send some basic starting info to the view
      var query = Variable.find({
        name: 'permission'
      });

      query.exec(function(err, allPermission) {
        res.render('index', {
          user: req.user ? {
            name: req.user.name,
            _id: req.user._id,
            username: req.user.username,
            permission: listPermissions(allPermission),
            roles: req.user.roles
          } : {},
          modules: modules,
          isAdmin: isAdmin,
          adminEnabled: isAdmin() && mean.moduleEnabled('mean-admin')
        });
      });
    },
    aggregatedList:function(req,res) {
      res.send(res.locals.aggregatedassets);
    }
  };
};
*/