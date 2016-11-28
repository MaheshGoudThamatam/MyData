'use strict';
var fs = require('fs'),
    _ = require('lodash');
var async = require('async');
var path = require('path');
var config = require('meanio').loadConfig();
var mkdirp = require('mkdirp');
var mime = require('mime');

module.exports = {
    uploadFile: function(files, companyDbName, filepath, filename, callback) {
        async.waterfall([function(done) {
                fs.readFile(files.file[0].path, function(err, data) {
                    var newPath =path.resolve(config.uploadPath + '/' + companyDbName + filepath + filename);
                    var writingdir = path.resolve(config.uploadPath + '/' + companyDbName + filepath);
                    if (!fs.existsSync(writingdir)) {
                        mkdirp(writingdir, function() {
                            fs.writeFile(newPath, data, function(err) {
                                done(null, newPath);
                            });
                        });
                    } else {
                        fs.writeFile(newPath, data, function(err) {
                            done(null, newPath);
                        });
                    }
                });
        }], function(err, result) {
            if (err) {
                //TODO: Send meaningful errors!!
                callback(400);
            } else {
                callback(result);
            }
        });
    }
}