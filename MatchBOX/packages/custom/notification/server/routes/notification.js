'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Notification, app, auth, database) {
    var notificationCtrl = require('../controllers/notification')(Notification);
    
    app.route('/api/notifications/add')
        .post(notificationCtrl.create);
    
    app.route('/api/notifications/:userId')
        .get(notificationCtrl.getAllUserNotification);
    
    app.route('/api/notifications/:userId/active')
        .get(notificationCtrl.getActiveUserNotification);

    app.route('/api/notification/:notificationId')
        .get(notificationCtrl.showNotification);

    app.param('userId', notificationCtrl.user);
    app.param('notificationId', notificationCtrl.notification);
};
