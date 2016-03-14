'use strict';
var uuid = require('node-uuid'), multiparty = require('multiparty'), fs = require('fs');

var mongoose = require('mongoose'), UserModel = mongoose.model('User'), _ = require('lodash');
var uploadUtil = require('../../../../core/system/server/controllers/upload.js');
// var makeDirectory = require('mkdirp');//

var postProfileImage = function(req, res, err, fields, files) {
	var pathObj = {};
	var file = files.file[0];
	var contentType = file.headers['content-type'];
	var tmpPath = file.path;
	var extIndex = tmpPath.lastIndexOf('.');
	var extension = (extIndex < 0) ? '' : tmpPath.substr(extIndex);

	// uuid is for generating unique filenames.it
	var fileName = uuid.v4() + extension;

	var destination_file = __dirname
			+ '/../../../../core/system/public/assets/uploads/';

	// Server side file type checker.//
	/*
	 * if (contentType !== 'image/png' && contentType !== 'image/jpeg') {
	 * fs.unlink(tmpPath); return res.status(400).send('Unsupported file
	 * type.'); }
	 */

	pathObj.temp = tmpPath;
	pathObj.dest = destination_file;
	pathObj.fileName = fileName;
	return pathObj;
}
var postResume = function(req, res, err, fields, files) {
	var pathObj = {};
	var file = files.file[0];
	var contentType = file.headers['content-type'];
	var tmpPath = file.path;
	var extIndex = tmpPath.lastIndexOf('.');
	var extension = (extIndex < 0) ? '' : tmpPath.substr(extIndex);

	// uuid is for generating unique filenames.it//
	var fileName = uuid.v4() + extension;

	var destination_file = __dirname
			+ '/../../../../core/system/public/assets/uploads/';
	console.log(destination_file);

	// Server side file type checker.//
	/*
	 * if (contentType !== 'file/pdf' && contentType !== 'file/docx') {
	 * fs.unlink(tmpPath); return res.status(400).send('Unsupported file
	 * type.'); }
	 */

	pathObj.temp = tmpPath;
	pathObj.dest = destination_file;
	pathObj.fileName = fileName;
	return pathObj;
}

module.exports = function(Profile) {

	return {

		uploadProfilePic : function(req, res) {

			var form = new multiparty.Form();
			form.parse(req, function(err, fields, files) {
				var fileValidation= uploadUtil.valid(req, res, err, fields, files);
				if(fileValidation.errorCode != "000"){
					return res.status(400).json(fileValidation);
				}
				var filePath =uploadUtil.postImage(req, res, err, fields, files);
				
				/*uploadUtil.createSubFolder(path.dest +'User/');
				var dir = filePath.dest + 'User/';
                var relativePath= 'User/' + req.user._id + "/";
               // dir = filePath.dest + relativePath;
                uploadUtil.createSubFolder(dir);
                dir = filePath.dest + relativePath;
                var filedir = dir + filePath.fileName;
                var dirPath='/system/assets/uploads/' + req.user._id;
                var result={};
                
                */
			/*	if (!fs.existsSync(dir)) {
					fs.mkdirSync(dir);
				}


				dir = filePath.dest + 'User/'+ req.user._id;

				if (!fs.existsSync(dir)) {
					fs.mkdirSync(dir);
				}
*/				/*dir = dir + '/' + filePath.fileName;
				var is = fs.createReadStream(filePath.temp);
				var os = fs.createWriteStream(filedir);
				*/
				uploadUtil.createSubFolder(filePath.dest +'User/');
                var dir = filePath.dest +'User/'+ req.user._id + '/';
                uploadUtil.createSubFolder(dir);
                var relativePath= 'User/' + req.user._id + "/";
                dir = filePath.dest + relativePath;
                uploadUtil.createSubFolder(dir);
                var filedir = dir + filePath.fileName;
                var dirPath='/system/assets/uploads/' + req.user._id;
                var result={};
                //result.fileName=path.dirPath + path.fileName;
                var is = fs.createReadStream(filePath.temp);
                var os = fs.createWriteStream(filedir);
				is.pipe(os);
				is.on('end', function() {
					fs.unlinkSync(filePath.temp);
				});

				filePath.dirPath = '/system/assets/uploads/User/'+ req.user._id +'/';

				if (req.user) {
                    UserModel.findOne({
                        _id: req.user._id
                    }).exec(function (err, user) {
                        if (err) {
                            return res.json(err);
                        }
                        if (!user) {
                            return res.json(new Error('Failed to load User ' + req.user._id));
                        }
                      /*  var stats = fs.statSync(relativePath);
            			var fileSizeInBytes = stats["size"];
            			// Convert the file size to megabytes (optional)
            			var fileSizeInMegabytes = fileSizeInBytes / 1024;
            			if (fileSizeInMegabytes > 2) {
            				fs.unlink(relativePath);
            				return res.status(400).send('Unsupported file size.');
            			} else {
            			}*/

                        _.set(user, 'profilePicture',filePath.dirPath + filePath.fileName);
                        _.set(user, 'thumbprofilePicture', uploadUtil.createThumnail(dir,false,'thumb',filePath.fileName ,50,50,relativePath,false));
                        _.set(user, 'thumb150profilePicture', uploadUtil.createThumnail(dir,false,'thumb150',filePath.fileName,150,150,relativePath,false));
                        user.save(function (err) {
                            if (err) {
                                return res.status(500).json({
                                    error: 'Cannot update the profile picture'
                                });
                            }
                        });
                        res.json(filePath.dirPath + filePath.fileName);
                        
                        //res.status(200);
                    });
                } else {
                    return res.status(401).send('UnAuthourized Access');
                }

		});

		},
		profile : function(req, res, next, id) {
			UserModel.load(id, function(err, user) {
				if (err) {
					return next(err);
				}
				if (!user) {
					return next(new Error('Failed to load Profile ' + id));
				}
				req.profile = user;
				next();
			});
		},
		
		uploadResume : function(req, res) {

			var form = new multiparty.Form();
			form.parse(req, function(err, fields, files) {
				var filePath = postResume(req, res, err, fields, files);
				var dir = filePath.dest + 'Resume/';
				if (!fs.existsSync(dir)) {
					fs.mkdirSync(dir);
				}

				dir = filePath.dest + 'Resume/'+ req.user._id;
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
				filePath.dirPath = '/system/assets/uploads/Resume/'+ req.user._id +'/';
				if (req.user) {
                    UserModel.findOne({
                        _id: req.user._id
                    }).exec(function (err, user) {
                        if (err) {
                            return res.json(err);
                        }
                        if (!user) {
                            return res.json(new Error('Failed to load User ' + req.user._id));
                        }
                        _.set(user, 'Resume',filePath.dirPath + filePath.fileName);
                         user.save(function (err) {
                            if (err) {
                                return res.status(500).json({
                                    error: 'Cannot update the profile picture'
                                });
                            }
                        });
                        res.json(filePath.dirPath + filePath.fileName);
                        //res.status(200);
                    });
                } else {
                    return res.status(401).send('UnAuthourized Access');
                }



			});

		},
		resume : function(req, res, next, id) {
			UserModel.load(id, function(err, user) {
				if (err) {
					return next(err);
				}
				if (!user) {
					return next(new Error('Failed to load Resume ' + id));
				}
				req.resume = user;
				next();
			});
		}
	};

}