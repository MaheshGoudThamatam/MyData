'use strict';

/**
 * Module dependencies.
 */

require('../../../../custom/role/server/models/role.js');
require('../../../../custom/mentor/server/models/mentor_request.js');
var utility = require('../../../../core/system/server/controllers/util.js');
var uuid = require('node-uuid'), multiparty = require('multiparty'), fs = require('fs');
var uploadUtil = require('../../../../core/system/server/controllers/upload.js');

var async = require('async');
var mongoose = require('mongoose'),
    RoleModel = mongoose.model('Role'),
    UserModel = mongoose.model('User'),
    MentorRequestModel = mongoose.model('MentorRequest'),
    _ = require('lodash');

var postTaskImage = function(req, res, err, fields, files) {
   var pathObj = {};
   var file = files.file[0];
   var contentType = file.headers['content-type'];
   var tmpPath = file.path;
   var extIndex = tmpPath.lastIndexOf('.');
   var extension = (extIndex < 0) ? '' : tmpPath.substr(extIndex);
   var fileName = uuid.v4() + extension;
   var destination_file = __dirname + '/../../../../core/system/public/assets/uploads/';
   pathObj.temp = tmpPath;
   pathObj.dest = destination_file;
   pathObj.fileName = fileName;
   return pathObj;
} 

module.exports = function (Mentor) {
  return {
        uploadTaskImage : function(req, res) {
           var form = new multiparty.Form();
           form.parse(req, function (err, fields, files) {
               	var filePath =postTaskImage(req, res, err, fields, files);
                var dir = filePath.dest +'Mentorresume';
                if (!fs.existsSync(dir)) {
                  fs.mkdirSync(dir);
                }
                dir = filePath.dest + 'Mentorresume/' + req.user._id;
                if (!fs.existsSync(dir)) {
                  fs.mkdirSync(dir);
                }
                dir = dir + '/' + filePath.fileName;
                var is = fs.createReadStream(filePath.temp);
                var os = fs.createWriteStream(dir);
                is.pipe(os);
                is.on('end', function() {
                    fs.unlinkSync(filePath.temp);
                });
                filePath.dirPath = '/system/assets/uploads/Mentorresume/'+ req.user._id +'/';
                res.json(filePath.dirPath + filePath.fileName);
           });
        },
        
        /**
         * List of Mentors
         */
        all: function (req, res) {
            /*RoleModel.findOne({'name' : req.query.role}).exec(function (err, role) {
                if (err) {
                    return res.status(400).json({
                        error: 'Cannot list the Roles'
                    });
                }
                UserModel.find({ role: {$in: [role._id]} }).exec(function (err, collection) {
                	if (err) {
                        return res.status(400).json({
                            error: 'Cannot list the Roles'
                        });
                    }
                    
                    res.json(collection);
                });
            });*/
        },
        mentorRequest: function (req, res, next) {
          MentorRequestModel.loadByUserId(req.user._id, function (err, requestStatus) {
                if (err) return next(err);
                if (!requestStatus) return next(new Error('Failed to load requests'));
                res.json(requestStatus);
          });
        },
        

		/**
		 * Load logged in user so as to set isMentor flag as true if user tries to join as mentor
		 */
		user : function(req, res, next, id) {
			UserModel.load(id, function (err, user) {
                if (err) {
                    return next(err);
                }
                if (!user) {
                    return next(new Error('Failed to load user ' + id));
                }
                req.user = user;
                next();
            });
		},
		
		/**
		 * Update logged in user so as to set isMentor flag as true if user tries to join as mentor
		 */
		updateForMentorIfAlreadyLoggedIn : function(req, res) {
			 var user = req.user;
			 user.isMentor = true;
			 if(req.query){
				 user.project = req.query.projectId;
			 }
             user.save(function (err) {
                 if (err) {
                 }
                 res.json(user);
             });
		},
  };
}

