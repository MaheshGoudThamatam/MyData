(function() {
    'use strict';

    /* jshint -W098 */
    // The Package is past automatically as first parameter
    module.exports = function(Socket, app, auth, database, circles, io) {

        var requiresAdmin = circles.controller.hasCircle('admin');
        var requiresLogin = circles.controller.hasCircle('authenticated');

        app.get('/api/socket/example/anyone', function(req, res) {
            res.send('Anyone can access this');
        });

        app.get('/api/socket/example/auth', requiresLogin, function(req, res) {
            res.send('Only authenticated users can access this');
        });

        app.get('/api/socket/example/admin', requiresAdmin, function(req, res) {
            res.send('Only users with Admin role can access this');
        });

        app.get('/api/socket/example/render', function(req, res) {
            Socket.render('index', {
                package: 'socket'
            }, function(err, html) {
                //Rendering a view from the Package server/views
                res.send(html);
            });
        });
    };
})();
