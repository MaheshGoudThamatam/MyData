'use strict';

var hasAuthorization = function(req, res, next) {
    if (!req.user.isAdmin && !req.Batch.user._id.equals(req.user._id)) {
        return res.status(401).send('User is not authorized');
    }
    next();
};

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Batch, app, auth, database) {

    var batchCtrl = require('../controllers/batch')(Batch);


    //Pagination API
    app.route('/api/batchlist/pagination')
        .get(auth.requiresLogin, hasAuthorization, batchCtrl.batchListByPagination);

    app.route('/api/batch')
        .post(auth.requiresLogin, hasAuthorization, batchCtrl.create)
        .get(auth.requiresLogin, hasAuthorization, batchCtrl.all);

    app.route('/api/batch/:batchId')
        .get(auth.requiresLogin, hasAuthorization, batchCtrl.show)
        .put(auth.requiresLogin, hasAuthorization, batchCtrl.update)
        .delete(auth.requiresLogin, hasAuthorization, batchCtrl.destroy);
    app.route('/api/batchs/:batchId')
        .get(batchCtrl.batchSchedules);

    app.route('/api/batchattendance/attendance')
        .post(auth.requiresLogin, hasAuthorization, batchCtrl.saveattendance)
        .get(auth.requiresLogin, hasAuthorization, batchCtrl.checkattendance)
        .put(auth.requiresLogin, hasAuthorization, batchCtrl.updateattendace);

    app.param('courseId', batchCtrl.course);
    app.param('batchId', batchCtrl.batch);
};
