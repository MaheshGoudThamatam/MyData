(function() {
    'use strict';
    /** Name : Guard Controller
     * @ <author> Abha Singh
     * @ <date> 8-jun-2016
     * @ METHODS: create, update, findOne, findAll, remove, deactivate, activate, cancelGuard, addGuard, editGuard
     */
    /* jshint -W098 */
    angular.module('mean.assets').controller('GuardController', GuardController);
    GuardController.$inject = ['$scope', 'Global', 'GuardService', '$stateParams', 'ASSETS', '$location', 'utilityService', 'NgTableParams', 'Upload', '$rootScope','$http'];

    function GuardController($scope, Global, GuardService, $stateParams, ASSETS, $location, utilityService, NgTableParams, Upload, $rootScope,$http) {
        $scope.global = Global;
        $scope.package = {
            name: 'assets'
        };
        $("#contractValidity").datetimepicker({
            format: 'YYYY-MM-DD',
            minDate: new Date()
        });
        /**
         * findAll guards
         */
        $scope.findAll = function() {
            GuardService.guarding.query({
                buildingId: $stateParams.buildingId
            }, function(guards) {
                $scope.guards = guards;
                $scope.guardTable = new NgTableParams(utilityService.ngTableOptions(), {
                    dataset: $scope.guards
                });
            });
        };
        /**
         * Watch for displaying page counts for the table
         */
        $scope.$watch('guards', function(array) {
            if (angular.isDefined(array)) {
                if (angular.isDefined($scope.guardTable)) {
                    $scope.guardTable.settings(utilityService.ngTableCounts(array));
                }
            }
        });
        /**
         * $watch for the <input> element for table global filter. 'tableFilter'
         * is the ng-model of the <input> element (see .html) Whenever the value
         * changes, the table data is filtered and the table is reloaded.
         * 
         * Note: This will not work for tables with server-side pagination.
         * Filtering will also have to be done server-side.
         */
        $scope.$watch('tableFilter', function(needle) {
            if (angular.isDefined(needle)) {
                if (angular.isDefined($scope.guardTable)) {
                    $scope.guardTable.settings().dataset = $scope.guards.filter(function(item) {
                        /**
                         * [haystack] Concatenate all the fields from the data object that needs to be searched against.
                         * @type {[String]}
                         */
                        var haystack = item.guarding_provider + item.contact_person.name + item.contact_person.email + item.contact_person.contact_number;
                        // Build a regex to perform non-case-sensitive search
                        needle = utilityService.escapeRegExp(needle);
                        var re = new RegExp(needle, "i")
                        return haystack.search(re) > -1;
                    });
                    $scope.guardTable.reload();
                }
            }
        });
        /**
         * create new guard
         * 
         * @params {isValid} check if form is valid or not(frontend validations)
         */
        $scope.create = function(isValid) {
            if (isValid) {
                $scope.guard.building = $stateParams.buildingId;
                $scope.guard.contract = $scope.attachcontractguardingcompletepath;
                $scope.guard.building_manual = $scope.attachbuildingmanualguardingcompletepath;
                var guard = new GuardService.guarding($scope.guard);
                guard.$save({
                    buildingId: $stateParams.buildingId
                }, function(response) {
                    $scope.cancelGuard();
                    $scope.saved = true;
                    utilityService.flash.success('Guard created successfully');
                    $scope.guard = {};
                }, function(error) {
                    $scope.error = error;
                });
            } else {
                $scope.submitted = true;
                utilityService.flash.error("You have some form errors, Please check again");
            }
        };
        /**
         * update particular guard
         * 
         * @params {isValid} check if form is valid or not(frontend validations)
         */
        $scope.update = function(isValid) {
            if (isValid) {
                $scope.guard.contract = $scope.attachcontractguardingcompletepath;
                $scope.guard.building_manual = $scope.attachbuildingmanualguardingcompletepath;
                var guard = $scope.guard;
                guard.updatedAt = new Date();
                guard.$update({
                    buildingId: $stateParams.buildingId,
                    guardingId: $stateParams.guardId
                }, function() {
                    $scope.cancelGuard();
                    $scope.saved = true;
                    utilityService.flash.success('Guard updated successfully');
                }, function(error) {
                    $scope.error = error;
                });
            } else {
                $scope.submitted = true;
                utilityService.flash.error("You have some form errors, Please check again");
            }
        };
        /**
         * findOne particular guard
         */
        $scope.findOne = function() {
            GuardService.guarding.get({
                buildingId: $stateParams.buildingId,
                guardingId: $stateParams.guardId
            }, function(guard) {
                if (guard.contract_validity) {
                    guard.contract_validity = new Date(guard.contract_validity).toISOString().slice(0, 10);
                }
                if (guard.contract) {
                    $scope.attachcontractguardingcompletepath = guard.contract;
                    $scope.attachcontractguarding = guard.contract.split('\\').pop().split('/').pop();
                }
                if (guard.building_manual) {
                    $scope.attachbuildingmanualguardingcompletepath = guard.building_manual;
                    $scope.attachbuildingmanualguarding = guard.building_manual.split('\\').pop().split('/').pop();
                }
                $scope.guard = guard;
            });
        };
        /**
         * cancel Guard
         */
        $scope.cancelGuard = function() {
            var urlPath = ASSETS.PATH.GUARDLIST;
            urlPath = urlPath.replace(":buildingId", $stateParams.buildingId);
            $location.path(urlPath);
        };
        /**
         * add new Guard
         */
        $scope.addGuard = function() {
            var urlPath = ASSETS.PATH.GUARDCREATE;
            urlPath = urlPath.replace(":buildingId", $stateParams.buildingId);
            $location.path(urlPath);
        };
        /**
         * editGuard redirect function Guard
         * 
         * @params {id} contain Guard id
         */
        $scope.editGuard = function(id) {
            var urlPath = ASSETS.PATH.GUARDEDIT;
            urlPath = urlPath.replace(":guardId", id).replace(":buildingId", $stateParams.buildingId);
            $location.path(urlPath);
        };
        /**
         * Hard delete particular guard
         * 
         * @params {Guard} Contain guard object
         */
        $scope.remove = function(Guard) {
            if (Guard) {
                utilityService.delConfirm(function(result) {
                    var message = "Cancel";
                    if (result) {
                        message = "Guard deleted successfully";
                        var guard = new GuardService.guarding(Guard);
                        guard.$remove({
                            buildingId: $stateParams.buildingId
                        }, function(response) {
                            for (var i = 0; i < $scope.guardTable.settings().dataset.length; i++) {
                                if (Guard == $scope.guardTable.settings().dataset[i]) {
                                    $scope.guardTable.settings().dataset.splice(i, 1)
                                }
                            }
                            for (var i = 0; i < $scope.guards.length; i++) {
                                if (Guard == $scope.guards[i]) {
                                    $scope.guards.splice(i, 1);
                                }
                            }
                            $scope.guardTable.reload().then(function(data) {
                                if (data.length === 0 && $scope.guardTable.total() > 0) {
                                    $scope.guardTable.page($scope.guardTabl.page() - 1);
                                    $scope.guardTable.reload();
                                }
                            });
                            utilityService.flash.success(message);
                        });
                    }
                });
            }
        };
        /**
         * Soft Delete/deactivate Guard
         * 
         * @params {guard} Contain guard object
         */
        $scope.deactivate = function(guard) {
            if (guard.active == true) {
                utilityService.delConfirm(function(result) {
                    var message = "Cancel";
                    if (result) {
                        message = "Guard Deactivated Successfully";
                        var guardObj = guard;
                        guardObj.active = false;
                        guardObj.updatedAt = new Date();
                        guardObj.$update({
                            guardingId: guard._id
                        }, function() {
                            utilityService.flash.success(message);
                        }, function(error) {
                            $scope.error = error;
                        })
                    }
                })
            }
        };
        /**
         * activate guard
         * 
         * @params {guard} Contain guard object
         */
        $scope.activate = function(guard) {
            if (guard.active == false) {
                var guardObj = guard;
                guardObj.active = true;
                guardObj.updatedAt = new Date();
                guardObj.$update({
                    guardingId: guard._id
                }, function() {
                    utilityService.flash.success("Guard Activated Successfully");
                }, function(error) {
                    $scope.error = error;
                });
            }
        };
        /**
         * Datepicker function to assign date to scope variable
         */
        $("#contractValidity").on("dp.change", function(event) {
            if (event.date != false) {
                if (angular.isUndefined($scope.guard)) {
                    $scope.guard = {};
                }
                if (event.date._strict == false) {
                    $scope.guard.contract_validity = event.date.format('YYYY-MM-DD');
                } else {
                    $scope.guard.contract_validity = event.date.utc().format('YYYY-MM-DD');
                }
            }
        });
        $scope.attachContractGuarding = function(file) {
            if (file) {
                if (file.name.split('.').pop() !== 'pdf' && file.name.split('.').pop() !== 'txt') {
                    utilityService.flash.error('Only pdf and txt are accepted.');
                    return;
                } else {
                    $rootScope.$emit('processingContinue');
                    $scope.upload = Upload.upload({
                        url: "/api/guarding/attachcontractguarding",
                        method: 'POST',
                        data: {
                            file: file
                        }
                    }).progress(function(event) {}).success(function(data, status, headers, config) {
                        $scope.attachcontractguardingcompletepath = data;
                        $scope.attachcontractguarding = data.split('\\').pop().split('/').pop();
                    }).error(function(err) {
                        $scope.attachcontractguarding = err;
                    });
                }
            }
        };
        $scope.removeAttachContractGuarding = function() {
            $scope.attachcontractguarding = undefined;
        };
        $scope.attachBuildingManualGuarding = function(file) {
            if (file) {
                if (file.name.split('.').pop() !== 'pdf' && file.name.split('.').pop() !== 'txt') {
                    utilityService.flash.error('Only pdf and txt are accepted.');
                    return;
                } else {
                    $rootScope.$emit('processingContinue');
                    $scope.upload = Upload.upload({
                        url: "/api/guarding/attachbuildingmanualguarding",
                        method: 'POST',
                        data: {
                            file: file
                        }
                    }).progress(function(event) {}).success(function(data, status, headers, config) {
                        $scope.attachbuildingmanualguardingcompletepath = data;
                        $scope.attachbuildingmanualguarding = data.split('\\').pop().split('/').pop();
                    }).error(function(err) {
                        $scope.attachbuildingmanualguarding = err;
                    });
                }
            }
        };
        $scope.removeAttachBuildingManualGuarding = function() {
            $scope.attachbuildingmanualguarding = undefined;
        };

         $scope.downloadAttachedDocumentGuarding = function(downloadpath) {
             $http({
                url: '/api/fileDownload?filename='+downloadpath,
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

        $scope.restrictInput = function(event) {
            if (event.keyCode != 9 && event.keyCode != 8) {
                return event.preventDefault();
            }
        };
        
        $scope.cloneGuard = function(id){
        	var urlPath = ASSETS.PATH.GUARDCLONE;
            urlPath = urlPath.replace(":guardId", id).replace(":buildingId", $stateParams.buildingId);
            $location.path(urlPath);
        };
        
        $scope.findOneGuard = function() {
            GuardService.guarding.get({
                buildingId: $stateParams.buildingId,
                guardingId: $stateParams.guardId
            }, function(guard) {
            	delete guard._id;
                if (guard.contract_validity) {
                    guard.contract_validity = new Date(guard.contract_validity).toISOString().slice(0, 10);
                }
                if (guard.contract) {
                    $scope.attachcontractguardingcompletepath = guard.contract;
                    $scope.attachcontractguarding = guard.contract.split('\\').pop().split('/').pop();
                }
                if (guard.building_manual) {
                    $scope.attachbuildingmanualguardingcompletepath = guard.building_manual;
                    $scope.attachbuildingmanualguarding = guard.building_manual.split('\\').pop().split('/').pop();
                }
                $scope.guard = guard;
            });
        };

    }
})();