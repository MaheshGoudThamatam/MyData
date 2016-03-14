'use strict';

var mean = require('meanio');

module.exports = function(System, app, auth, database) {

    app.route('/api/admin/menu/:name')
        .get(function(req, res) {
            res.json([]);
        });
};
