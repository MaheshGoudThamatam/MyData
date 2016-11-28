(function() {
    'use strict';

    /* jshint -W098 */
    // The Package is past automatically as first parameter
    module.exports = function(actsec, app, auth, database) {

        var notifCtrl = require('../controllers/notification')(actsec);

        app.route('/api/notifications')
            .get(notifCtrl.all);
            
        app.route('/api/fetchallnotifications')
           .get(notifCtrl.allNotify);

        app.route('/api/notifications/read/:notifId')
            .get(notifCtrl.notifyRead);

        app.route('/api/notifications/readAll')
            .get(notifCtrl.notifyReadAll);

        app.param('notifId', notifCtrl.notif);
    };
})();