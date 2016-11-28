(function() {
    'use strict';
    /* jshint -W098 */
    /** Name : ExternalTaskController
     * @ <author> Sanjana 
     * @ <date> 27-july-2016
     * @ METHODS: create, update, findOne, approveOrdeclinetask,approvalOfEstimates
     */
    angular.module('mean.securitytasks').controller('ExternalTaskController', ExternalTaskController);
    ExternalTaskController.$inject = ['$scope', 'Global', 'SecurityTasksService', '$stateParams', 'utilityService', '$location', 'SECURITYTASKS', 'Upload', 'MeanUser', 'CONFIG','$rootScope','$http'];

    function ExternalTaskController($scope, Global, SecurityTasksService, $stateParams, utilityService, $location, SECURITYTASKS, Upload, MeanUser, CONFIG,$rootScope,$http) {
        $scope.global = Global;
        $scope.package = {
            name: 'securitytasks'
        };
        $scope.externalsecuritytask = {};
        $scope.dateObj = new Date();
        $scope.subMittedForm = false;
        $scope.submittedStatus = false;
        $scope.submittedApprovedForm = true;
        $scope.disabledData = false;
        $scope.CONFIG = CONFIG;
        /**
         * create new externalsecuritytask
         * @params {isValid}  check if form is valid or not(frontend validations)
         */
        $scope.create = function(isValid, securitytaskId) {
            if (isValid) {
                $scope.externalsecuritytask.company_id = $stateParams.companyId;
                $scope.externalsecuritytask.securitytask = securitytaskId;
                var title = "Estimation of Task";
                var message = "Do you want external user to estimate this task?";
                var onClickYes = function() {
                    var externalsecuritytask = new SecurityTasksService.externalSecurityTaskCreate($scope.externalsecuritytask);
                    externalsecuritytask.value = "Yes";
                    externalsecuritytask.$save(function(response) {
                        $scope.saved = true;
                        utilityService.flash.success('Mail has been sent. Please check!');
                        $location.url('/securitytasks' + '?secId=' + externalsecuritytask.securitytask);
                        $scope.externalsecuritytask = {};
                    }, function(error) {
                        $scope.error = error;
                    });
                };
                var onClickCancel = function() {
                    var externalsecuritytask = new SecurityTasksService.externalSecurityTaskCreate($scope.externalsecuritytask);
                    externalsecuritytask.value = "Cancel";
                    externalsecuritytask.$save(function(response) {
                        $scope.saved = true;
                        utilityService.flash.success('Mail has been sent. Please check!');
                        $location.url('/securitytasks' + '?secId=' + externalsecuritytask.securitytask);
                        $scope.externalsecuritytask = {};
                    }, function(error) {
                        $scope.error = error;
                    });
                };
                utilityService.genericConfirm(title, message, onClickYes, onClickCancel)
            } else {
                $scope.submitted = true;
            }
            $location.search('');
        };
        /**
         * update particular external task
         *  @params {isValid}  check if form is valid or not(frontend validations)
         */
        $scope.update = function(isValid) {
            if (isValid) {
                var externalsecuritytask = $scope.externalsecuritytask;
                externalsecuritytask.updatedAt = new Date();
                externalsecuritytask.$update({
                    externalsecuritytaskId: $stateParams.externalsecuritytaskId,
                    companyId: $stateParams.companyId
                }, function(err) {

                });
            } else {
                $scope.submitted = true;
            }
        };
        /**
         * findOne particular esternal security task
         */
        $scope.findOne = function() {
            SecurityTasksService.externalSecurityTask.get({
                externalsecuritytaskId: $stateParams.externalsecuritytaskId,
                companyId: $stateParams.companyId
            }, function(externalsecuritytask) {
                $scope.externalsecuritytask = externalsecuritytask;
                if (externalsecuritytask.attach_photo) {
                    $scope.photocompletepath = externalsecuritytask.attach_photo;
                    $scope.photo = externalsecuritytask.attach_photo.split('\\').pop().split('/').pop();
                }
                if (externalsecuritytask.attach_invoice) {
                    $scope.invoicecompletepath = externalsecuritytask.attach_invoice;
                    $scope.invoice = externalsecuritytask.attach_invoice.split('\\').pop().split('/').pop();
                }
                if (externalsecuritytask.status !== CONFIG.status.APPROVED && externalsecuritytask.status !== CONFIG.status.DECLINE) {
                    $scope.status = 'Request is being processed, please wait.'
                } else
                if (externalsecuritytask.status === CONFIG.status.APPROVED) {
                    $scope.status = 'Request has been accepted.';
                    $scope.statusForManager = 'Request has been accepted.';
                    if (externalsecuritytask.actual_cost && externalsecuritytask.actual_hours) {
                        $scope.disabledData = true;
                    }
                } else
                if (externalsecuritytask.status === CONFIG.status.DECLINE) {
                    $scope.status = 'Request has been declined.';
                    $scope.statusForManager = 'Request has been declined.';
                }
                if (externalsecuritytask.status == CONFIG.status.DECLINE || externalsecuritytask.status == CONFIG.status.APPROVED) {
                    $scope.submittedStatus = true;
                }
                if (externalsecuritytask.status == CONFIG.status.FOR_ESTIMATE) {
                    $scope.submittedStatus = true;
                    $scope.statusForManager = "Waiting update from external person"
                }
                if (externalsecuritytask.status == CONFIG.status.COMPLETED) {
                    $scope.submittedStatus = true;
                    $scope.statusForManager = "External Task completed successfully"
                    $scope.status = "External Task completed successfully"
                }
            });
        };
        $scope.externalsecuritytask_closed = function(isValid, status) {
                if (isValid) {
                    if (status === CONFIG.status.CLOSED) {
                        var title = "Closing Task.";
                        var message = "Are you sure to close this task? User cannot be able to alter after this action performed.";
                        utilityService.genericConfirm(title, message, function() {
                            $scope.approveOrdeclinetask(isValid, status);
                        });
                    }
                } else {
                    $scope.submitted = true;
                }
            }
            /**
             * To approve or decline a particular external task after entering the estimations
             */
        $scope.approveOrdeclinetask = function(isValid, status) {
            if (status === CONFIG.status.FOR_ESTIMATE) {
                $scope.isDeclined = true;
                $scope.declined = true;
            } else {
                $scope.isDeclined = false;
                $scope.declined = false;
            };
            $scope.commentsSection = {};
            $scope.commentsSection.comments = $scope.commentsEntered;
            $scope.commentsSection.dateEntered = $scope.dateObj;
            $scope.commentsSection.userRole = MeanUser.user.role._id;
            $scope.commentsSection.name = MeanUser.user.firstname + ' ' + MeanUser.user.lastname;
            if (isValid) {
                SecurityTasksService.externalTaskApprove.update({
                    externalsecuritytaskId: $stateParams.externalsecuritytaskId,
                    companyId: $stateParams.companyId,
                    externalsecuritytask_hours: $scope.externalsecuritytask.actual_hours,
                    externalsecuritytask_cost: $scope.externalsecuritytask.actual_cost,
                    externalsecuritytask_status: status,
                    externalsecuritytask_attach_invoice: $scope.externalsecuritytask.attach_invoice,
                    externalsecuritytask_isDeclined: $scope.isDeclined,
                    externalsecuritytask_comments: $scope.commentsSection
                }, function(response) {
                    $scope.updatedResponse = response.isDeclined;
                    $scope.externalsecuritytask = response;
                    $scope.subMittedForm = true;
                    $scope.submittedApprovedForm = false;
                    $scope.submittedStatus = true;
                    if (status === CONFIG.status.APPROVED) {
                        $scope.statusForManager = 'Request has been accepted.';
                    } else
                    if (status === CONFIG.status.DECLINE) {
                        $scope.statusForManager = 'Request has been declined.';
                    } else
                    if (status === CONFIG.status.COMPLETED) {
                        $scope.statusForManager = 'External task completed successfully.';
                        if (angular.isUndefined($scope.externalsecuritytask)) {
                            $scope.externalsecuritytask = {};
                        }
                        $scope.externalsecuritytask.status = CONFIG.status.COMPLETED;
                    }
                    if (status === CONFIG.status.CLOSED) {
                        $scope.statusForManager = 'External task closed successfully.';
                        if (angular.isUndefined($scope.externalsecuritytask)) {
                            $scope.externalsecuritytask = {};
                        }
                        $scope.externalsecuritytask.status = CONFIG.status.CLOSED;
                    }
                }, function(err) {
                    if (err) {
                        $scope.error = err;
                    }
                });
            } else {
                $scope.submitted = true;
            }
        };
        /**
         * To send the external task for approval
         */
        $scope.approvalOfEstimates = function(isValid) {
            $scope.commentSection = {};
            $scope.commentSection.comments = $scope.externalsecuritytask.commentEntered;
            $scope.commentSection.dateEntered = $scope.dateObj;
            $scope.commentSection.userRole = $scope.externalsecuritytask._id;
            $scope.commentSection.name = $scope.externalsecuritytask.name;
            if (isValid) {
                SecurityTasksService.approvalExternalTask.update({
                    externalsecuritytaskId: $stateParams.externalsecuritytaskId,
                    companyId: $stateParams.companyId,
                    externalsecuritytask_hours: $scope.externalsecuritytask.estimated_hours,
                    externalsecuritytask_cost: $scope.externalsecuritytask.estimated_cost,
                    externalsecuritytask_query: $scope.externalsecuritytask.query,
                    externalsecuritytask_isDeclined: false,
                    externalsecuritytask_comments: $scope.commentSection
                }, function(response) {
                    $scope.subMittedForm = true;
                }, function(err) {
                    if (err) {
                        if (err.data == 'Already Submitted') {
                            utilityService.flash.warning(err.data);
                        }
                        $scope.error = err;
                    }
                });
            } else {
                $scope.submitted = true;
            }
        };

        $scope.taskList = function() {
            $location.path(SECURITYTASKS.URL_PATH.EXTERNALTASK_LIST);
        };

        $scope.attachCostInvoice = function(file) {
            if (file) {
                if (file.name.split('.').pop() !== 'pdf' && file.name.split('.').pop() !== 'jpeg' && file.name.split('.').pop() !== 'jpg') {
                    utilityService.flash.error('Only pdf and jpg/jpeg are accepted.');
                    return;
                } else {
                    $scope.upload = Upload.upload({
                        url: "/api/externalSecurityTaskInvoice/attachCostInvoice",
                        method: 'POST',
                        data: {
                            file: file
                        }
                    }).progress(function(event) {}).success(function(data, status, headers, config) {
                        utilityService.flash.success('Uploaded successfully');
                        $scope.attachInvoicePath = data;
                        $scope.externalsecuritytask.attach_invoice = data;
                        $scope.attachInvoiceCost = data.split('\\').pop().split('/').pop();
                    }).error(function(err) {
                        $scope.attachInvoiceCost = err;
                    });
                }
            }
        };

        $scope.init = function() {
            var queryParam = $location.search();
            $scope.security_task_name = queryParam.securitytaskName;
            $scope.securitytaskId = queryParam.securitytaskId;
            $scope.externalsecuritytask.task_name = queryParam.externaltaskName;
        };
        
        $scope.removeInvoice = function() {
            $scope.attachInvoiceCost = undefined;
        };

        $scope.attachPhoto = function(file) {
            if (file) {
                if (file.name.split('.').pop() !== 'jpg' && file.name.split('.').pop() !== 'jpeg') {
                    utilityService.flash.error('Only jpg and jpeg are accepted.');
                    return;
                } else {
                    $rootScope.$emit('processingContinue');
                    $scope.upload = Upload.upload({
                        url: "/api/externaltask/fileupload",
                        method: 'POST',
                        data: {
                            file: file
                        }
                    }).progress(function(event) {}).success(function(data, status, headers, config) {
                    	utilityService.flash.success('Uploaded successfully');
                        $scope.externalsecuritytask.attach_photo = data;
                        $scope.externalTaskPhoto = data.split('\\').pop().split('/').pop();
                    }).error(function(err) {
                        $scope.externalTaskPhoto = err;
                    });
                }
            }
        };
        
        $scope.removePhoto = function() {
            $scope.externalTaskPhoto = undefined;
        };

        $scope.init = function() {
            var queryParam = $location.search();
            $scope.security_task_name = queryParam.securitytaskName;
            $scope.securitytaskId = queryParam.securitytaskId;
            $scope.externalsecuritytask.task_name = queryParam.externaltaskName;
        };
        
        $scope.removeInvoice = function() {
            $scope.attachInvoiceCost = undefined;
        };
        
        $scope.allSecuritytasks = function(){
        	var user = MeanUser.user;
        	SecurityTasksService.allSecuritytasks.query({
                company:user.company._id 
            }, function(response) {
                $scope.allsecurityTasks = response;
            })
        };
        
        $scope.$watch('security_task_name', function(needle) {
            if (angular.isDefined(needle)) {
                if (angular.isDefined($scope.mySecurityTasks)) {
                    $scope.allsecurityTasks = $scope.allsecurityTasks.filter(function(item) {
                        var haystack = item.task_name;
                        needle = utilityService.escapeRegExp(needle);
                        var re = new RegExp(needle, "i");
                        return haystack.search(re) > -1;
                    });
                }
            }
        });
        
        $scope.downloadPhoto = function(downloadpath) {
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
