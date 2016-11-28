(function() {
    'use strict';

    /* jshint -W098 */
    // The Package is past automatically as first parameter
    module.exports = function(IncidentTypeCtrl, app, auth, database, circles,System) {
            var incidenttypectrl = require('../controllers/incidenttype')(IncidentTypeCtrl);
            app.route('/api/incidenttype')
                .get(incidenttypectrl.all);
            app.route('/api/incidenttype/:incidenttypeId')
                .get(incidenttypectrl.show);
           

            app.param('incidenttypeId', incidenttypectrl.incidenttype);
    };
})();
