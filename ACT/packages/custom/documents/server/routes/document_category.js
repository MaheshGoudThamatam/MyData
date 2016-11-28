'use strict';

/* JSHint -W098 */

/**
 * Checks the authentication for user.
 */

var hasAuthentication = function(req, res, next) {
    if (!req.user) {
        return res.status(401).send("User Is Not Authorized");
    }
    next();
};

module.exports = function(DocumentCategoryCtrl, app, auth, database) {

    var DocCateCtrl = require('../controllers/document_category')(DocumentCategoryCtrl);

    /**
     * APIs for Document Category.
     */
    app.route('/api/documentCategory')
        .post(hasAuthentication, DocCateCtrl.create)
        .get(hasAuthentication, DocCateCtrl.all);

    app.route('/api/documentCategory/:documentCategoryId')
        .get(hasAuthentication, DocCateCtrl.show)
        .put(hasAuthentication, DocCateCtrl.update)
        .delete(hasAuthentication, DocCateCtrl.destroy);

    app.param('documentCategoryId', DocCateCtrl.documentCategory);
};