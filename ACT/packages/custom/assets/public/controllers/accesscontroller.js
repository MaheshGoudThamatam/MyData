(function() {
    'use strict';
    /* jshint -W098 */
    angular.module('mean.assets').controller('AssetsAccessControlController', AssetsAccessControlController);
    AssetsAccessControlController.$inject = ['$scope', 'Global', 'Assets', '$stateParams', 'ASSETS', '$location', 'AccessControlService', 'utilityService', 'NgTableParams', 'Upload', '$rootScope'];

    function AssetsAccessControlController($scope, Global, Assets, $stateParams, ASSETS, $location, AccessControlService, utilityService, NgTableParams, Upload, $rootScope) {
        $scope.global = Global;
        $scope.package = {
            name: 'assets'
        };
        $("#contractValidity").datetimepicker({
            format: 'YYYY-MM-DD',
            minDate: new Date()
        });
        $scope.addAccessController = function() {
            var buildingId = $stateParams.buildingId;
            var urlPath = ASSETS.PATH.ASSETS_ACCESSCONTROL_CREATE.replace(":buildingId", buildingId);
            $location.path(urlPath)
        };
        $scope.cancelAccessControl = function() {
            var buildingId = $stateParams.buildingId;
            var urlPath = ASSETS.PATH.ASSETS_ACCESSCONTROL_LIST.replace(":buildingId", buildingId);
            $location.path(urlPath)
        };
        $scope.createAccessControl = function(isValid) {
            if (isValid) {
                $scope.accessControl.building = $stateParams.buildingId;
                $scope.accessControl.contract = $scope.attachcontractaccesscontrolcompletepath;
                $scope.accessControl.orientation_drawing = $scope.attachorientationdrawingsaccesscontrolcompletepath;
                $scope.accessControl.user_manual = $scope.attachusermanualaccesscontrolcompletepath;
                var accessControlCreate = new AccessControlService.accessControl($scope.accessControl);
                accessControlCreate.$save({
                    buildingId: $stateParams.buildingId
                }, function(response) {
                    var buildingId = $stateParams.buildingId;
                    $scope.saved = true;
                    var urlPath = ASSETS.PATH.ASSETS_ACCESSCONTROL_LIST;
                    urlPath = urlPath.replace(":buildingId", buildingId);
                    $location.path(urlPath);
                }, function(error) {
                    $scope.error = error;
                });
            } else {
                $scope.submitted = true;
            }
        };
        $scope.findAccessControl = function() {
            AccessControlService.accessControl.query({
                buildingId: $stateParams.buildingId
            }, function(accesscontrolarraylist) {
                $scope.accesscontrolArray = accesscontrolarraylist;
                $scope.initializeNgTable(accesscontrolarraylist);
            }, function(error) {
                $scope.error = error;
            });
        };
        $scope.initializeNgTable = function(accesscontrolarraylist) {
            $scope.accesscontrolTable = new NgTableParams(utilityService.ngTableOptions(), {
                dataset: accesscontrolarraylist
            });
        };
        /**
         * Watch for displaying page counts for the table
         */
        $scope.$watch('accesscontrolArray', function(array) {
            if (angular.isDefined(array)) {
                if (angular.isDefined($scope.accesscontrolTable)) {
                    $scope.accesscontrolTable.settings(utilityService.ngTableCounts(array));
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
                if (angular.isDefined($scope.accesscontrolTable)) {
                    $scope.accesscontrolTable.settings().dataset = $scope.accesscontrolArray.filter(function(item) {
                        /**
                         * [haystack] Concatenate all the fields from the data object that needs to be searched against.
                         * @type {[String]}
                         */
                        var haystack = item.accessControl_provider + item.model + item.lock;
                        // Build a regex to perform non-case-sensitive search
                        needle = utilityService.escapeRegExp(needle);
                        var re = new RegExp(needle, "i")
                        return haystack.search(re) > -1;
                    });
                    $scope.accesscontrolTable.reload();
                }
            }
        });
        $scope.editAccessControl = function(accesscontrol) {
            var buildingId = $stateParams.buildingId;
            var urlPath = ASSETS.PATH.ASSETS_ACCESSCONTROL_EDIT;
            urlPath = urlPath.replace(":buildingId", buildingId);
            urlPath = urlPath.replace(":accesscontrolId", accesscontrol._id);
            $location.path(urlPath);
        };
        $scope.findOne = function() {
            AccessControlService.accessControl.get({
                buildingId: $stateParams.buildingId,
                accessId: $stateParams.accesscontrolId
            }, function(accessControl) {
                if (accessControl.contract_validity) {
                    accessControl.contract_validity = new Date(accessControl.contract_validity).toISOString().slice(0, 10);
                }
                if (accessControl.contract) {
                    $scope.attachcontractaccesscontrolcompletepath = accessControl.contract;
                    $scope.attachcontractaccesscontrol = accessControl.contract.split('\\').pop().split('/').pop();
                }
                if (accessControl.orientation_drawing) {
                    $scope.attachorientationdrawingsaccesscontrolcompletepath = accessControl.orientation_drawing;
                    $scope.attachorientationdrawingsaccesscontrol = accessControl.orientation_drawing.split('\\').pop().split('/').pop();
                }
                if (accessControl.user_manual) {
                    $scope.attachusermanualaccesscontrolcompletepath = accessControl.user_manual;
                    $scope.attachusermanualaccesscontrol = accessControl.user_manual.split('\\').pop().split('/').pop();
                }
                $scope.accessControl = accessControl;
            }, function(error) {
                $scope.error = error;
            });
        };
        $scope.saveEditedAccessControl = function(isValid) {
            if (isValid) {
                $scope.accessControl.contract = $scope.attachcontractaccesscontrolcompletepath;
                $scope.accessControl.orientation_drawing = $scope.attachorientationdrawingsaccesscontrolcompletepath;
                $scope.accessControl.user_manual = $scope.attachusermanualaccesscontrolcompletepath;
                var accesscontroldetail = $scope.accessControl;
                accesscontroldetail.$update({
                    buildingId: $stateParams.buildingId,
                    accessId: $stateParams.accesscontrolId
                }, function(response) {
                    var buildingId = $stateParams.buildingId;
                    $scope.saved = true;
                    var urlPath = ASSETS.PATH.ASSETS_ACCESSCONTROL_LIST;
                    urlPath = urlPath.replace(":buildingId", buildingId);
                    $location.path(urlPath);
                }, function(error) {
                    $scope.error = error;
                });
            } else {
                $scope.submitted = true;
            }
        };
        $scope.deleteAccessControl = function(accesscontrol) {
            if (accesscontrol) {
                utilityService.delConfirm(function(result) {
                    var message = "Cancel";
                    if (result) {
                        message = "Access control  Deleted Successfully";
                        var accessControl = new AccessControlService.accessControl(accesscontrol);
                        accessControl.$remove({
                            buildingId: $stateParams.buildingId
                        }, function(response) {
                            for (var i = 0; i < $scope.accesscontrolTable.settings().dataset.length; i++) {
                                if (accesscontrol == $scope.accesscontrolTable.settings().dataset[i]) {
                                    $scope.accesscontrolTable.settings().dataset.splice(i, 1)
                                }
                            }
                            for (var i = 0; i < $scope.accesscontrolArray.length; i++) {
                                if (accesscontrol == $scope.accesscontrolArray[i]) {
                                    $scope.accesscontrolArray.splice(i, 1);
                                }
                            }
                            $scope.accesscontrolTable.reload().then(function(data) {
                                if (data.length === 0 && $scope.accesscontrolTable.total() > 0) {
                                    $scope.accesscontrolTable.page($scope.accesscontrolTable.page() - 1);
                                    $scope.accesscontrolTable.reload();
                                }
                            });
                            utilityService.flash.success(message);
                        })
                    }
                });
            }
        };
        $scope.softDelete = function(accesscontrol) {
            utilityService.delConfirm(function(result) {
                var message = "Cancel";
                if (result) {
                    var accesscontrolObj = accesscontrol;
                    if (!accesscontrolObj.updatedAt) {
                        accesscontrolObj.updatedAt = "";
                    }
                    if (accesscontrolObj.active == true) {
                        accesscontrolObj.active = false;
                        message = "Accesscontrol Deactivated Successfully";
                    } else
                    if (accesscontrolObj.active == false) {
                        accesscontrolObj.active = true;
                        message = "Accesscontrol Activated Successfully";
                    }
                    accesscontrolObj.updatedAt = new Date();
                    accesscontrolObj.$update({
                        accessId: accesscontrol._id
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
                if (angular.isUndefined($scope.accessControl)) {
                    $scope.accessControl = {};
                }
                if (event.date._strict == false) {
                    $scope.accessControl.contract_validity = event.date.format('YYYY-MM-DD');
                } else {
                    $scope.accessControl.contract_validity = event.date.utc().format('YYYY-MM-DD');
                }
            }
        });
        /**
         * Datepicker function to assign date to scope variable
         */
        $scope.attachContractAccessControl = function(file) {
            if (file) {
                if (file.name.split('.').pop() !== 'pdf' && file.name.split('.').pop() !== 'txt') {
                    utilityService.flash.error('Only pdf and txt are accepted.');
                    return;
                } else {
                    $rootScope.$emit('processingContinue');
                    $scope.upload = Upload.upload({
                        url: "/api/accesscontrol/attachcontractaccesscontrol",
                        method: 'POST',
                        data: {
                            file: file
                        }
                    }).progress(function(event) {}).success(function(data, status, headers, config) {
                        $scope.attachcontractaccesscontrolcompletepath = data;
                        $scope.attachcontractaccesscontrol = data.split('\\').pop().split('/').pop();
                    }).error(function(err) {
                        $scope.attachcontractaccesscontrol = err;
                    });
                }
            }
        };
        $scope.removeAttachContractAccessControl = function() {
            $scope.attachcontractaccesscontrol = undefined;
        };
        $scope.attachOrientationDrawingsAccessControl = function(file) {
            if (file) {
                if (file.name.split('.').pop() !== 'pdf' && file.name.split('.').pop() !== 'txt') {
                    utilityService.flash.error('Only pdf and txt are accepted.');
                    return;
                } else {
                    $rootScope.$emit('processingContinue');
                    $scope.upload = Upload.upload({
                        url: "/api/accesscontrol/attachorientationdrawingsaccesscontrol",
                        method: 'POST',
                        data: {
                            file: file
                        }
                    }).progress(function(event) {}).success(function(data, status, headers, config) {
                        $scope.attachorientationdrawingsaccesscontrolcompletepath = data;
                        $scope.attachorientationdrawingsaccesscontrol = data.split('\\').pop().split('/').pop();
                    }).error(function(err) {
                        $scope.attachorientationdrawingsaccesscontrol = err;
                    });
                }
            }
        };
        $scope.removeAttachOrientationDrawingsAccessControl = function() {
            $scope.attachorientationdrawingsaccesscontrol = undefined;
        };
        $scope.attachUserManualAccessControl = function(file) {
            if (file) {
                if (file.name.split('.').pop() !== 'pdf' && file.name.split('.').pop() !== 'txt') {
                    utilityService.flash.error('Only pdf and txt are accepted.');
                    return;
                } else {
                    $rootScope.$emit('processingContinue');
                    $scope.upload = Upload.upload({
                        url: "/api/accesscontrol/attachusermanualaccesscontrol",
                        method: 'POST',
                        data: {
                            file: file
                        }
                    }).progress(function(event) {}).success(function(data, status, headers, config) {
                        $scope.attachusermanualaccesscontrolcompletepath = data;
                        $scope.attachusermanualaccesscontrol = data.split('\\').pop().split('/').pop();
                    }).error(function(err) {
                        $scope.attachusermanualaccesscontrol = err;
                    });
                }
            }
        };
        $scope.removeAttachUserManualAccessControl = function() {
            $scope.attachusermanualaccesscontrol = undefined;
        };

          $scope.downloadAttachedDocumentAccessControl = function(downloadpath) {
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
        
        $scope.cloneAccessControl = function(accesscontrol){
        	var buildingId = $stateParams.buildingId;
            var urlPath = ASSETS.PATH.ASSETS_ACCESSCONTROL_CLONE;
            urlPath = urlPath.replace(":buildingId", buildingId);
            urlPath = urlPath.replace(":accesscontrolId", accesscontrol._id);
            $location.path(urlPath);
        };
        
        $scope.findOneAccessControl = function() {
            AccessControlService.accessControl.get({
                buildingId: $stateParams.buildingId,
                accessId: $stateParams.accesscontrolId
            }, function(accessControl) {
            	delete accessControl._id;
                if (accessControl.contract_validity) {
                    accessControl.contract_validity = new Date(accessControl.contract_validity).toISOString().slice(0, 10);
                }
                if (accessControl.contract) {
                    $scope.attachcontractaccesscontrolcompletepath = accessControl.contract;
                    $scope.attachcontractaccesscontrol = accessControl.contract.split('\\').pop().split('/').pop();
                }
                if (accessControl.orientation_drawing) {
                    $scope.attachorientationdrawingsaccesscontrolcompletepath = accessControl.orientation_drawing;
                    $scope.attachorientationdrawingsaccesscontrol = accessControl.orientation_drawing.split('\\').pop().split('/').pop();
                }
                if (accessControl.user_manual) {
                    $scope.attachusermanualaccesscontrolcompletepath = accessControl.user_manual;
                    $scope.attachusermanualaccesscontrol = accessControl.user_manual.split('\\').pop().split('/').pop();
                }
                $scope.accessControl = accessControl;
            }, function(error) {
                $scope.error = error;
            });
        };
    }
})();