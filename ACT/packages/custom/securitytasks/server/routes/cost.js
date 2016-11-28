'use strict';

module.exports = function(Cost, app, auth, database) {

    var costCtrl = require('../controllers/cost')(Cost);

    var authentication = function(req, res, next) {
        if (!req.user) {
            return res.status(401).send('User is unauthorized to access this page.');
        } else {
            next();
        }
    };

    // cost API
    app.route('/api/cost')
        .post(authentication, costCtrl.create)
        .get(authentication, costCtrl.totalCost);

    app.route('/api/cost/:costId')
        .delete(authentication, costCtrl.delete);

    app.param('costId', costCtrl.cost);

};
