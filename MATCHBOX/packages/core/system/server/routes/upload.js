'use strict';

var multiparty = require('connect-multiparty'), 
	multipartyMiddleWare = multiparty();
var fs = require('fs');

var cloudinary = require('cloudinary');

//added cloudinary variable to upload images
function cloudinary() {
	// configuration of the cloudinary
	if (process.env.NODE_ENV == 'development') {
		cloudinary.config({
		    cloud_name : 'mymatchbox',
		    api_key : '421454936319151',
		    api_secret : 'eEOnZ1qr0eG1ChLy3vc5MmxMFjE'
		});
	} else {
		cloudinary.config({
		    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
		    api_key : process.env.CLOUDINARY_API_KEY,
		    api_secret : process.env.CLOUDINARY_API_SECRET
		});
	}
}

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(util, app, auth, database) {
	app.use(multipartyMiddleWare);

	app.post('/api/config/:userId/cupload', function(req, res) {
		var image = req.files.file;

		if (!image) {
			res.json({
			    code : '2001',
			    msg : 'No file selected'
			});
		}
		
		console.log(image);
		var tmpPath = image.path;
		var extIndex = tmpPath.lastIndexOf('.');
		var extension = (extIndex < 0) ? '' : tmpPath.substr(extIndex);
		var stats = fs.statSync(tmpPath);
		var fileSizeInBytes = stats["size"];
		
		// Convert the file size to megabytes (optional)
		var fileSizeInMegabytes = fileSizeInBytes /(1024 * 1024);
		if (fileSizeInMegabytes > 10) {
			return fileValidation;
		}
		extension = extension.toLowerCase();
		if (extension === '.jpg' || extension === '.jpeg' || extension === '.png') {
			cloudinary.config({
				cloud_name : 'mymatchbox',
			    api_key : '421454936319151',
			    api_secret : 'eEOnZ1qr0eG1ChLy3vc5MmxMFjE'
			});
								
			cloudinary.uploader.upload(image.path, function(result) {
				res.json(result);
				console.log(result);
				//config.updatePath (req, res, result.url, 'image' ); 
			}/*, {
				public_id : req.params.userId
			}*/)
			console.log(image);
		} else {
			res.json({
			    code : '2002',
			    msg : 'Unsupported image type.'
			})
		}
	});

};
