'use strict';
/*
 * <Author: Abha Singh>
 * <Date:   11-07-2016>
 * <Routes: Create(perform), GetSingle>
 */
/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(AuditPerformCtrl, app, auth, database) {

    var AuditPerformCtrl = require('../controllers/audit-perform')(AuditPerformCtrl);

    var authentication = function(req, res, next) {
        if (!req.user) {
            return res.status(401).send('User is unauthorized to access this page.');
        } else {
            next();
        }
    };

    // API for Audit-Perform
    app.route('/api/audit/:auditId/perform')
       .post(authentication, AuditPerformCtrl.performAudit)
       .get(authentication, AuditPerformCtrl.loadQuestions)
       .get(authentication, AuditPerformCtrl.loadTotalQuestions);
    
    app.route('/api/auditsperformed/:performId')
       //.get(authentication, AuditPerformCtrl.loadQuestions)
       .get(authentication, AuditPerformCtrl.performedAudit);

    app.route('/api/createtask')
       .post(authentication, AuditPerformCtrl.createTask);

    app.route('/api/performauditSecurity/fileupload')
       .post(authentication, AuditPerformCtrl.auditSecurityTaskUpload);
    
    /*app.route('/api/:auditId/performedAudits')
    .get(authentication, AuditPerformCtrl.loadPerformedAudits);*/
    
    app.param('auditId', AuditPerformCtrl.audit);
    app.param('performId', AuditPerformCtrl.auditPerform);
};