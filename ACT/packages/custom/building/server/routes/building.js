/*
 * <Author:Akash Gupta>
 * <Date:22-06-2016>
 * <Routes: Create, Update, GetAll, GetSingle, Soft Delete for Buildings>
 */
(function() {
    'use strict';

    /* jshint -W098 */
    var authorization = function(req, res, next) {
        if (!req.user) {
            return res.status(401).send("Unauthorised");
        }
        next();
    }

    module.exports = function(Building, app, auth, database) {
        var buildingCtrl = require('../controllers/building')(Building);
        app.route('/api/building')
            .post(authorization, buildingCtrl.create)
            .get(authorization, buildingCtrl.all);

        app.route('/api/building/:buildingId')
            .get(authorization, buildingCtrl.show)
            .put(authorization, buildingCtrl.update)
            .delete(authorization, buildingCtrl.destroy);

        app.route('/api/locations/filter')
            .get(buildingCtrl.userLocation);

        app.param('buildingId', buildingCtrl.building);

    };
})();