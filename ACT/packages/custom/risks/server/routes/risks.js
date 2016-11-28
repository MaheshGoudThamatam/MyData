'use strict';

/* JSHint -W098 */
//This Package is passed automatically as first parameter

var authentication = function(req, res, next) {
    if (!req.user) {
        return res.status(401).send("User Is Not Authorized");
    }
    next();
};

module.exports = function(RiskCtrl, app, auth, database) {

    var riskctrl = require('../controllers/risks')(RiskCtrl);

    // APIS
    app.route('/api/risk')
        .post(authentication, riskctrl.create)
        .get(riskctrl.all);

    app.route('/api/risk/:riskId')
        .get(authentication, riskctrl.show)
        .put(authentication, riskctrl.update)
        .delete(authentication, riskctrl.destroy);

    app.route('/api/risks/loadLocations')
        .get(authentication, riskctrl.loadLocations);

    app.route('/api/risks/:locationId/loadBuildings')
        .get(authentication, riskctrl.buildingBasedOnLocation);

    app.route('/api/risks/users')
        .get(authentication, riskctrl.users);

    app.route('/api/risks/fetchLocationsBasedOnUserSelected')
        .get(authentication, riskctrl.fetchLocationsBasedOnUserSelected);

    app.route('/api/risks/fetchUserBasedOnBuildingSelected')
        .get(authentication, riskctrl.fetchUserBasedOnBuildingSelected);    

    app.param('riskId', riskctrl.risk);
    app.param('locationId', riskctrl.location);

};