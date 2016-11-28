(function() {
    'use strict';
    /* jshint -W098 */

    angular.module('mean.audit').controller('AuditController', AuditController);
    AuditController.$inject = ['$scope', 'Global', 'AuditService', '$stateParams', '$location', 'AUDIT', 'AuditCategoryService', 'MeanUser', 'utilityService', '$timeout','NgTableParams'];

    function AuditController($scope, Global, AuditService, $stateParams, $location, AUDIT, AuditCategoryService, MeanUser, utilityService, $timeout,NgTableParams) {
        $scope.global = Global;
        $scope.package = {
            name: 'audit'
        };
        $scope.audit = {};
        $scope.page1 = true;
        $scope.auditCategoryInvalid = false;

        $(".auditdatepicker").datetimepicker({
            format: 'YYYY-MM-DD',
            minDate: new Date()
        });

        /**
         * date picker function for ng-repeat 
         * */

        $scope.bindDatePicker = function() {
            $timeout(function() {
                $(".datepicker").datetimepicker({
                    format: 'YYYY-MM-DD',
                    minDate: new Date()
                });
            }, 0);
        };

        /**
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
                $scope.findAll($scope.audit.building);
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
         * load security manager based on location and building
         * */

        $scope.loadSecurityManager = function() {
            AuditService.fetchSecurityManager.query(function(securityManagers) {
                $scope.securityManagers = securityManagers;
            });
        };

        /**
         * load all auditCategory
         * */

        $scope.allAuditCategory = function() {
            AuditCategoryService.auditCategory.query(function(auditCategorys) {
                var adminAudits = auditCategorys.adminAudits;
                var auditCategories = auditCategorys.auditCategories;
                var listOfCategories = adminAudits.concat(auditCategories);
                var array = [];
                for (var i = 0; i < listOfCategories.length; i++) {
                    if (listOfCategories[i].questionscount > 0) {
                        array.push(listOfCategories[i]);
                    }
                }
                $scope.auditCategorys = array;
            });
        };

        /**
         * based on selected building load all audit for list page
         * */

        $scope.selectedBuilding = function(building) {
            $scope.buildId = building;
            $scope.findAll(building);
            
        };

        /**
         * findAll audit 
         * */

        $scope.findAll = function(buildId) {
            AuditService.audit.query({
                buildingId: buildId
            }, function(audits) {
                $scope.audits = audits;
            });
        };

        /**
         * create audit
         * */

        $scope.create = function(isValid) {
            if (isValid) {
                var auditCategory = [];
                var errorMsg = false;
                for (var i = 0; i < $scope.auditCategorys.length; i++) {
                    if ($scope.auditCategorys[i].selected) {
                        var obj = {
                            "auditCategoryid": $scope.auditCategorys[i]._id,
                            "date": $('.' + $scope.auditCategorys[i].name.replace(/\s/g, '')).val()
                        }
                        if (obj.date.length > 0) {
                            $scope.auditCategorys[i].dateErr = false;
                            auditCategory.push(obj);
                        } else {
                            errorMsg = true;
                            $scope.submittedPage2 = true;
                            $scope.auditCategorys[i].dateErr = true;
                            $scope.page1 = false;
                            $scope.page2 = true;
                        }
                    }
                    $scope.audit.audit_category = auditCategory;
                }
                if (errorMsg == false) {
                    var audit = new AuditService.audit($scope.audit);
                    audit.$save(function(response) {
                    	$scope.saved = true;
                        $location.path(AUDIT.PATH.AUDITLIST);
                        utilityService.flash.success("Audit Created Successfully");
                        $scope.audit = {};
                    }, function(error) {
                        $scope.error = error;
                        $scope.backAudit();
                    });
                }
            } else {
                utilityService.flash.error("You have some form errors, Please check again");
                $scope.submittedPage2 = true;
            }
        };

        /**
         * next page function
         * */

        $scope.nextPage = function(isValid, audit) {
            var error = false;
            for (var i = 0; i < $scope.auditCategorys.length; i++) {
                if ($scope.auditCategorys[i].selected == true) {
                    error = true;
                }
            }
            if (isValid && error) {
                error = false;
                if (angular.isDefined(audit)) {
                    $scope.audit = audit;
                }
                $scope.page1 = false;
                $scope.page2 = true;

            } else {
                $scope.submitted = true;
                $scope.auditCategoryInvalid = true;
            }
        };

        /**
         * ng-change function for input checkbox
         * */

        $scope.removeError = function() {
            $scope.auditCategoryInvalid = false;
        }

        /**
         * ng-click function for date picker 
         * */

        $scope.removeErr = function(index) {
            $scope.auditCategorys[index].dateErr = false;
        }

        /**
         * backAudit function 
         * */

        $scope.backAudit = function(audit) {
            if (audit) {
                $scope.audit = audit;
            }
            $scope.auditCategoryInvalid = false;
            $scope.page1 = true;
            $scope.page2 = false;
        };

        /**
         * findOne audit function
         * */

        $scope.findOne = function() {
            AuditService.audit.get({
                auditId: $stateParams.auditId
            }, function(audit) {
                audit.date = new Date(audit.date).toISOString().slice(0, 10);
                $scope.userlocationBuilding(audit.location._id);
                $scope.audit = audit;
            });
        };

        /**
         * update audit function
         * */

        $scope.update = function(isValid) {
            if (isValid) {
                var audit = $scope.audit;
                audit.updatedAt = new Date();
                audit.$update({
                    auditId: $stateParams.auditId
                }, function() {
                	$scope.saved = true;
                    $location.path(AUDIT.PATH.AUDITLIST);
                    utilityService.flash.success('Audit updated successfully');
                }, function(error) {
                    $scope.error = error;
                });
            } else {
                $scope.submitted = true;
                utilityService.flash.error("You have some form errors, Please check again");
            }
        };

        /**
         * add new audit function
         * */

        $scope.addAudit = function() {
            var urlPath = AUDIT.PATH.AUDITCREATE;
            $location.path(urlPath);
        };

        /**
         * cancel audit function
         * */

        $scope.cancel = function() {
            var urlPath = AUDIT.PATH.AUDITLIST;
            $location.path(urlPath);
        };

        /**
         * edit future audit
         */
        $scope.editAudit = function(audit) {
            var urlPath = AUDIT.PATH.AUDITEDIT;
            urlPath = urlPath.replace(":auditId", audit._id);
            $location.path(urlPath);
        };

        $scope.editAuditCancel = function() {
            var urlPath = AUDIT.PATH.AUDITLISTBACK;
            var locationId = $scope.audit.location._id;
            var buildingId = $scope.audit.building._id;
            urlPath = urlPath.replace(":locationId", locationId).replace(":buildingId", buildingId);
            $location.path(urlPath);
        };

        /**
         * Datepicker function for edit page- to assign date to scope variable  
         */

        $(".auditdatepicker").on("dp.change", function(event) {
            if (event.date != false) {
                if (angular.isUndefined($scope.audit)) {
                    $scope.audit = {};
                }
                if (event.date._strict == false) {
                    $scope.audit.date = event.date.format('YYYY-MM-DD');
                } else {
                    $scope.audit.date = event.date.utc().format('YYYY-MM-DD');
                }
            }
        });


        $scope.performAudit = function(audit) {
            var urlPath = AUDIT.PATH.PERFORMAUDIT;
            urlPath = urlPath.replace(":auditId", audit._id);
            $location.path(urlPath);
        };


        $scope.strip = function(string) {
            return string.replace(/\s/g, '');
        };
        
        $scope.completedAudit = function (){
        	$location.path(AUDIT.PATH.PERFORMEDLIST);
        };
        
        $scope.restrictInput = function(event) {
            if (event.keyCode != 9 && event.keyCode != 8) {
                return event.preventDefault();
            }
        };
    }

})();
