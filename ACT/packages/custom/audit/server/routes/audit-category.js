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

module.exports = function(AuditCategoryCtrl, app, auth, database) {

    var AuditCateCtrl = require('../controllers/audit-category')(AuditCategoryCtrl);

    /**
     * APIs for Document Category.
     */
    app.route('/api/auditCategory')
        .post(hasAuthentication, AuditCateCtrl.create)
        .get(hasAuthentication, AuditCateCtrl.all);

    app.route('/api/auditCategory/:auditCategoryId')
        .get(hasAuthentication, AuditCateCtrl.show)
        .put(hasAuthentication, AuditCateCtrl.update)
        .delete(hasAuthentication, AuditCateCtrl.destroy);
    
    app.route('/api/fetchAuditQuestions/:auditCategoryId')
       .get(hasAuthentication, AuditCateCtrl.auditQuestionsBasedOnAuditCategory);

    app.route('/api/auditCategory/:auditCategoryId/bulkUpload')
       .post(hasAuthentication, AuditCateCtrl.auditCategoryBulkUpload); 

    app.route('/api/auditBulkUpload/getTemplate')
       .get(hasAuthentication, AuditCateCtrl.auditBulkUploadTemplate);   

    app.param('auditCategoryId', AuditCateCtrl.auditCategory);
};