/*
 * <Author:Akash Gupta>
 * <Date:24-06-2016>
 * <Access Control Routes: Create,Update,Get Single, Get All, Soft Delete>
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

    module.exports = function(AccessControl, app, auth, database) {
        var accessControlCtrl = require('../controllers/accessControl')(AccessControl);
        app.route('/api/building/:buildingId/access')
            .post(authorization,accessControlCtrl.create)
            .get(authorization,accessControlCtrl.all);

        app.route('/api/building/:buildingId/access/:accessId')
            .get(authorization,accessControlCtrl.show)
            .put(authorization,accessControlCtrl.update)
            .delete(authorization,accessControlCtrl.destroy);

        app.route('/api/accesscontrol/attachcontractaccesscontrol')
            .post(authorization,accessControlCtrl.attachcontractaccesscontrol);

        app.route('/api/accesscontrol/attachorientationdrawingsaccesscontrol')
            .post(authorization,accessControlCtrl.attachorientationdrawingsaccesscontrol);

         app.route('/api/accesscontrol/attachusermanualaccesscontrol')
            .post(authorization,accessControlCtrl.attachusermanualaccesscontrol);           

        app.param('buildingId', accessControlCtrl.building);
        app.param('accessId', accessControlCtrl.access);
    };
})();