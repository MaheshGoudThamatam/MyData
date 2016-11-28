'use strict';

module.exports = function(LogHour, app, auth, database) {

    var logHourCtrl = require('../controllers/log_hour')(LogHour);

    var authentication = function(req, res, next) {
        if (!req.user) {
            return res.status(401).send('User is unauthorized to access this page.');
        } else {
            next();
        }
    };

    // LogHour API
    app.route('/api/loghour')
        .post(authentication, logHourCtrl.create)
        .get(authentication, logHourCtrl.totalTime);

    app.route('/api/loghour/:loghourId')
        .delete(authentication, logHourCtrl.delete);

    app.route('/api/securitytask/:securitytaskId/loghour')
        .get(authentication, logHourCtrl.getAll);

    app.param('loghourId', logHourCtrl.logHour);
    app.param('securitytaskId', logHourCtrl.securityTask);

};
