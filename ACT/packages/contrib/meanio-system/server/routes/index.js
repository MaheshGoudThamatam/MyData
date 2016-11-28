'use strict';
var mean = require('meanio');
module.exports = function(System, app, database) {
    // Home route
    var index = require('../controllers/index')(System);
    var fs = require('fs'),
        _ = require('lodash');
    var path = require('path');
    var mkdirp = require('mkdirp');
    var mime = require('mime');
    var authentication = function(req, res, next) {
        if (!req.user) {
            return res.status(401).send('User is unauthorized to access this page.');
        } else {
            next();
        }
    };
    app.route('/').get(index.render);
    app.route('/api/aggregatedassets').get(index.aggregatedList);
    app.get('/*', function(req, res, next) {
        res.header('workerID', JSON.stringify(mean.options.workerid));
        next(); // http://expressjs.com/guide.html#passing-route control
    });
    app.get('/api/fileDownload', authentication, function(req, res) {
        var file = path.resolve(req.query.filename);
        var filename = path.basename(file);
        var mimetype = mime.lookup(file);
        res.setHeader('Content-disposition', 'attachment; filename=' + filename);
        res.setHeader('Content-type', mimetype);
        var filestream = fs.readFileSync(file, 'binary');
        res.write(filestream, 'binary');
        res.end();
    });
    app.get('/api/get-public-config', function(req, res) {
        var config = mean.loadConfig();
        return res.send(config.public);
    });
};