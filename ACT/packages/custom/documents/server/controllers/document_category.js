'use strict';
/** Name : Document_Category Controller
 * Description : In this controller Document Categories are created by the super admin.
 * @ <author> Anto Steffi 
 * @ <date> 22-June-2016
 * @ METHODS: create, get, update, soft delete
 */

/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    logger = require('../../../../contrib/meanio-system/server/controllers/logs.js'),
    _ = require('lodash');

module.exports = function(DocumentCategoryCtrl) {
    return {
        /**
         * Loads the Document Categories based on id
         */
        documentCategory: function(req, res, next, id) {
            require('../models/document_category')(req.companyDb);
            var DocumentCategoryModel = req.companyDb.model('DocumentCategory');
            DocumentCategoryModel.load(id, function(err, documentCategory) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "document_category", "Failed to fetch document category", {
                        _id: id
                    }, err);
                    return next(err);
                }
                if (!documentCategory) {
                    logger.error(req, req.user.company.company_name, "document_category", "Failed to load document category", {
                        _id: id
                    }, err);
                    return next(new Error('Failed to load DocumentCategory ' + id));
                }
                req.documentCategory = documentCategory;
                next();
            });
        },

        /**
         * Create a new Document Category
         */
        create: function(req, res) {
            require('../models/document_category')(req.companyDb);
            var DocumentCategoryModel = req.companyDb.model('DocumentCategory');
            req.body.createdBy = req.user._id;
            var documentCategory = new DocumentCategoryModel(req.body);
            req.assert('name', 'You must enter Document Category name').notEmpty();
            req.assert('description', 'You must enter description').notEmpty();

            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            documentCategory.save(function(err) {
                if (err) {
                    switch (err.code) {
                        case 11000:
                        case 11001:
                            return res.status(400).json([{
                                msg: ' Name already exists',
                                param: 'name'
                            }]);
                            break;
                        default:
                            var modelErrors = [];
                            if (err.errors) {
                                for (var x in err.errors) {
                                    modelErrors.push({
                                        param: x,
                                        msg: err.errors[x].message,
                                        value: err.errors[x].value
                                    });
                                }
                                logger.error(req, req.user.company.company_name, "document_category", "Failed to create document category", documentCategory, err);
                                return res.status(400).json(modelErrors);
                            }
                    }
                    logger.error(req, req.user.company.company_name, "document_category", "Failed to create document category", documentCategory, err);
                    return res.status(400);
                } else {
                    logger.log(req, req.user.company.company_name, "document_category", "document_category created successfully", documentCategory);
                    return res.json(documentCategory);
                }
            });
        },

        /**
         * Shows all the Document Categories
         */
        all: function(req, res) {
            require('../models/document_category')(req.companyDb);
            var DocumentCategoryModel = req.companyDb.model('DocumentCategory');
            DocumentCategoryModel.find().populate('company').exec(function(err, documentCategory) {
                if (err) {
                    return res.status(400).json({
                        error: 'Cannot list the Document Categories'
                    });
                }
                return res.json(documentCategory);
            });
        },

        /**
         * Shows the single Document Category
         */
        show: function(req, res) {
            require('../models/document_category')(req.companyDb);
            var DocumentCategoryModel = req.companyDb.model('DocumentCategory');
            return res.json(req.documentCategory);
        },

        /**
         * Updates the edited Document Category
         */
        update: function(req, res) {
            require('../models/document_category')(req.companyDb);
            var DocumentCategoryModel = req.companyDb.model('DocumentCategory');
            req.body.updatedBy = req.user._id;
            var document_category_before = req.documentCategory.toObject();
            var documentCategory = req.documentCategory;
            documentCategory = _.extend(documentCategory, req.body);
            req.assert('name', 'You must enter Document Category name').notEmpty();
            req.assert('description', 'You must enter description').notEmpty();

            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            documentCategory.save(function(err) {
                if (err) {
                    switch (err.code) {
                        case 11000:
                        case 11001:
                            return res.status(400).json([{
                                msg: ' Name already exists',
                                param: 'name'
                            }]);
                            break;
                        default:
                            var modelErrors = [];
                            if (err.errors) {
                                for (var x in err.errors) {
                                    modelErrors.push({
                                        param: x,
                                        msg: err.errors[x].message,
                                        value: err.errors[x].value
                                    });
                                }
                                logger.error(req, req.user.company.company_name, "document_category", "Failed to update document category", documentCategory, err);
                                return res.status(400).json(modelErrors);
                            }
                    }
                    logger.error(req, req.user.company.company_name, "document_category", "Failed to update document category", documentCategory, err);
                    return res.status(400);
                } else {
                    logger.delta(req, req.user.company.company_name, "document_category", "document category updated successfully", document_category_before, documentCategory);
                    return res.json(documentCategory);
                }
            });
        },

        /**
         * Delete a Document Category
         */
        destroy: function(req, res) {
            require('../models/document_category')(req.companyDb);
            var DocumentCategoryModel = req.companyDb.model('DocumentCategory');
            var documentCategory = req.documentCategory;
            documentCategory.remove(function(err) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "document_category", "Failed to delete document category", documentCategory, err);
                    return res.status(400).json({
                        error: 'Cannot delete the Document Category'
                    });
                } else {
                    logger.log(req, req.user.company.company_name, "document_category", "document category deleted successfully", documentCategory);
                    return res.json(documentCategory);
                }
            });
        }
    }
};