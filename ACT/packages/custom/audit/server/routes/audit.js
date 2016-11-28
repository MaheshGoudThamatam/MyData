'use strict';

/* JSHint -W098 */
//This Package is passed automatically as first parameter

/**
 * Checks the authentication for user.
 */

var hasAuthentication = function(req, res, next) {
    if (!req.user) {
        return res.status(401).send("User Is Not Authorized");
    }
    next();
};

module.exports = function(AuditCtrl, app, auth, database) {

    var AuditCtrl = require('../controllers/audit')(AuditCtrl);
 
    /**
     *API to load user buildings 
     */
     app.route('/api/userbuildings')
       .get(hasAuthentication, AuditCtrl.userBuilding);
    
    /**
     * API to load user locations
     */
     app.route('/api/userlocations')
        .get(hasAuthentication, AuditCtrl.userLocation);
    
    /**
     * API for load users for that building
     */
     app.route('/api/fetchUsers')
        .get(hasAuthentication, AuditCtrl.loadUsers);
     
     /**
      * API for load security manager
      */
      app.route('/api/fetchsecuritymanager')
         .get(hasAuthentication, AuditCtrl.loadSecuritymanager);
    
    /**
     * APIs for Audit.
     */
    app.route('/api/audit')
        .post(hasAuthentication, AuditCtrl.create)
        .get(hasAuthentication, AuditCtrl.all);

    app.route('/api/audit/:auditId')
        .get(hasAuthentication, AuditCtrl.show)
        .put(hasAuthentication, AuditCtrl.update)
        .delete(hasAuthentication, AuditCtrl.destroy);

     app.route('/api/audits/auditPercentage')
        .post(hasAuthentication, AuditCtrl.allAuditsPercentge)
        
        app.route('/api/performedAudits')
        .get(hasAuthentication, AuditCtrl.allPerformedAudits)

    app.param('auditId', AuditCtrl.audit);
};