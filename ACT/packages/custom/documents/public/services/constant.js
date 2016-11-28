/*
 * <Author:Akash Gupta>
 * <Date:29-07-2016>
 * <constants: for documents list,edit, add page>
 */

angular.module('mean.documents').constant('DOCUMENT', {
    PATH: {
        DOCUMENT_CATEGORY_ADD: '/document-category/add',
        DOCUMENT_LIST: '/documents',
        DOCUMENT_ADD: '/documents/add',
        DOCUMENT_EDIT: '/documents/:documentId/edit',
        DOCUMENT_CATEGORY_EDIT: '/document-category/:documentCategoryId/edit',
        DOCUMENT_CATEGORY_LIST: '/document-category'
    },
    FILE_PATH: {
        DOCUMENT_CATEGORY_ADD: 'documents/views/document-category-create.html',
        DOCUMENT_CATEGORY_EDIT: 'documents/views/document-category-edit.html',
        DOCUMENT_CATEGORY_LIST: 'documents/views/document-category-list.html',
        DOCUMENT_LIST: 'documents/views/documents.html',
        DOCUMENT_ADD: 'documents/views/document-add.html',
        DOCUMENT_EDIT: 'documents/views/document-edit.html'
    },
    STATE: {
        DOCUMENT_CATEGORY_ADD: 'Document categories_create category',
        DOCUMENT_CATEGORY_EDIT: 'Document categories_update category',
        DOCUMENT_CATEGORY_LIST: 'Document categories_all categories',
        DOCUMENT_LIST: 'Documents_all documents',
        DOCUMENT_ADD: 'Documents_create document',
        DOCUMENT_EDIT: 'Documents_update document'
    }
});