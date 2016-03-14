'use strict';
var uuid = require('node-uuid'),
// multiparty = require('multiparty'),
fs = require('fs'),
/* AWS = require('aws-sdk'); */
makeDirectory = require('mkdirp'), gm = require('gm').subClass({
	imageMagick : true
}), path = require('path');

var upload = module.exports = {
	valid : function(req, res, err, fields, files) {
		var fileValidation={};
		var file = files.file[0];
		var contentType = file.headers['content-type'];
		var tmpPath = file.path;
		if (contentType !== 'image/png' && contentType !== 'image/jpeg') {
			fs.unlink(tmpPath);
			fileValidation.errorCode="101";
			fileValidation.errorMessage="Unsupported file type.";
			return fileValidation;
		} else {
			console.log(tmpPath);
			var stats = fs.statSync(tmpPath);
			var fileSizeInBytes = stats["size"];
			console.log("fileSizeInBytes" + fileSizeInBytes);
			// Convert the file size to megabytes (optional)
			var fileSizeInMegabytes = fileSizeInBytes /(1024 * 1024);
			console.log("fileSizeInMegabytes" + fileSizeInMegabytes);
			if (fileSizeInMegabytes > 2) {
				return fileValidation;
			} else {
				fileValidation.errorCode="000";
				console.log("uploaded successfully");
				return fileValidation;
			}
		}
	},
	postImage : function(req, res, err, fields, files) {
		var pathObj = {};
		var file = files.file[0];
		var contentType = file.headers['content-type'];
		var tmpPath = file.path;
		var extIndex = tmpPath.lastIndexOf('.');
		var extension = (extIndex < 0) ? '' : tmpPath.substr(extIndex);
		// uuid is for generating unique filenames.
		var fileName = uuid.v4() + extension;
		var destination_file = path.join(__dirname,
				'/../../public/assets/uploads/');
		// Server side file type checker.
		 /** if (contentType !== 'image/png' && contentType !== 'image/jpeg') {
		 * fs.unlink(tmpPath); return res.status(400).send('Unsupported file
		 * type.'); }
*/		pathObj.temp = tmpPath;
		pathObj.dest = destination_file;
		pathObj.fileName = fileName;
		return pathObj;

	},
	s3Upload : function(basepath, relativePath, fileName) {
		// For dev purposes only
		console.log(basepath);
		AWS.config.update({
			signatureVersion : 'v4',
			region : 'eu-west-1',
			accessKeyId : 'AKIAIDDFCWD2VYZ4UIHQ',
			secretAccessKey : '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'
		});

		// Read in the file, convert it to base64, store to S3
		var fileStream = fs.createReadStream(basepath + fileName);
		fileStream.on('error', function(err) {
			if (err) {
				throw err;
			}
		});
		fileStream.on('open', function() {
			var s3 = new AWS.S3();
			s3.putObject({
				Bucket : 'myiarts-assets',
				Key : relativePath + fileName,
				Body : fileStream,
				ACL : 'public-read'
			}, function(err) {
				if (err) {
					throw err;
				}
				fs.unlink(basepath + fileName);
			});
		});
	},
	createSubFolder : function(dirPath) {
		// console.log("Inside createSubfoldr");
		if (!fs.existsSync(dirPath)) {
			// console.log("Inside createSubfoldr If");
			fs.mkdirSync(dirPath);
		}
	},

	createThumnail : function(basePath, resultBase, subDir, fileName, width,
			height, relativePath, s3) {
		console
				.log("==============================================================");
		// console.log("in upload" + basePath);
		console.log("in upload subdir");
		console.log(subDir);
		console.log(basePath);
		console
				.log("==============================================================");
		var thumbdir = path.join(basePath, subDir, '/');
		this.createSubFolder(thumbdir);
		var file = path.join(basePath, fileName);
		// console.log(file);
		var thumbFile = path.join(thumbdir, fileName);
		console.log(thumbFile);
		console.log(width);
		console.log(height);
		if (height > 0) {
			gm(file).resize(width, height, '!').autoOrient().write(
					thumbFile,
					function(err) {
						console.log("thumbFile : " + thumbFile);
						if (err) {
							console.log("Cannot write file to dir : " + err);
						}
						;
						if (s3) {
							upload.s3Upload(thumbdir, relativePath + subDir
									+ '/', fileName);
						}
					});
		} else {
			gm(file).resize(width).autoOrient().write(
					thumbFile,
					function(err) {
						if (err) {
							console.log("Cannot write file");
							console.log(err);
						}
						;
						if (s3) {
							upload.s3Upload(thumbdir, relativePath + subDir
									+ '/', fileName);
						}

					});
		}

		console.log("relative : " + relativePath + subDir + "/" + fileName);
		return relativePath + subDir + "/" + fileName;
	}
};