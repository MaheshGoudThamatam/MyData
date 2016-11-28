'use strict';
/*
 * <Author: Mahesh>
 * <Date:22-07-2016>
 * <Routes: Create, Update, GetAll, GetSingle, Soft Delete for Security task & subtask>
 */

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Securitytask, app, auth, database) {
    var config = require('../../../../custom/actsec/server/config/config.js');
    var subtaskCtrl = require('../controllers/subtask')(Securitytask);
    var securityTaskCtrl = require('../controllers/securityTask')(Securitytask);

    var setRoleObject = function(req, res, next) {
        req.feature = config.features.SECURITY_TASK;
        next();
    };

    app.route('/api/securityTask')
        .post(auth.checkLogin,setRoleObject,auth.create, securityTaskCtrl.create)
        .get(auth.checkLogin,setRoleObject,  auth.read, securityTaskCtrl.all);

    app.route('/api/securityTask/:securityTaskId')
        .get(auth.checkLogin,setRoleObject, auth.read, securityTaskCtrl.show)
        .put(auth.checkLogin,setRoleObject,auth.update, securityTaskCtrl.update);

    app.route('/api/companyUser/building/:buildingId')
        .get(auth.checkLogin,setRoleObject, auth.read, securityTaskCtrl.user);
    
    app.route('/api/securityTasks/budget')
         .get(auth.checkLogin,setRoleObject,  auth.read, securityTaskCtrl.budget);

    app.route('/api/securityTask/attachCostInvoice')
            .post(auth.checkLogin, securityTaskCtrl.attachInvoice);
    app.param('securityTaskId', securityTaskCtrl.securityTask);
            
    // SubTask API
    app.route('/api/subtasks')
        .post(setRoleObject, auth.checkLogin, auth.create, subtaskCtrl.create);

    app.route('/api/subtasks/:subtaskId')
        .put(setRoleObject, auth.checkLogin, auth.update, subtaskCtrl.update)
        .delete(setRoleObject, auth.checkLogin, auth.delete, subtaskCtrl.destroy);

    app.route('/api/securitysubtasks/:securitytaskId')
        .get(setRoleObject, auth.checkLogin, auth.read,  subtaskCtrl.all);

    app.route('/api/buildings/:buildingId/risk')
        .get(setRoleObject, auth.checkLogin, auth.read,  securityTaskCtrl.riskBasedonLocation);

    app.route('/api/dashboard/securitytask')
        .post(securityTaskCtrl.getallGroupedSecurityTasks);
    
    app.route('/api/allSecurityTask')
       .get(auth.checkLogin,setRoleObject,  auth.read, securityTaskCtrl.allSecurityTasks);

    app.param('securityTaskId', securityTaskCtrl.securityTask);
    app.param('subtaskId', subtaskCtrl.subtask);
};