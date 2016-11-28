(function() {
    'use strict';
    /* jshint -W098 */
    /**
     * Name : PerformAuditController @ <author> Sanjana @ <date> 12-july-2016 @ METHODS:
     * find
     */

    angular.module('mean.audit').controller('PerformAuditController', PerformAuditController);
    PerformAuditController.$inject = ['$scope', '$rootScope', 'Global', 'AuditService', '$stateParams', '$location', 'AUDIT', 'utilityService', 'MeanUser', 'Upload', '$http','SECURITYTASKS','NgTableParams'];

    function PerformAuditController($scope, $rootScope, Global, AuditService, $stateParams, $location, AUDIT, utilityService, MeanUser, Upload, $http,SECURITYTASKS,NgTableParams) {
        $scope.global = Global;
        $scope.package = {
            name: 'audit'
        };
        $scope.user = MeanUser.user;
        $scope.performAuditMaster = {};
        $scope.performAuditMaster.responses = [];
        $scope.pageNo = 1;
        $scope.task = {};

        /**
         * findAll audit questions with pagination implemented
         */
        $scope.find = function() {
            AuditService.performAuditQuestions.get({
                auditId: $stateParams.auditId
            }, function(performAuditQuestions) {
                $scope.totalAuditQues = performAuditQuestions;
                $scope.performAuditQuestions = performAuditQuestions;
                var performAuditArray = {};
                performAuditArray.responses = [];
                for (var i = 0; i < performAuditQuestions.questions.length; i++) {
                    var data = {
                        'question': performAuditQuestions.questions[i].audit_question,
                        'sequence': performAuditQuestions.questions[i].sequence,
                        'securityTask': performAuditQuestions.questions[i].securityTask,
                    }
                    performAuditArray.responses.push(data)
                }
                $scope.performAuditMaster = performAuditArray;
                $scope.pageLoad();
            });
        };

        /**
         * perform new audit
         * 
         * @params {isValid} check if form is valid or not(frontend validations)
         */
        $scope.create = function(isValid) {
            if (isValid) {
                $scope.performAuditQuestions = [];
                for (var i = 0; i < $scope.performAuditMaster.responses.length; i++) {
                    if ($scope.performAuditMaster.responses[i].answer == undefined) {
                        $scope.performAuditQuestions.push($scope.performAuditMaster.responses[i].sequence);
                    }
                }
                if ($scope.performAuditQuestions.length > 0) {
                    var title = "Questions Not Answered";
                    var message = "Please answer these questions!" + " " + $scope.performAuditQuestions;
                    utilityService.dialog(title, message, function() {
                        //TODO: this will completely reload the window & need to find a better solution later
                        $window.location.href = AUDIT.URL_PATH.PERFORMAUDIT;
                    });
                } else {
                    var performNewAudit = new AuditService.performAuditQuestions($scope.performAuditMaster);
                    performNewAudit.$save({
                        auditId: $stateParams.auditId
                    }, function(response) {
                    	$scope.saved = true;
                        $location.path(AUDIT.PATH.AUDITLIST);
                        utilityService.flash.success("Audit Performed Successfully");
                    }, function(error) {
                        $scope.error = error;
                    });
                }
            } else {
                $scope.performAuditQuestions = [];
                for (var i = 0; i < $scope.performAuditMaster.responses.length; i++) {
                    if ($scope.performAuditMaster.responses[i].answer == undefined) {
                        $scope.performAuditQuestions.push($scope.performAuditMaster.responses[i].sequence);
                    }
                }
                var title = "Questions Not Answered";
                var message = "Please answer these questions!" + " " + $scope.performAuditQuestions;
                utilityService.dialog(title, message, function() {
                    //TODO: this will completely reload the window & need to find a better solution later
                    $window.location.href = AUDIT.URL_PATH.PERFORMAUDIT;
                });
                $scope.submitted = true;
            }
        };

        /**
         * clicking the prev(pagination)
         * 
         */
        $scope.prev = function() {
            $('.page').each(function() {
                $(this).removeClass('active');
            })
            $('.p' + ($scope.pageNo - 1)).addClass('active');
            $scope.pageNo = $scope.pageNo - 1;
        };

        /**
         * clicking the next(pagination)
         * 
         */
        $scope.next = function() {
            $('.page').each(function() {
                $(this).removeClass('active');
            })
            $('.p' + ($scope.pageNo + 1)).addClass('active');
            $scope.pageNo = $scope.pageNo + 1;
        };

        /**
         * clicking the close button of the modal resetting the radio button
         * 
         */
        $scope.resetRadio = function() {
            if ($("#Choose_no" + $scope.selectedRadio).prop("checked")) {
                $("#Choose_no" + $scope.selectedRadio).prop('checked', false);
            }
            $scope.task = {};
            	
        };

        /**
         * setting the index to the scope variable used for resetting the radio button
         * 
         */
        $scope.radioChecked = function(index) {
            $scope.selectedRadio = index;
        }

        /**
         * getting the total page numbers
         * 
         */

        $scope.pageLoad = function() {
            $('.page').each(function() {
                $(this).removeClass('active');
            })
            $('.p' + $scope.pageNo).addClass('active');

            $scope.pageNos = [];
            $scope.pageNums = [];
            var pageNum = Math.round($scope.performAuditMaster.responses.length / 5);
            $scope.pageNumRound = pageNum % 5;
            if ($scope.pageNumRound < 5) {
                $scope.pageNumNew = $scope.pageNumRound;
            } else {
                $scope.pageNumNew = $scope.pageNumRound + 1;
            }
            for (var i = $scope.pageNumNew; i >= 1; i--) {
                $scope.pageNums.push(i);
            }
            $scope.pageNums.reverse();
            $scope.pageNos = $scope.pageNums;
        };

        /**
         * clicking the current page 
         * @params :pageNo
         */
        $scope.currentPage = function(pageNo) {
            $scope.pageNo = pageNo;
            $('.page').each(function() {
                $(this).removeClass('active');
            })
            $('.p' + $scope.pageNo).addClass('active');
        };

        $scope.cancel = function() {
            var urlPath = AUDIT.PATH.AUDITLISTBACK;
            var locationId = $scope.performAuditQuestions.audit.location._id;
            var buildingId = $scope.performAuditQuestions.audit.building._id;
            urlPath = urlPath.replace(":locationId", locationId).replace(":buildingId", buildingId);
            $location.path(urlPath);
        };


        $scope.attachPhoto = function(file) {
            if (file) {
                if (file.name.split('.').pop() !== 'jpg' && file.name.split('.').pop() !== 'jpeg') {
                    utilityService.flash.error('Only jpg and jpeg are accepted.');
                    return;
                } else {
                    $rootScope.$emit('processingContinue');
                    $scope.upload = Upload.upload({
                        url: "/api/performauditSecurity/fileupload",
                        method: 'POST',
                        data: {
                            file: file
                        }
                    }).progress(function(event) {}).success(function(data, status, headers, config) {
                        $scope.auditSecurityPhoto = data;
                        $scope.auditphoto = data.split('\\').pop().split('/').pop();
                    }).error(function(err) {
                        $scope.auditphoto = err;
                    });
                }
            }
        };
        $scope.removePerformAuditPlaced = function() {
            $scope.auditphoto = undefined;
        };
        $scope.createTask = function(isValid) {
            var err = true;
            if (!$scope.task.directly) {
                if (!$scope.task.fixday) {
                    err = false;
                    $scope.radioErr = true;
                }
            }
            if (isValid && err) {
                if ($scope.task.directly) {
                    $scope.task.responsible = $scope.user;
                    $scope.task.responsible_followUp = $scope.user;
                    $('#myModal').modal('hide');
                    if ($("#Choose_no" + $scope.selectedRadio).prop('checked', true)) {
                        $("#Choose_no" + $scope.selectedRadio).prop('disabled', true);
                        $("#Choose_yes" + $scope.selectedRadio).prop('disabled', true);
                        $("#Choose_na" + $scope.selectedRadio).prop('disabled', true);
                    }
                }
                var task = new AuditService.task($scope.task);
                task.invoice_image = $scope.auditSecurityPhoto;
                task.building = $scope.performAuditQuestions.audit.building._id;
                task.name = task.name + "(" + $scope.performAuditQuestions.audit.name + ")" + "(" + $scope.performAuditQuestions.audit.audit_category.name + ")";
                task.$save(function(response) {
                    $scope.performAuditMaster.responses[$scope.currentQuestionIndex].security_task = response.security_task;
                    $scope.task = {};
                    $scope.removePerformAuditPlaced();
                    $('#myModal').modal('hide');
                    if ($("#Choose_no" + $scope.selectedRadio).prop('checked', true)) {
                        $("#Choose_no" + $scope.selectedRadio).prop('disabled', true);
                        $("#Choose_yes" + $scope.selectedRadio).prop('disabled', true);
                        $("#Choose_na" + $scope.selectedRadio).prop('disabled', true);
                    }
                    $scope.submitted1 = false;
                    $scope.radioErr = false;
                }, function(error) {
                    $scope.error = error;
                });
                $scope.task = {};
            } else {
                $scope.submitted1 = true;
            }
        };

        $scope.setQuestion = function(qi) {
            $scope.submitted1 = false;
            $scope.radioErr = false;
            $scope.removePerformAuditPlaced();
            $scope.currentQuestionIndex = qi;
        }

        $scope.loadUsers = function() {
            AuditService.fetchUsers.query({ buildings: $scope.performAuditQuestions.audit.building._id }, function(users) {
                $scope.userResponsible = users;
                $scope.userFollowUp = users;
            });
        };

        $scope.removeErr = function() {
            $scope.radioErr = false;
        };

        $scope.downloadAttachedPerformAudit = function(downloadpath) {
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
        
        /**
         * findAll performed audits for one particular audit
         */
        $scope.findPerformedAudits = function() {
            AuditService.performedAudits.get({
                performId: $stateParams.performId
            }, function(auditsPerformed) {
            	$scope.performAuditMaster = auditsPerformed;
            });
        };
        
        $scope.securityTasklink = function() {
        	$location.path(SECURITYTASKS.URL_PATH.SECURITYTASKS_LIST)
        };
        
        /**
         * exporting performed audit to pdf
         */
        
        $scope.generatePdf = function(){
            var a = $('#performedAudit').html();
            var date = new Date($scope.performAuditMaster.performedat);
            var d = date.getDate();
            var m = date.getMonth();
            var y = date.getFullYear();
             utilityService.generatePdf(a, $scope.performAuditMaster.audit_category.name + ' '+ d + '/' + m + '/' + y);
        };/**
         * load user locations
         * */

        $scope.userLocation = function() {
            AuditService.userlocation.query(function(locations) {
                $scope.locations = locations;
            });
            if ($stateParams.locationId && $stateParams.buildingId) {
                $scope.audit.location = $stateParams.locationId;
                $scope.userlocationBuilding($scope.audit.location);
                $scope.audit.building = $stateParams.buildingId;
                $scope.findAllAudits($scope.audit.building);
            }
        };

        /**
         * load buildings based on selected location
         * */

        $scope.userlocationBuilding = function(locationId) {
            AuditService.userbuilding.query({
                locationId: locationId
            }, function(buildings) {
                $scope.buildings = buildings;
            });
        };

        /**
         * based on selected building load all audit for list page
         * */

        $scope.selectedBuilding = function(building) {
            $scope.buildId = building;
            $scope.findAllAudits(building);
        };
    
        $scope.findAllAudits = function(buildId){
        	AuditService.performedaudits.query({
                buildingId: buildId
            }, function(audits) {
                $scope.audits = audits;
                $scope.initializeNgTable(audits);
            });
        };
        
        $scope.performedAudit = function(audit) {
       	 var urlPath = AUDIT.PATH.PERFORMAUDITVIEW;
            urlPath = urlPath.replace(":performId", audit.performed._id);
            $location.path(urlPath);
       }
        /**
         * initialize ng tables
         * @params {documents}  Array contain all document objects
         */
        $scope.initializeNgTable = function(audits) {
            $scope.auditsTable = new NgTableParams(utilityService.ngTableOptions(), {
                dataset: audits
            })
        };
        /**
         * $watch for the <input> element for table global filter.
         * 'tableFilter' is the ng-model of the <input> element (see .html)
         * Whenever the value changes, the table data is filtered and the table is reloaded. 
         * 
         * Note: This will not work for tables with server-side pagination. Filtering will also have to be done server-side.
         */
        $scope.$watch('tableFilter', function(needle) {
            if (angular.isDefined(needle)) {
                if (angular.isDefined($scope.auditsTable)) {
                    $scope.auditsTable.settings().dataset = $scope.audits
                        .filter(function(item) {
                            /**
                             * [haystack] Concatenate all the fields from the data object that needs to be searched against.
                             * @type {[String]}
                             */
                            var haystack = item.audit.name + item.performedBy.firstname + item.performed.performed_At;
                            // Build a regex to perform non-case-sensitive search
                            needle = utilityService.escapeRegExp(needle);
                            var re = new RegExp(needle, "i")
                            return haystack.search(re) > -1;
                        });
                    $scope.auditsTable.reload();
                }
            }
        });
        $scope.showModal = function(quesObj){
            if(quesObj.securityTask){
                $('#myModal').modal('show');
            }else{
                $('#myModal').modal('hide');
            }
        };
        $scope.back = function(){
        	$location.path(AUDIT.PATH.PERFORMEDLIST);
        };
        
        $scope.backAuditList = function(){
        	$location.path(AUDIT.PATH.AUDITLIST);
        }

    }

})();
