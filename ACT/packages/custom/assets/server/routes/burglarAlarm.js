/*
 * <Author:Akash Gupta>
 * <Date:27-06-2016>
 * <Burglar Alarm Routes: Create,Update,Get Single, Get All, Soft Delete>
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

    module.exports = function(BurglarAlarm, app, auth, database) {
        var burglaralarmCtrl = require('../controllers/burglarAlarm')(BurglarAlarm);
        app.route('/api/building/:buildingId/burglarAlarm')
            .post(authorization,burglaralarmCtrl.create)
            .get(authorization,burglaralarmCtrl.all);

        app.route('/api/building/:buildingId/burglarAlarm/:burglarAlarmId')
            .get(authorization,burglaralarmCtrl.show)
            .put(authorization,burglaralarmCtrl.update)
            .delete(authorization,burglaralarmCtrl.destroy);

        app.route('/api/burglaralarm/attachorientationdrawingsalarm')
            .post(authorization,burglaralarmCtrl.attachorientationdrawingsalarm);

        app.route('/api/burglaralarm/attachcontractalarm')
            .post(authorization,burglaralarmCtrl.attachcontractalarm);

        app.route('/api/burglaralarm/attachusermanualalarm')
            .post(authorization,burglaralarmCtrl.attachusermanualalarm);         
 

        app.param('buildingId', burglaralarmCtrl.building);
        app.param('burglarAlarmId', burglaralarmCtrl.alarm);
    };
})();