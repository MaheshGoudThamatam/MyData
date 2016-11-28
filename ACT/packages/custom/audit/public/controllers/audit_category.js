(function() {
    'use strict';
    /** Name : AUDIT CATEGORY Controller
     * Description : 
     * @ <author> Anto Steffi 
     * @ <date> 11-July-2016
     * @ METHODS: create, List, global filter, Hard delete, Activate, Deactivate
     */
    /** Modification added ui-tree plugin
     * @ <author> Anto Steffi 
     * @ <date> 13-July-2016
     * @ METHODS: Add Audit Questions
     */
    /** Modification added methods
     * @ <author> Anto Steffi 
     * @ <date> 14-July-2016
     * @ METHODS: update, findOne
     */
    /** Modification 
     * @ <author> Anto Steffi 
     * @ <date> 18-July-2016
     * @ METHODS: modified create and update
     */
    /* jshint -W098 */
    angular.module('mean.audit').controller('AuditCategoryController', AuditCategoryController);
    AuditCategoryController.$inject = ['$scope', 'Global', 'AuditCategoryService', '$stateParams', 'utilityService', 'NgTableParams', '$location', 'AUDIT', '$rootScope', 'Upload', '$http', 'MeanUser', '$TreeDnDConvert', 'CONFIG'];

    function AuditCategoryController($scope, Global, AuditCategoryService, $stateParams, utilityService, NgTableParams, $location, AUDIT, $rootScope, Upload, $http, MeanUser, $TreeDnDConvert, CONFIG) {
        $scope.global = Global;
        $scope.package = {
            name: 'auditcategory'
        };
        $scope.auditQuestionObjects = [];
        $scope.uploadBegins = false;
        $scope.uiTreeOptions = {
            beforeDrop: function(e) {
                return true;
            }
        };
        $scope.loggedUser = MeanUser.user;
        /**
         * Create a new AUDIT CATEGORY
         */
        $scope.create = function(isValid) {
            if (isValid) {
                $scope.auditQuestionObjects = [];
                for (var i = 0; i < $scope.auditQuestions.length; i++) {
                    var questionObj = {};
                    questionObj = {
                        "sequence": $scope.auditQuestions[i].__index__ + 1,
                        "audit_question": $scope.auditQuestions[i].audit_question,
                        "securityTask": $scope.auditQuestions[i].securityTask
                    }
                    $scope.auditQuestionObjects.push(questionObj)
                }
                $scope.auditCategory.auditQuestions = $scope.auditQuestionObjects;
                $scope.auditCategory.questionscount = $scope.auditQuestionObjects.length;
                var auditcategory = new AuditCategoryService.auditCategory($scope.auditCategory);
                auditcategory.$save(function(response) {
                	$scope.saved = true;
                    $location.path(AUDIT.PATH.LIST_AUDITCATEGORY);
                    utilityService.flash.success("Audit Category Created Successfully");
                }, function(error) {
                    $scope.error = error;
                });
            } else {
                utilityService.flash.error("You have some form errors, Please check again");
                $scope.submitted = true;
            }
        };
        /**
         * Shows all the AUDIT CATEGORY using NgTable
         */
        $scope.list = function() {
            AuditCategoryService.auditCategory.query(function(response) {
                $scope.auditCategory = response.auditCategories;
                $scope.auditUserData = response.auditCategories;
                $scope.adminData = response.adminAudits;
                $scope.tableParams = new NgTableParams(utilityService.ngTableOptions(), {
                    dataset: $scope.auditUserData,
                });
                $scope.tablePristine = new NgTableParams(utilityService.ngTableOptions(), {
                    dataset: $scope.adminData
                });
            })
        };
        /**
         * Watch for displaying page counts for the table
         */
        $scope.$watch('auditUserData', function(array) {
            if (angular.isDefined(array)) {
                if (angular.isDefined($scope.auditUserData)) {
                    $scope.tableParams.settings(utilityService.ngTableCounts(array));
                }
            }
        });
        /**
         * Watch for displaying page counts for the table
         */
        $scope.$watch('adminData', function(array) {
            if (angular.isDefined(array)) {
                if (angular.isDefined($scope.adminData)) {
                    $scope.tablePristine.settings(utilityService.ngTableCounts(array));
                }
            }
        });
        /**
         * Table for global filter
         */
        $scope.$watch('tableFilter', function(needle) {
            if (angular.isDefined(needle)) {
                if (angular.isDefined($scope.tableParams)) {
                    $scope.tableParams.settings().dataset = $scope.auditUserData.filter(function(item) {
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
                    $scope.tableParams.reload();
                }
            }
        });
        /**
         * Hard Delete for AUDIT CATEGORY
         * 
         */
        $scope.deleteAuditCategory = function(AuditCategory) {
            if (AuditCategory) {
                utilityService.delConfirm(function(result) {
                    var message = "Cancel";
                    if (result) {
                        var auditcategory = new AuditCategoryService.auditCategory(AuditCategory);
                        auditcategory.$remove(function(response) {
                            for (var i = 0; i < $scope.tableParams.settings().dataset.length; i++) {
                                if (AuditCategory == $scope.tableParams.settings().dataset[i]) {
                                    $scope.tableParams.settings().dataset.splice(i, 1)
                                }
                            }
                            for (var i = 0; i < $scope.auditUserData.length; i++) {
                                if (AuditCategory == $scope.auditUserData[i]) {
                                    $scope.auditUserData.splice(i, 1)
                                }
                            }
                            $scope.tableParams.reload().then(function(data) {
                                if (data.length === 0 && $scope.auditUserData.total() > 0) {
                                    $scope.auditUserData.page($scope.auditUserData.page() - 1);
                                    $scope.tableParams.reload();
                                }
                            });
                            utilityService.flash.success("Audit Category Deleted Successfully");
                        }, function(err) {
                            if (err) {
                                utilityService.flash.error(err.data);
                            }
                        })
                    }
                });
            }
        };
        /**
         * Activate AUDIT CATEGORY
         * 
         */
        $scope.activeAuditCategory = function(auditCategory) {
            if (auditCategory.isActive == false) {
                var auditCategoryObj = auditCategory;
                if (!auditCategoryObj.updatedAt) {
                    auditCategoryObj.updatedAt = "";
                }
                auditCategoryObj.isActive = true;
                auditCategoryObj.updatedAt = new Date();
                auditCategoryObj.$update({
                    auditCategoryId: auditCategory._id
                }, function() {
                    utilityService.flash.success("Audit Category Activated Successfully");
                }, function(error) {
                    $scope.error = error
                })
            } else {
                utilityService.flash.error("Audit Category is Already Activated.");
            }
        };
        /**
         * Deactivate AUDIT CATEGORY
         * 
         */
        $scope.deactiveAuditCategory = function(auditCategory) {
            if (auditCategory.isActive == true) {
                utilityService.delConfirm(function(result) {
                    var message = "Cancel";
                    if (result) {
                        message = "Audit Category Deactivated Successfully";
                        var auditCategoryObj = auditCategory;
                        if (!auditCategoryObj.updatedAt) {
                            auditCategoryObj.updatedAt = "";
                        }
                        auditCategoryObj.isActive = false;
                        auditCategoryObj.updatedAt = new Date();
                        auditCategoryObj.$update({
                            auditCategoryId: auditCategory._id
                        }, function() {
                            utilityService.flash.success(message);
                        }, function(error) {
                            $scope.error = error
                        })
                    }
                })
            } else {
                utilityService.flash.error("Audit Category is Already Deactivated.");
            }
        };
        /**
         * Redirect to AUDIT CATEGORY List Page
         */
        $scope.createAuditCategory = function() {
            $location.path(AUDIT.PATH.CREATE_AUDITCATEGORY);
        };
        /**
         * Redirect to AUDIT CATEGORY List Page
         */
        $scope.cancel = function() {
            $location.path(AUDIT.PATH.LIST_AUDITCATEGORY);
        };
        /**
         * Add Audit Questions
         */
        $scope.auditQuestions = [];
        $scope.auditQuestion = [];
        $scope.resetVars = function() {
            $scope.questionStr = '';
            $scope.securityTask = '';
            $scope.addQuestionIndex = -1;
            $scope.Qerr = false;
        }
        $scope.addQuestion = function() {
            if ($scope.addQuestionIndex > 0) {
                if ($scope.questionStr) {
                    var obj = {
                        audit_question: $scope.questionStr,
                        securityTask: $scope.securityTask,
                        parent: null
                    };
                    $scope.auditQuestions.splice($scope.addQuestionIndex, 0, obj);
                    $('#basic').modal('hide');
                    $scope.resetVars();
                } else {
                    $scope.Qerr = true;
                }
            } else {
                if ($scope.questionStr) {
                    var obj = {
                        audit_question: $scope.questionStr,
                        securityTask: $scope.securityTask,
                        parent: null
                    };
                    $scope.auditQuestions.push(obj);
                    $('#basic').modal('hide');
                    $scope.resetVars();
                } else {
                    $scope.Qerr = true;
                }
            }
            $scope.noQue = false;
        };
        /**
         * Updates the edited audit category
         */
        $scope.update = function(isValid) {
            var err = true;
            if($scope.auditQuestions.length == 0 || $scope.auditQuestions.length == undefined){
                err = false;
                $scope.noQue = true;
            }
            if (isValid && err) {
                $scope.questionArray = [];
                for (var i = 0; i < $scope.auditQuestions.length; i++) {
                    var questionObj = {
                        sequence: $scope.auditQuestions[i].__index__ + 1,
                        audit_question: $scope.auditQuestions[i].audit_question,
                        securityTask: $scope.auditQuestions[i].securityTask
                    }
                    $scope.questionArray.push(questionObj)
                }
                $scope.auditCategory.auditQuestions = $scope.questionArray;
                $scope.auditCategory.questionscount = $scope.questionArray.length;
                var auditcategory = $scope.auditCategory;
                if (!auditcategory.updatedAt) {
                    auditcategory.updatedAt = "";
                }
                auditcategory.updatedAt = new Date();
                auditcategory.$update({
                    auditCategoryId: $stateParams.auditCategoryId
                }, function() {
                	$scope.saved = true;
                    $location.path(AUDIT.PATH.LIST_AUDITCATEGORY);
                    utilityService.flash.success("Audit Category Updated Successfully");
                }, function(error) {
                    $scope.error = error;
                });
            } else {
                $scope.submitted = true;
                $scope.noQue = true;
                utilityService.flash.error("You have some form errors, Please check again");
            }
        };
        /**
         * Shows the single audit category
         */
        $scope.findOne = function() {
            AuditCategoryService.auditCategory.get({
                auditCategoryId: $stateParams.auditCategoryId
            }, function(auditCategory) {
                $scope.auditCategory = auditCategory;
                $scope.checkSuperAdmin(auditCategory);
            });
        };
        /**
         * Redirect to audit category edit Page
         */
        $scope.editAuditCategory = function(id) {
            var urlPath = AUDIT.PATH.EDIT_AUDITCATEGORY;
            urlPath = urlPath.replace(":auditCategoryId", id);
            $location.path(urlPath);
        };
        /**
         * Find audit questions based on audit category id
         */
        $scope.findAuditQuestions = function() {
            AuditCategoryService.fetchAuditQuestions.query({
                auditCategoryId: $stateParams.auditCategoryId
            }, function(auditQuestions) {
                if (auditQuestions.length > 0) {
                    $scope.auditQuestions = auditQuestions;
                }
            })
        };
        $scope.auditCategoryBulkupload = function() {
            var urlPath = AUDIT.PATH.AUDITCATEGORY_BULKUPLOAD;
            urlPath = urlPath.replace(":auditCategoryId", $stateParams.auditCategoryId);
            $location.path(urlPath);
        };
        $scope.onCategoryFileSelect = function(file) {
            if (file) {
                if (file.name.split('.').pop() !== 'xls' && file.name.split('.').pop() !== 'xlsx') {
                    alert('Only xls and xlsx are accepted.');
                    return;
                }
                $rootScope.$emit('processingContinue');
                $scope.upload = Upload.upload({
                    url: "/api/auditCategory/" + $stateParams.auditCategoryId + "/bulkUpload",
                    method: 'POST',
                    data: {
                        file: file
                    }
                }).progress(function(event) {}).success(function(data, status, headers, config) {
                    $scope.uploadBegins = true;
                    $scope.resultUsersSet = data.result;
                }).error(function(err) {
                    $scope.uploadBegins = false;
                    utilityService.flash.error(err.error);
                });
            }
        };
        $scope.getAuditBulkUploadTemplate = function(file) {
            $http({
                url: '/api/auditBulkUpload/getTemplate',
                method: 'GET',
                responseType: 'arraybuffer'
            }).success(function(response) {
                var blob = new Blob([response], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                });
                saveAs(blob, 'bulkupload_auditquestions_template' + '.xlsx');
            });
        };
        $scope.backToAuditList = function() {
            $scope.uploadBegins = false;
            $location.path(AUDIT.PATH.LIST_AUDITCATEGORY);
        };
        $scope.isSuperAdmin = function() {
                return (utilityService.isSuperAdmin(MeanUser.user.role._id));
            }
            /**
             * angular-tree-dnd related code
             */
        var tree;
        $scope.tree_data = {};
        $scope.my_tree = tree = {};
        $scope.tree_data = $TreeDnDConvert.line2tree($scope.auditQuestions, 'question', 'parent');
        $scope.setQuestionIndex = function(index) {
            $scope.addQuestionIndex = index + 1;
        };
        
        
        $scope.findQuest = function(node){
        	$scope.node = node;
        	$('#edit').modal('show');
        	$scope.questionStr = node.audit_question;
            $scope.securityTask = node.securityTask;
        }
        
        $scope.updateQuestion = function(questionStr,securityTask){
        		if(questionStr){
        			for(var i=0;i<$scope.auditQuestions.length;i++){
        				if ($scope.node.audit_question == $scope.auditQuestions[i].audit_question) {
                            $scope.auditQuestions[i].audit_question = questionStr;
	        				$scope.auditQuestions[i].securityTask = securityTask;
        				}
        			}
        			$scope.questionStr = '';
        		   $('#edit').modal('hide');
        		}
        }

        /**
         * Check logged in user is super admin or not
         */
        $scope.checkSuperAdmin = function(auditCategory){
            $scope.sysAudit = false;
            if (auditCategory.admin) {
                if ($scope.isSuperAdmin()) {
                    $scope.sysAudit = true;
                } else {
                    $scope.sysAudit = false;
                }
            } else
            if (!auditCategory.admin){
                $scope.sysAudit = true;
            }
        }
    }
})();