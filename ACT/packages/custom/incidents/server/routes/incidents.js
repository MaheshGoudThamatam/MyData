(function() {
    'use strict';

    /* jshint -W098 */
    // The Package is past automatically as first parameter
    module.exports = function(Incidents, app, auth, database, circles,System) {
            var incidenttaskctrl = require('../controllers/incident')(Incidents);
            var index = require('../../../../contrib/meanio-system/server/controllers/index')(System);
            app.route('/api/incident/:companyId')
                .post(incidenttaskctrl.create)
                .get(incidenttaskctrl.all);
            app.route('/api/incidentphoto/upload')
                .post(incidenttaskctrl.attachIncidentPhoto);
            app.route('/api/incidents/companyBuildings/:companyId')
                .get(incidenttaskctrl.companyLocationAndBuilding);
            app.route('/api/buildings/location/:companyId')
                .get(incidenttaskctrl.buildingsonLocation);
            app.route('/api/incidenttype/dashboardresult')
                .post(incidenttaskctrl.getallGroupedIncidents);
        app.param('companyId', index.initCompanyDbExt);
        app.param('companyId', incidenttaskctrl.initCompany);
    };
})();
