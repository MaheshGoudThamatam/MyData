/*
 * <Author:Akash Gupta>
 * <Date:24-06-2016>
 * <Camera System Routes: Create,Update,Get Single, Get All, Soft Delete>
 */

(function() {
    'use strict';

    /* jshint -W098 */
    // The Package is past automatically as first parameter
    var authorization = function(req,res,next){
        if (!req.user) {
            return res.status(401).send("Unauthorised");
        }
        next();
    }

    module.exports = function(CameraSystem, app, auth, database) {
        var cameraSystemCtrl = require('../controllers/cameraSystem')(CameraSystem);
        app.route('/api/building/:buildingId/camera')
            .post(authorization,cameraSystemCtrl.create)
            .get(authorization,cameraSystemCtrl.all);

        app.route('/api/building/:buildingId/camera/:cameraId')
            .get(authorization,cameraSystemCtrl.show)
            .put(authorization,cameraSystemCtrl.update)
            .delete(authorization,cameraSystemCtrl.destroy);

         app.route('/api/camerasystem/fileupload')
            .post(authorization,cameraSystemCtrl.fileupload);

         app.route('/api/camerasystem/attachdocument')
            .post(authorization,cameraSystemCtrl.attachdocument);
            
         app.route('/api/camerasystem/attachcontract')
            .post(authorization,cameraSystemCtrl.attachcontract); 

         app.route('/api/camerasystem/attachorientationdrawingscamera')
            .post(authorization,cameraSystemCtrl.attachorientationdrawingscamera); 
            
         app.route('/api/camerasystem/attachcameradocumentation')
            .post(authorization,cameraSystemCtrl.attachcameradocumentation);            
  
        app.param('buildingId', cameraSystemCtrl.building)
        app.param('cameraId', cameraSystemCtrl.camera);
    };
})();