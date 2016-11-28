(function() {
    'use strict';
    /* jshint -W098 */
    angular.module('mean.company').controller('BurglarAlarmController', BurglarAlarmController);
    BurglarAlarmController.$inject = ['$scope', 'Global', '$stateParams', 'utilityService', 'NgTableParams', '$location', 'BurglarAlarmService', 'Assets', 'ASSETS', '$filter', 'Upload', '$rootScope'];

    function BurglarAlarmController($scope, Global, $stateParams, utilityService, NgTableParams, $location, BurglarAlarmService, Assets, ASSETS, $filter, Upload, $rootScope) {
        $scope.global = Global;
        $scope.package = {
            name: 'assets'
        };
        $("#contractValidity").datetimepicker({
            format: 'YYYY-MM-DD',
            minDate: new Date()
        });
        $("#noticePeriod").datetimepicker({
            format: 'YYYY-MM-DD',
            minDate: new Date()
        });
        /**
         * Function to redirect to add burglarAlarm form
         */
        $scope.addBurglarAlarm = function() {
            var urlPath = ASSETS.PATH.BURGLARALARM_ADD;
            urlPath = urlPath.replace(":buildingId", $stateParams.buildingId);
            $location.path(urlPath);
        };
        /**
         * Function to redirect to list burglarAlarm page
         */
        $scope.cancelBurglarAlarm = function() {
            var urlPath = ASSETS.PATH.BURGLARALARM_LIST;
            urlPath = urlPath.replace(":buildingId", $stateParams.buildingId);
            $location.path(urlPath);
        };
        /**
         * Function to redirect to edit burglarAlarm form
         * @params {burglarAlarm} burglarAlarm object
         */
        $scope.editBurglarAlarm = function(burglarAlarm) {
            var urlPath = ASSETS.PATH.BURGLARALARM_EDIT;
            urlPath = urlPath.replace(":burglarAlarmId", burglarAlarm._id).replace(":buildingId", $stateParams.buildingId);
            $location.path(urlPath);
        };
        /**
         * Create function for burglarAlarm
         * @params {isValid}  check if form is valid or not(frontend validations)
         */
        $scope.create = function(isValid) {
            if (isValid) {
                $scope.burglarAlarm.building = $stateParams.buildingId;
                $scope.burglarAlarm.contract = $scope.attachcontractalarmcompletepath;
                $scope.burglarAlarm.orientation_drawing = $scope.attachorientationdrawingscompletepath;
                $scope.burglarAlarm.user_manual = $scope.attachusermanualcompletepath;
                var burglarAlarm = new BurglarAlarmService.burglarAlarm($scope.burglarAlarm);
                burglarAlarm.$save({
                    buildingId: $stateParams.buildingId
                }, function(response) {
                    $scope.cancelBurglarAlarm();
                    $scope.saved = true;
                    utilityService.flash.success("Burglar alarm Created Successfully");
                }, function(error) {
                    $scope.error = error;
                });
            } else {
                utilityService.flash.error("You have some form errors, Please check again");
                $scope.submitted = true;
            }
        };
        /**
         * Update function for burglarAlarm
         * @params {isValid}  check if form is valid or not(frontend validations)
         */
        $scope.update = function(isValid) {
                if (isValid) {
                    $scope.burglarAlarm.contract = $scope.attachcontractalarmcompletepath;
                    $scope.burglarAlarm.orientation_drawing = $scope.attachorientationdrawingscompletepath;
                    $scope.burglarAlarm.user_manual = $scope.attachusermanualcompletepath;
                    var burglarAlarm = $scope.burglarAlarm;
                    if (!burglarAlarm.updatedAt) {
                        burglarAlarm.updatedAt = [];
                    }
                    burglarAlarm.updatedAt = new Date();
                    burglarAlarm.$update({
                        buildingId: $stateParams.buildingId,
                        burglarAlarmId: $stateParams.burglarAlarmId
                    }, function() {
                        $scope.cancelBurglarAlarm();
                        $scope.saved = true;
                        utilityService.flash.success("Burglar alarm Updated Successfully");
                    }, function(error) {
                        $scope.error = error;
                    });
                } else {
                    $scope.submitted = true;
                    utilityService.flash.error("You have some form errors, Please check again");
                }
            }
            /**
             * fetch all burglarAlarm lists
             */
        $scope.findAll = function() {
            BurglarAlarmService.burglarAlarm.query({
                buildingId: $stateParams.buildingId
            }, function(burglarAlarm) {
                $scope.burglarAlarmArray = burglarAlarm;
                $scope.initializeNgTable(burglarAlarm);
            })
        };
        /**
         * fetch burglarAlarm object details
         */
        $scope.findOne = function() {
                BurglarAlarmService.burglarAlarm.get({
                    buildingId: $stateParams.buildingId,
                    burglarAlarmId: $stateParams.burglarAlarmId
                }, function(burglarAlarm) {
                    if (burglarAlarm.contract_validity) {
                        burglarAlarm.contract_validity = new Date(burglarAlarm.contract_validity).toISOString().slice(0, 10);
                    }
                    if (burglarAlarm.notice_period) {
                        burglarAlarm.notice_period = new Date(burglarAlarm.notice_period).toISOString().slice(0, 10);
                    }
                    if (burglarAlarm.contract) {
                        $scope.attachcontractalarmcompletepath = burglarAlarm.contract;
                        $scope.attachcontractalarm = burglarAlarm.contract.split('\\').pop().split('/').pop();
                    }
                    if (burglarAlarm.orientation_drawing) {
                        $scope.attachorientationdrawingscompletepath = burglarAlarm.orientation_drawing;
                        $scope.attachorientationdrawings = burglarAlarm.orientation_drawing.split('\\').pop().split('/').pop();
                    }
                    if (burglarAlarm.user_manual) {
                        $scope.attachusermanualcompletepath = burglarAlarm.user_manual;
                        $scope.attachusermanual = burglarAlarm.user_manual.split('\\').pop().split('/').pop();
                    }
                    $scope.burglarAlarm = burglarAlarm;
                });
            }
            /**
             * initialize ng tables
             * @params {burglarAlarm},  Array contain all burglarAlarm object
             */
        $scope.initializeNgTable = function(burglarAlarm) {
            $scope.burglarAlarmTable = new NgTableParams(utilityService.ngTableOptions(), {
                dataset: burglarAlarm
            });
        };
        /**
         * Watch for displaying page counts for the table
         */
        $scope.$watch('burglarAlarmArray', function(array) {
            if (angular.isDefined(array)) {
                if (angular.isDefined($scope.burglarAlarmTable)) {
                    $scope.burglarAlarmTable.settings(utilityService.ngTableCounts(array));
                }
            }
        });
        /**
         * $watch for the <input> element for table global filter.
         * 'tableFilter' is the ng-model of the <input> element (see .html)
         * Whenever the value changes, the table data is filtered and the table is reloaded. 
         * 
         * Note: This will not work for tables with server-side pagination. Filtering will also have to be done server-side.
         */
        $scope.$watch('tableFilter', function(needle) {
            if (angular.isDefined(needle)) {
                if (angular.isDefined($scope.burglarAlarmTable)) {
                    $scope.burglarAlarmTable.settings().dataset = $scope.burglarAlarmArray.filter(function(item) {
                        /**
                         * [haystack] Concatenate all the fields from the data object that needs to be searched against.
                         * @type {[String]}
                         */
                        var haystack = item.burglarAlarm_provider + item.model + item.type + item.service_provider;
                        // Build a regex to perform non-case-sensitive search
                        needle = utilityService.escapeRegExp(needle);
                        var re = new RegExp(needle, "i")
                        return haystack.search(re) > -1;
                    });
                    $scope.burglarAlarmTable.reload();
                }
            }
        });
        /**
         * Hard Delete burglarAlarm function
         * @params {burglarAlarm} Contain burglarAlarm object
         */
        $scope.deleteBurglarAlarm = function(BurglarAlarm) {
            if (BurglarAlarm) {
                utilityService.delConfirm(function(result) {
                    var message = "Cancel";
                    if (result) {
                        message = "Burglar alarm deleted Successfully";
                        var burglarAlarm = new BurglarAlarmService.burglarAlarm(BurglarAlarm);
                        burglarAlarm.$remove({
                            buildingId: $stateParams.buildingId
                        }, function(response) {
                            for (var i = 0; i < $scope.burglarAlarmTable.settings().dataset.length; i++) {
                                if (BurglarAlarm == $scope.burglarAlarmTable.settings().dataset[i]) {
                                    $scope.burglarAlarmTable.settings().dataset.splice(i, 1)
                                }
                            }
                            for (var i = 0; i < $scope.burglarAlarmArray.length; i++) {
                                if (BurglarAlarm == $scope.burglarAlarmArray[i]) {
                                    $scope.burglarAlarmArray.splice(i, 1);
                                }
                            }
                            $scope.burglarAlarmTable.reload().then(function(data) {
                                if (data.length === 0 && $scope.burglarAlarmTable.total() > 0) {
                                    $scope.burglarAlarmTable.page($scope.burglarAlarmTable.page() - 1);
                                    $scope.burglarAlarmTable.reload();
                                }
                            });
                            utilityService.flash.success(message);
                        })
                    }
                });
            }
        };
        /**
         * Soft delete burglarAlarm
         * @params {burglarAlarm} contain burglarAlarm object
         */
        $scope.softDelete = function(burglarAlarm) {
            utilityService.delConfirm(function(result) {
                var message = "Cancel";
                if (result) {
                    var burglarAlarmObj = burglarAlarm;
                    if (!burglarAlarmObj.updatedAt) {
                        burglarAlarmObj.updatedAt = "";
                    }
                    if (burglarAlarmObj.active == true) {
                        burglarAlarmObj.active = false;
                        message = "Burglar alarm Deactivated Successfully";
                    } else
                    if (burglarAlarmObj.active == false) {
                        burglarAlarmObj.active = true;
                        message = "Burglar alarm Activated Successfully";
                    }
                    burglarAlarmObj.updatedAt = new Date();
                    burglarAlarmObj.$update({
                        burglarAlarmId: burglarAlarm._id
                    }, function() {
                        utilityService.flash.success(message);
                    }, function(error) {
                        $scope.error = error
                    })
                }
            })
        };
        /**
         * generate dynamic year
         */
        $scope.initializeYear = function() {
            var year = new Date().getFullYear();
            var yearArray = [];
            var numbers = [];
            for (var i = year; i > 1969; i--) {
                yearArray.push(i)
            }
            for (var i = 1; i < 11; i++) {
                numbers.push(i)
            }
            $scope.yearArray = yearArray;
            $scope.numbers = numbers;
        };
        /**
         * Datepicker function to assign date to scope variable
         */
        $("#contractValidity").on("dp.change", function(event) {
            if (event.date != false) {
                if (angular.isUndefined($scope.burglarAlarm)) {
                    $scope.burglarAlarm = {};
                }
                if (event.date._strict == false) {
                    $scope.burglarAlarm.contract_validity = event.date.format('YYYY-MM-DD');
                } else {
                    $scope.burglarAlarm.contract_validity = event.date.utc().format('YYYY-MM-DD');
                }
            }
        });
        $("#noticePeriod").on("dp.change", function(event) {
            if (event.date != false) {
                if (angular.isUndefined($scope.burglarAlarm)) {
                    $scope.burglarAlarm = {};
                }
                 if (event.date._strict == false) {
                    $scope.burglarAlarm.notice_period = event.date.format('YYYY-MM-DD');
                } else {
                    $scope.burglarAlarm.notice_period = event.date.utc().format('YYYY-MM-DD');
                }
            }
        });
        $scope.attachOrientationDrawings = function(file) {
            if (file) {
                if (file.name.split('.').pop() !== 'pdf' && file.name.split('.').pop() !== 'txt') {
                    utilityService.flash.error('Only pdf and txt are accepted.');
                    return;
                } else {
                    $rootScope.$emit('processingContinue');
                    $scope.upload = Upload.upload({
                        url: "/api/burglaralarm/attachorientationdrawingsalarm",
                        method: 'POST',
                        data: {
                            file: file
                        }
                    }).progress(function(event) {}).success(function(data, status, headers, config) {
                        $scope.attachorientationdrawingscompletepath = data;
                        $scope.attachorientationdrawings = data.split('\\').pop().split('/').pop();
                    }).error(function(err) {
                        $scope.attachorientationdrawings = err;
                    });
                }
            }
        };
        $scope.removeAttachOrientationDrawings = function() {
            $scope.attachorientationdrawings = undefined;
        };
        $scope.attachContractAlarm = function(file) {
            if (file) {
                if (file.name.split('.').pop() !== 'pdf' && file.name.split('.').pop() !== 'txt') {
                    utilityService.flash.error('Only pdf and txt are accepted.');
                    return;
                } else {
                    $rootScope.$emit('processingContinue');
                    $scope.upload = Upload.upload({
                        url: "/api/burglaralarm/attachcontractalarm",
                        method: 'POST',
                        data: {
                            file: file
                        }
                    }).progress(function(event) {}).success(function(data, status, headers, config) {
                        $scope.attachcontractalarmcompletepath = data;
                        $scope.attachcontractalarm = data.split('\\').pop().split('/').pop();
                    }).error(function(err) {
                        $scope.attachcontractalarm = err;
                    });
                }
            }
        };
        $scope.removeAttachContractAlarm = function() {
            $scope.attachcontractalarm = undefined;
        };
        $scope.attachUserManual = function(file) {
            if (file) {
                if (file.name.split('.').pop() !== 'pdf' && file.name.split('.').pop() !== 'txt') {
                    utilityService.flash.error('Only pdf and txt are accepted.');
                    return;
                } else {
                    $rootScope.$emit('processingContinue');
                    $scope.upload = Upload.upload({
                        url: "/api/burglaralarm/attachusermanualalarm",
                        method: 'POST',
                        data: {
                            file: file
                        }
                    }).progress(function(event) {}).success(function(data, status, headers, config) {
                        $scope.attachusermanualcompletepath = data;
                        $scope.attachusermanual = data.split('\\').pop().split('/').pop();
                    }).error(function(err) {
                        $scope.attachusermanual = err;
                    });
                }
            }
        };
        $scope.removeAttachUserManual = function() {
            $scope.attachusermanual = undefined;
        };

         $scope.downloadAttachedDocumentBurglarAlarm = function(downloadpath) {
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
        
        $scope.cloneBurglarAlarm = function(burglarAlarm){
        	var urlPath = ASSETS.PATH.BURGLARALARM_CLONE;
            urlPath = urlPath.replace(":burglarAlarmId", burglarAlarm._id).replace(":buildingId", $stateParams.buildingId);
            $location.path(urlPath);
        };
        
        $scope.findOneBurglarAlarm = function() {
            BurglarAlarmService.burglarAlarm.get({
                buildingId: $stateParams.buildingId,
                burglarAlarmId: $stateParams.burglarAlarmId
            }, function(burglarAlarm) {
            	delete burglarAlarm._id;
                if (burglarAlarm.contract_validity) {
                    burglarAlarm.contract_validity = new Date(burglarAlarm.contract_validity).toISOString().slice(0, 10);
                }
                if (burglarAlarm.notice_period) {
                    burglarAlarm.notice_period = new Date(burglarAlarm.notice_period).toISOString().slice(0, 10);
                }
                if (burglarAlarm.contract) {
                    $scope.attachcontractalarmcompletepath = burglarAlarm.contract;
                    $scope.attachcontractalarm = burglarAlarm.contract.split('\\').pop().split('/').pop();
                }
                if (burglarAlarm.orientation_drawing) {
                    $scope.attachorientationdrawingscompletepath = burglarAlarm.orientation_drawing;
                    $scope.attachorientationdrawings = burglarAlarm.orientation_drawing.split('\\').pop().split('/').pop();
                }
                if (burglarAlarm.user_manual) {
                    $scope.attachusermanualcompletepath = burglarAlarm.user_manual;
                    $scope.attachusermanual = burglarAlarm.user_manual.split('\\').pop().split('/').pop();
                }
                $scope.burglarAlarm = burglarAlarm;
            });
        }
    }
})();