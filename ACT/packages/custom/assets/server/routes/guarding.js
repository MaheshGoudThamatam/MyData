/*
 * <Author:Akash Gupta>
 * <Date:27-06-2016>
 * <Guarding Routes: Create,Update,Get Single, Get All, Soft Delete>
 */

(function() {
    'use strict';

    /* jshint -W098 */
    var authorization = function(req,res,next){
        if (!req.user) {
            return res.status(401).send("Unauthorised");
        }
        next();
    }

    module.exports = function(Guarding, app, auth, database) {
        var guardingCtrl = require('../controllers/guarding')(Guarding);
        app.route('/api/building/:buildingId/guarding')
            .post(authorization,guardingCtrl.create)
            .get(authorization,guardingCtrl.all);

        app.route('/api/building/:buildingId/guarding/:guardingId')
            .get(authorization,guardingCtrl.show)
            .put(authorization,guardingCtrl.update)
            .delete(authorization,guardingCtrl.destroy);

        app.route('/api/guarding/attachcontractguarding')
            .post(authorization,guardingCtrl.attachcontractguarding);

        app.route('/api/guarding/attachbuildingmanualguarding')
            .post(authorization,guardingCtrl.attachbuildingmanualguarding);    
    

        app.param('buildingId', guardingCtrl.building);    
        app.param('guardingId', guardingCtrl.guarding);
    };
})();