'use strict';
/*
 * <Author: Abha Singh>
 * <Date:22-06-2016>
 * <Function: Create, Update, GetAll, GetSingle, Soft Delete for Document>
 * @param: document
 */

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    fs = require('fs'),
    uuid = require('node-uuid'),
    multiparty = require('multiparty'),
    upload = require('../../../../contrib/meanio-system/server/services/bulkUpload.js'),
    logger = require('../../../../contrib/meanio-system/server/controllers/logs.js'),
    _ = require('lodash');

module.exports = function(Document) {
    return {
        /**
         * Upload document 
         */
        uploadDocumentFile: function(req, res) {
            var form = new multiparty.Form();
            form.parse(req, function(err, fields, files) {
                if (files.file[0].originalFilename.split('.').pop() !== 'pdf' && files.file[0].originalFilename.split('.').pop() !== 'txt') {
                    return res.status(400).json({
                        'Error': 'File Format Not Supported.'
                    });
                } else {
                    upload.uploadFile(files, req.user.company.database, "/documentUpload/", files.file[0].originalFilename, function(filepath) {
                        return res.send(filepath);
                    });
                }
            });
        },

        /**
         * Find document by id
         */
        document: function(req, res, next, id) {
            require('../models/document')(req.companyDb);
            var DocumentModel = req.companyDb.model('Document');
            DocumentModel.load(id, function(err, document) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "document", "Failed to fetch document", {
                        _id: id
                    }, err);
                    return next(err);
                }
                if (!document) {
                    logger.error(req, req.user.company.company_name, "document", "Failed to load document", {
                        _id: id
                    }, err);
                    return next(new Error('Failed to load document ' + id));
                }
                req.document = document;
                next();
            });

        },
        /**
         * Find documentCategory by id
         */
        documentCategory: function(req, res, next, id) {
            require('../models/document_category')(req.companyDb);
            var DocumentCategoryModel = req.companyDb.model('DocumentCategory');
            DocumentCategoryModel.load(id, function(err, documentCategory) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "document", "Failed to fetch document category", {
                        _id: id
                    }, err);
                    return next(err);
                }
                if (!documentCategory) {
                    logger.error(req, req.user.company.company_name, "document", "Failed to create document", {
                        _id: id
                    }, err);
                    return next(new Error('Failed to load documentCategory ' + id));
                }
                req.documentCategory = documentCategory;
                next();
            });

        },

        /**
         * Create document for company
         */
        create: function(req, res) {
            require('../models/document')(req.companyDb);
            var DocumentModel = req.companyDb.model('Document');
            req.body.createdBy = req.user._id;
            var document = new DocumentModel(req.body);
            req.assert('document_category', 'You must enter document category').notEmpty();
            req.assert('title', 'You must enter  Title').notEmpty();
            req.assert('description', 'You must enter  Description').notEmpty();
            req.assert('documentUpload', 'You must upload file').notEmpty();
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            document.save(function(err) {
                if (err) {
                    switch (err.code) {
                        default: var modelErrors = [];
                        if (err.errors) {
                            for (var x in err.errors) {
                                modelErrors.push({
                                    param: x,
                                    msg: err.errors[x].message,
                                    value: err.errors[x].value
                                });
                            }
                            logger.error(req, req.user.company.company_name, "document", "Failed to create document", document, err);
                            return res.status(400).json(modelErrors);
                        }
                    }
                    logger.error(req, req.user.company.company_name, "document", "Failed to create document", document, err);
                    return res.status(400);
                } else {
                    logger.log(req, req.user.company.company_name, "document", "document created successfully", document);
                    return res.json(document);
                }
            });
        },

        /**
         * Update document for company
         */
        update: function(req, res) {
            require('../models/document')(req.companyDb);
            var DocumentModel = req.companyDb.model('Document');
            req.body.updatedBy = req.user._id;
            var document_before = req.document.toObject();
            var document = req.document;
            document = _.extend(document, req.body);
            req.assert('document_category', 'You must enter document category').notEmpty();
            req.assert('title', 'You must enter  Title').notEmpty();
            req.assert('description', 'You must enter  Description').notEmpty();
            req.assert('documentUpload', 'You must upload file').notEmpty();
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            document.save(function(err) {
                if (err) {
                    switch (err.code) {
                        default: var modelErrors = [];
                        if (err.errors) {
                            for (var x in err.errors) {
                                modelErrors.push({
                                    param: x,
                                    msg: err.errors[x].message,
                                    value: err.errors[x].value
                                });
                            }
                            logger.error(req, req.user.company.company_name, "document", "Failed to update document", document, err);
                            return res.status(400).json(modelErrors);
                        }
                    }
                    logger.error(req, req.user.company.company_name, "document", "Failed to update document", document, err);
                    return res.status(400);
                } else {
                    logger.delta(req, req.user.company.company_name, "document", "document updated successfully", document_before, document);
                    return res.json(document);
                }
            });
        },

        /**
         * load all document for company
         */
        all: function(req, res) {
            require('../models/document')(req.companyDb);
            var DocumentModel = req.companyDb.model('Document');
            DocumentModel.find({
                document_category: req.params.documentCategoryId
            }, function(err, documents) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "document", "Failed to create document", {
                        document_category: req.params.documentCategoryId
                    }, err);
                    return res.send(err);
                } else
                    return res.json(documents);
            });
        },

        /**
         * Show an document for company
         */
        show: function(req, res) {
            return res.json(req.document);
        },

        /**
         *delete document for company 
         */
        delete: function(req, res) {
            require('../models/document')(req.companyDb);
            var DocumentModel = req.companyDb.model('Document');
            var document = req.document;
            document.remove(function(err) {
                if (err) {
                    logger.error(req, req.user.company.company_name, "document", "Failed to delete document", document, err);
                    return res.status(400).json({
                        error: 'Cannot delete the Document'
                    });
                } else {
                    logger.log(req, req.user.company.company_name, "document", "document deleted successfully", document);
                    return res.json(document);
                }
            });
        },
    };
}