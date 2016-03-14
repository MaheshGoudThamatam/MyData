'use strict';
/* jshint -W098 */
// The Package is past automatically as first parameter

 var hasAuthorization = function (req, res, next) {
    if (!req.user.isAdmin && !req.Jobs.user._id.equals(req.user._id)) {
        return res.status(401).send('User is not authorized');
    }
    next();
};

module.exports = function(Jobs, app, auth, database) {
    var jobslists = require('../controllers/jobs')(Jobs, app);
    app.get('/api/jobs/example/anyone', function(req, res, next) {
        res.send('Anyone can access this');
    });
    app.get('/api/jobs/example/auth', auth.requiresLogin, function(req, res, next) {
        res.send('Only authenticated users can access this');
    });
    app.get('/api/jobs/example/admin', auth.requiresAdmin, function(req, res, next) {
        res.send('Only users with Admin role can access this');
    });
    app.get('/api/jobs/example/render', function(req, res, next) {
        Jobs.render('index', {
            package: 'jobs'
        }, function(err, html) {
            //Rendering a view from the Package server/views
            res.send(html);
        });
    });
    app.route('/api/addjobs').get(jobslists.addjobs);
    app.route('/api/jobs/pagination').get(auth.requiresLogin,hasAuthorization,jobslists.jobListByPagination);
    app.route('/api/jobs').get(auth.requiresLogin,hasAuthorization,jobslists.displayjobs);
    app.route('/api/jobs/:jobId').get(auth.requiresLogin,hasAuthorization,jobslists.singlejobdetail);
    app.route('/api/recommendedjobs/pagination').get(auth.requiresLogin,hasAuthorization,jobslists.recommendedjobListByPagination);
    app.route('/api/recommendedjobs/checked').get(auth.requiresLogin,hasAuthorization,jobslists.listingloginuserskills);
    app.route('/api/matchingjobs/email').get(jobslists.emailtriggerformatchedjobs);
    app.route('/api/forcastingjobs/email').get(jobslists.forecastingjobsemailtrigger);
    app.param('jobId', jobslists.job);
};