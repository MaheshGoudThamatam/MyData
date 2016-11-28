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

module.exports = function(ExternalSecurityTaskCtrl, app, auth, database, System) {

    var ExternalSecurityTaskCtrl = require('../controllers/external_securitytask')(ExternalSecurityTaskCtrl);
    var index = require('../../../../contrib/meanio-system/server/controllers/index')(System);

    app.route('/api/externalSecurityTask/:companyId')
        .post(hasAuthentication, ExternalSecurityTaskCtrl.create);

    app.route('/api/externalSecurityTask/:companyId/:externalsecuritytaskId')
        .put(ExternalSecurityTaskCtrl.update)
        .get(ExternalSecurityTaskCtrl.show);

    app.route('/api/externalSecurityTaskApproval/:companyId/approval')
        .put(ExternalSecurityTaskCtrl.approvalEstimateTask);

    app.route('/api/externalSecurityTaskApproved/:companyId')
        .put(ExternalSecurityTaskCtrl.approvedOrdeclinedTask);
    
    app.route('/api/allExternalSecurityTask')
    .get(hasAuthentication, ExternalSecurityTaskCtrl.all);
    
    app.route('/api/externalSecurityTaskInvoice/attachCostInvoice')
    .post(ExternalSecurityTaskCtrl.attachInvoice);
    
    app.route('/api/allexternaltasks')
    .get(hasAuthentication, ExternalSecurityTaskCtrl.alltask);
    
    app.route('/api/externaltask/fileupload')
    .post(hasAuthentication, ExternalSecurityTaskCtrl.externaltaskUpload);
    
    app.param('externalsecuritytaskId', ExternalSecurityTaskCtrl.externalSecurityTask);


    app.param('companyId', index.initCompanyDbExt);
};
