(function() {
    'use strict';

    /* jshint -W098 */
    angular.module('mean.documents').controller('DocumentsController',
        DocumentsController);

    DocumentsController.$inject = ['$scope', 'Global', 'Documents',
        '$stateParams', 'utilityService', 'NgTableParams', '$location',
        'DOCUMENT', '$rootScope', 'Upload','$window', '$http'
    ];

    function DocumentsController($scope, Global, Documents, $stateParams,
        utilityService, NgTableParams, $location, DOCUMENT, $rootScope, Upload, $window, $http) {
        $scope.global = Global;
        $scope.package = {
            name: 'documents'
        };
        $scope.documents = [];

        $scope.addDocument = function() {
            $location.path(DOCUMENT.PATH.DOCUMENT_ADD);
        }

        /**
         * fetch all document category list making the first document category loaded on document list page
         */
        $scope.findAllDocCategory = function() {
            Documents.docCategory.query({}, function(docs) {
                if (angular.isUndefined($scope.docCategory)) {
                    $scope.docCategory = {};
                }
                $scope.docCategoryArray = docs;
                var obj = {};
                if (docs.length > 0) {
                    $scope.docCategory.name = docs[0]._id;
                    obj.name = docs[0]._id;
                    $scope.findDocuments(obj);
                }
                $scope.docCategoryTable = new NgTableParams(utilityService.ngTableOptions(), {
                    dataset: docs
                })
            })
            $scope.documentCategoryList();
        };

        /**
         * Create function for Document Category
         * @params {isValid}  check if form is valid or not(frontend validations)
         */
        $scope.createDocCategory = function(isValid) {
            if (isValid) {
                var documentCategory = new Documents.docCategory($scope.docCategory);
                documentCategory.$save(function(response) {
                    $scope.saved = true;
                    $location.path(DOCUMENT.PATH.DOCUMENT_CATEGORY_LIST);
                    $scope.docCategory = {};
                    utilityService.flash.success("Document Category Created Successfully");
                }, function(error) {
                    $scope.error = error;
                });
            } else {
                utilityService.flash.error("You have some form errors, Please check again");
                $scope.submittedDocCategory = true;
            }
        };

        /**
         * Update function for Document Category
         * @params {isValid}  check if form is valid or not(frontend validations)
         */
        $scope.updateDocCategory = function(isValid) {
            if (isValid) {
                var documentCategory = $scope.docCategory;
                documentCategory.updatedAt = new Date();
                documentCategory.$update({
                    documentCategoryId: $stateParams.documentCategoryId
                }, function(response) {
                    $scope.docCategory = {};
                    $scope.saved = true;
                    utilityService.flash.success("Document Category Successfully");
                    $location.path(DOCUMENT.PATH.DOCUMENT_CATEGORY_LIST);
                }, function(error) {
                    $scope.error = error;
                });
            } else {
                $scope.submittedDocCategory = true;
                utilityService.flash.error("You have some form errors, Please check again");
            }
        };

        /**
         * fetch document category object details
         */
        $scope.findOne = function() {
            Documents.docCategory.get({
                documentCategoryId: $stateParams.documentCategoryId
            }, function(response) {
                $scope.docCategory = response;
            });
        };

        /**
         * Watch for displaying page counts for the table
         */
        $scope.$watch('docCategoryArray', function(array) {
            if (angular.isDefined(array)) {
                if (angular.isDefined($scope.docCategoryTable)) {
                    $scope.docCategoryTable.settings(utilityService.ngTableCounts(array));
                }
            }
        });

        /**
         * Delete document category function
         * @params {docCategory} Contain document category object
         */
        $scope.deleteDocCategory = function(DocCategory) {
            if (DocCategory) {

                Documents.documentBasedOnCategory.query({
                    documentCategoryId: DocCategory._id
                }, function(response) {
                    if (response.length > 0) {

                        utilityService.dialog("Audit-category Delete", "Document already created for this category you cannot delete");

                    } else {
                        $scope.deleteDocCategoryConfirm(DocCategory);
                    }

                }, function(error) {

                });

            }
        };

        $scope.deleteDocCategoryConfirm = function(DocCategory) {

            utilityService.delConfirm(function(result) {
                var message = "Cancel";
                if (result) {
                    message = "Document Category Deleted Successfully";
                    var docCategory = new Documents.docCategory(DocCategory);
                    docCategory.$remove(function(response) {
                        for (var i = 0; i < $scope.docCategoryTable.settings().dataset.length; i++) {
                            if (DocCategory == $scope.docCategoryTable.settings().dataset[i]) {
                                $scope.docCategoryTable.settings().dataset.splice(i, 1)
                            }
                        }
                        for (var i = 0; i < $scope.docCategoryArray.length; i++) {
                            if (DocCategory == $scope.docCategoryArray[i]) {
                                $scope.docCategoryArray.splice(i, 1);
                            }
                        }
                        $scope.docCategoryTable.reload().then(function(data) {
                            if (data.length === 0 && $scope.docCategoryTable.total() > 0) {
                                $scope.docCategoryTable.page($scope.docCategoryTable.page() - 1);
                                $scope.docCategoryTable.reload();
                            }
                        });
                        utilityService.flash.success(message);
                    }, function(error) {

                    });
                }
            });

        };

        /**
         * $watch for the <input> element for table global filter.
         * 'docCategoryTableFilter' is the ng-model of the <input> element (see .html)
         * Whenever the value changes, the table data is filtered and the table is reloaded. 
         * 
         * Note: This will not work for tables with server-side pagination. Filtering will also have to be done server-side.
         */
        $scope.$watch('docCategoryTableFilter', function(needle) {
            if (angular.isDefined(needle)) {
                if (angular.isDefined($scope.docCategoryTable)) {
                    $scope.docCategoryTable.settings().dataset = $scope.docCategoryArray.filter(function(item) {
                        /**
                         * [haystack] Concatenate all the fields from the data object that needs to be searched against.
                         * @type {[String]}
                         */
                        var haystack = item.name + item.description;

                        // Build a regex to perform non-case-sensitive search
                        needle = utilityService.escapeRegExp(needle);
                        var re = new RegExp(needle, "i")
                        return haystack.search(re) > -1;
                    });
                    $scope.docCategoryTable.reload();
                }
            }
        });

        $scope.addDocumentCategory = function() {
            $location.path(DOCUMENT.PATH.DOCUMENT_CATEGORY_ADD);
        };

        $scope.editDocCategory = function(docCategory) {
            var url = DOCUMENT.PATH.DOCUMENT_CATEGORY_EDIT;
            url = url.replace(':documentCategoryId', docCategory._id);
            $location.path(url);
        };

        $scope.cancelDocCategory = function() {
            $location.path(DOCUMENT.PATH.DOCUMENT_CATEGORY_LIST);
        };

        /**
         * Create function for Document 
         * @params {isValid}  check if form is valid or not(frontend validations)
         */
        $scope.createDocument = function(isValid) {
            if (isValid) {
                $scope.document.documentUpload = $scope.attachdocumentcompletepath;
                var document = new Documents.document($scope.document);
                document.$save(function(response) {
                    $scope.saved = true;
                    $location.path(DOCUMENT.PATH.DOCUMENT_LIST);
                    $scope.document = {};
                    utilityService.flash.success("Document  Created Successfully");
                }, function(error) {
                    $scope.error = error;
                    $scope.documentuplaodflag = true;
                });
            } else {
                utilityService.flash.error("You have some form errors, Please check again");
                $scope.submitted = true;
            }
        };

        /**
         * Upload function for documents 
         */

        $scope.attachDocument = function(file) {
            if (file) {
                if (file.name.split('.').pop() !== 'pdf' && file.name.split('.').pop() !== 'txt') {
                    utilityService.flash.error('Only pdf and txt are accepted.');
                    return;
                } else {
                    $rootScope.$emit('processingContinue');
                    $scope.upload = Upload.upload({
                        url: "/api/document/file",
                        method: 'POST',
                        data: {
                            file: file
                        }
                    }).progress(function(event) {}).success(function(data, status, headers, config) {
                        $scope.attachdocumentcompletepath = data;
                        $scope.attachdocuments = data.split('\\').pop().split('/').pop();
                        $scope.documentuplaodflag = false;
                    }).error(function(err) {
                        $scope.attachdocuments = err;
                    });
                }
            }
        };

        /**
         * To remove the uploaded document
         */
        $scope.removeDocument = function() {
            $scope.documentuplaodflag = true;
            $scope.attachdocumentcompletepath = undefined;
            $scope.attachdocuments = undefined;
        }

        /**
         * Fetch all documents
         */
        $scope.findDocuments = function(docCategory) {
            Documents.documentBasedOnCategory.query({
                documentCategoryId: docCategory.name
            }, function(response) {
                $scope.documents = response;
                for (var i = 0; i < $scope.documents.length; i++) {
                    $scope.documents[i].documentCompletepath = $scope.documents[i].documentUpload;
                    $scope.documents[i].documentUpload = $scope.documents[i].documentUpload.split('\\').pop().split('/').pop();
                }
                $scope.initializeNgTable(response);
            })
        }

        /**
         * initialize ng tables
         * @params {documents}  Array contain all document objects
         */
        $scope.initializeNgTable = function(documents) {
            $scope.documentsTable = new NgTableParams(utilityService.ngTableOptions(), {
                dataset: documents
            })
        };

        $scope.addDocument = function() {
            $location.path(DOCUMENT.PATH.DOCUMENT_ADD);
        }

        $scope.cancelDocument = function() {
            $location.path(DOCUMENT.PATH.DOCUMENT_LIST);
        }

        /**
         * $watch for the <input> element for table global filter.
         * 'tableFilter' is the ng-model of the <input> element (see .html)
         * Whenever the value changes, the table data is filtered and the table is reloaded. 
         * 
         * Note: This will not work for tables with server-side pagination. Filtering will also have to be done server-side.
         */
        $scope.$watch('tableFilter', function(needle) {
            if (angular.isDefined(needle)) {
                if (angular.isDefined($scope.documentsTable)) {
                    $scope.documentsTable.settings().dataset = $scope.documents
                        .filter(function(item) {
                            /**
                             * [haystack] Concatenate all the fields from the data object that needs to be searched against.
                             * @type {[String]}
                             */
                            var haystack = item.title + item.description;
                            // Build a regex to perform non-case-sensitive search
                            needle = utilityService.escapeRegExp(needle);
                            var re = new RegExp(needle, "i")
                            return haystack.search(re) > -1;
                        });
                    $scope.documentsTable.reload();
                }
            }
        });

        /**
         * Watch for displaying page counts for the table
         */
        $scope.$watch('documents', function(array) {
            if (angular.isDefined(array)) {
                if (angular.isDefined($scope.documentsTable)) {
                    $scope.documentsTable.settings(utilityService.ngTableCounts(array));
                }
            }
        });

        /**
         * Update function for Document 
         * @params {isValid}  check if form is valid or not(frontend validations)
         */
        $scope.updateDocument = function(isValid) {
            if (isValid) {
                $scope.document.documentUpload = $scope.attachdocumentcompletepath;
                var document = $scope.document;
                document.updatedAt = new Date();
                document.$update({
                    documentId: $stateParams.documentId
                }, function(response) {
                    $scope.document = {};
                    $scope.saved = true;
                    utilityService.flash.success("Document Updated Successfully");
                    $location.path(DOCUMENT.PATH.DOCUMENT_LIST);
                }, function(error) {
                    $scope.error = error;
                });
            } else {
                $scope.submitted = true;
                utilityService.flash
                    .error("You have some form errors, Please check again");
            }
        };

        /**
         * fetch document object details
         */
        $scope.findOneDocument = function() {
            Documents.document.get({
                documentId: $stateParams.documentId
            }, function(document) {
                if (document.documentUpload) {
                    $scope.attachdocumentcompletepath = document.documentUpload;
                    $scope.attachdocuments = document.documentUpload.split('\\').pop().split('/').pop();
                }
                $scope.document = document;
            });
        };

        $scope.editDocument = function(document) {
            var url = DOCUMENT.PATH.DOCUMENT_EDIT;
            url = url.replace(':documentId', document._id);
            $location.path(url);
        };

        /**
         * Delete document  function
         * @params {documents} Contain document object
         */
        $scope.deleteDocument = function(Document) {
            if (Document) {
                utilityService.delConfirm(function(result) {
                    var message = "Cancel";
                    if (result) {
                        message = "Document  Deleted Successfully";
                        var documentObj = new Documents.document(Document);
                        documentObj.$remove(function(response) {
                            for (var i = 0; i < $scope.documentsTable.settings().dataset.length; i++) {
                                if (Document == $scope.documentsTable.settings().dataset[i]) {
                                    $scope.documentsTable.settings().dataset.splice(i, 1)
                                }
                            }
                            for (var i = 0; i < $scope.documents.length; i++) {
                                if (Document == $scope.documents[i]) {
                                    $scope.documents.splice(i, 1);
                                }
                            }
                            $scope.documentsTable.reload().then(
                                function(data) {
                                    if (data.length === 0 && $scope.documentsTable.total() > 0) {
                                        $scope.documentsTable.page($scope.documentsTable.page() - 1);
                                        $scope.documentsTable.reload();
                                    }
                                });
                            utilityService.flash.success(message);
                        })
                    }
                });
            }
        };
        
        /*
         *  Fetch document category & if document category is not available popup will appear and redirect to create document category page
         */
        $scope.documentCategoryList = function(){
        	Documents.docCategory.query({}, function(docs) {
                if (docs.length) {
                    $scope.docs = docs;
                } else {
                    var title = "No document category Found.";
                    var message = "Please add document category first, do you want to create document category?";
                    $location.path(DOCUMENT.PATH.DOCUMENT_LIST);
                    utilityService.genericConfirm(title, message, function() {
                        //TODO: this will completely reload the window & need to find a better solution later
                        $window.location.href = DOCUMENT.PATH.DOCUMENT_CATEGORY_ADD;
                    });
                }
            })
        };
        
        /**
         * fetch all document category lists
         */
        $scope.findAll = function() {
            Documents.docCategory.query({}, function(docs) {
                $scope.docCategoryArray = docs;
                $scope.docCategoryTable = new NgTableParams(utilityService.ngTableOptions(), {
                    dataset: docs
                })
            })
        };

        $scope.downloadAttachedDocument = function(downloadpath) {
            $http({
                url: '/api/fileDownload?filename=' + downloadpath,
                method: 'GET',
                responseType: 'arraybuffer'
            }).success(function(response, status, headers, config) {
                var fileName = headers('content-disposition').split('=').pop();
                var contenttype = headers('content-type');
                var blob = new Blob([response], {
                    type: contenttype
                });
                saveAs(blob, fileName);
            });
        };

    }
})();