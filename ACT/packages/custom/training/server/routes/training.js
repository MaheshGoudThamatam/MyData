/**
 * <Author:Akash Gupta>
 * <Date:22-06-2016>
 * <Routes: Create, Update, GetAll, GetSingle, Hard Delete  of Training>
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

    module.exports = function(Training, app, auth, database) {
        var trainingCtrl = require('../controllers/training')(Training);
        app.route('/api/training')
            .post(authorization,trainingCtrl.create)
            .get(authorization,trainingCtrl.all);

        app.route('/api/fetchCompanyUser')
             .get(authorization,trainingCtrl.allUser);

        app.route('/api/training/:trainingId')
            .get(authorization,trainingCtrl.show)
            .put(authorization,trainingCtrl.update)
            .delete(authorization,trainingCtrl.destroy);
        app.route('/api/dashboardUser/training')
            .get(authorization,trainingCtrl.getallGroupTrainings)

        app.param('trainingId', trainingCtrl.training);
    };
})();
