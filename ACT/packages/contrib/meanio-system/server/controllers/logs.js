var winston = require('winston');
var config = require('meanio').loadConfig();
var mkdirp = require('mkdirp');
var fs = require('fs');
var path = require('path');
var exports = {
    log: function(req, companyname, filename, msg, logobject) {
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        var url = req.method + " " + req.url;
        var logfilename = filename + "." + "info" + ".log";
        var writingdir = path.resolve(config.logpath + '/' + companyname);
        var finalpath = path.resolve(writingdir + '/' + logfilename);
        var logobject = JSON.stringify(logobject);

        if (!fs.existsSync(writingdir)) {
            mkdirp(writingdir, function() {
                var logger = new winston.Logger({
                    levels: {
                        info: 1
                    },
                    transports: [
                        new(winston.transports.File)({
                            filename: finalpath,
                            level: "info"
                        }),
                    ]
                });
                logger.log('info', msg, {
                    "ip": ip,
                    "request": url,
                    "object": logobject
                });
            });
        } else {
            var logger = new winston.Logger({
                levels: {
                    info: 1
                },
                transports: [
                    new(winston.transports.File)({
                        filename: finalpath,
                        level: 'info'
                    }),
                ]
            });
            logger.log('info', msg, {
                "ip": ip,
                "request": url,
                "object": logobject
            });
        }
    },
    error: function(req, companyname, filename, msg, logobject, error) {
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        var url = req.method + " " + req.url;
        var logfilename = filename + "." + "error" + ".log";
        var writingdir = path.resolve(config.logpath + '/' + companyname);
        var finalpath = path.resolve(writingdir + '/' + logfilename);
        var logobject = JSON.stringify(logobject);

        if(typeof error === 'object') {
            error = JSON.stringify(error);
        }

        if (!fs.existsSync(writingdir)) {
            mkdirp(writingdir, function() {
                var logger = new winston.Logger({
                    levels: {
                        error: 1
                    },
                    transports: [
                        new(winston.transports.File)({
                            filename: finalpath,
                            level: "error"
                        }),
                    ]
                });
                logger.log('error', msg, {
                    "ip": ip,
                    "request": url,
                    "object": logobject,
                    "error": error
                });
            });
        } else {
            var logger = new winston.Logger({
                levels: {
                    error: 1
                },
                transports: [
                    new(winston.transports.File)({
                        filename: finalpath,
                        level: 'error'
                    }),
                ]
            });
            logger.log('error', msg, {
                "ip": ip,
                "request": url,
                "object": logobject,
                "error": error
            });
        }
    },
    delta: function(req, companyname, filename, msg, before, after) {
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        var url = req.method + " " + req.url;
        var logfilename = filename + ".delta" + ".log";
        var writingdir = path.resolve(config.logpath + '/' + companyname);
        var finalpath = path.resolve(writingdir + '/' + logfilename);
        var before = JSON.stringify(before);
        var after = JSON.stringify(after);

        if (!fs.existsSync(writingdir)) {
            mkdirp(writingdir, function() {
                var logger = new winston.Logger({
                    levels: {
                        delta: 1
                    },
                    transports: [
                        new(winston.transports.File)({
                            filename: finalpath,
                            level: 'delta'
                        }),
                    ]
                });
                logger.log('delta', msg, {
                    "ip": ip,
                    "request": url,
                    "before": before,
                    "after": after
                });
            });
        } else {
            var logger = new winston.Logger({
                levels: {
                    delta: 1
                },
                transports: [
                    new(winston.transports.File)({
                        filename: finalpath,
                        level: 'delta'
                    }),
                ]
            });
            logger.log('delta', msg, {
                "ip": ip,
                "request": url,
                "before": before,
                "after": after
            });
        }
    }
};
module.exports = exports;