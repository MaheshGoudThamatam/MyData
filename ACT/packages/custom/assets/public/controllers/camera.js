/*
 * <Author:Akash Gupta>
 * <Date:07-06-2016>
 * <functions: addCamera, cancelCamera, editCamera, create, update, findAll, findOne, initializeNgTable, deleteCamera,
 * softDelete, initializeYear>
 */
(function() {
    'use strict';
    /* jshint -W098 */
    angular.module('mean.assets').controller('CameraController', CameraController);
    CameraController.$inject = ['$scope', 'Global', 'Assets', '$stateParams', '$location', 'ASSETS', 'CameraService', 'utilityService', 'NgTableParams', 'Upload', '$rootScope','$http'];

    function CameraController($scope, Global, Assets, $stateParams, $location, ASSETS, CameraService, utilityService, NgTableParams, Upload, $rootScope,$http) {
        $scope.global = Global;
        $scope.package = {
            name: 'camera'
        };
        $scope.cameraPhotos = [];
        $scope.cameraphotocompletepaths = [];
        $("#contractValidity").datetimepicker({
            format: 'YYYY-MM-DD',
            minDate: new Date()
        });
        $("#contractValidity").on("dp.change", function(event) {
            if (event.date != false) {
                if (angular.isUndefined($scope.camera)) {
                    $scope.camera = {};
                }
                if (event.date._strict == false) {
                    $scope.camera.contract_validity = event.date.format('YYYY-MM-DD');
                } else {
                    $scope.camera.contract_validity = event.date.utc().format('YYYY-MM-DD');
                }
            }
        });
        /**
         * Function to redirect to add camera form
         */
        $scope.addCamera = function() {
            var urlPath = ASSETS.PATH.CAMERA_ADD;
            urlPath = urlPath.replace(":buildingId", $stateParams.buildingId);
            $location.path(urlPath);
        };
        /**
         * Function to redirect to list camera page
         */
        $scope.cancelCamera = function() {
            var urlPath = ASSETS.PATH.CAMERA_LIST;
            urlPath = urlPath.replace(":buildingId", $stateParams.buildingId);
            $location.path(urlPath);
        };
        /**
         * Function to redirect to edit camera form
         * @params {camera} camera object
         */
        $scope.editCamera = function(camera) {
            var urlPath = ASSETS.PATH.CAMERA_EDIT;
            urlPath = urlPath.replace(":cameraId", camera._id).replace(":buildingId", $stateParams.buildingId);
            $location.path(urlPath);
        };
        /**
         * Create function for camera
         * @params {isValid}  check if form is valid or not(frontend validations)
         */
        $scope.create = function(isValid) {
            if (isValid) {
                $scope.camera.building = $stateParams.buildingId;
                $scope.camera.place_image = $scope.cameraphotocompletepath;
                $scope.camera.documentation = $scope.attachdocumentcompletepath;
                $scope.camera.contract = $scope.attachcontractcompletepath;
                $scope.camera.orientation_drawings = $scope.attachorientationdrawingscameracompletepath;
                $scope.camera.camera_documentation = $scope.attachcameradocumentationcompletepath;
                $scope.camera.cameraPhotos = $scope.cameraphotocompletepaths;
                var camera = new CameraService.camera($scope.camera);
                camera.$save({
                    buildingId: $stateParams.buildingId
                }, function(response) {
                    $scope.cancelCamera();
                    $scope.saved = true;
                    $scope.cameraPhotos = [];
                    $scope.cameraphotocompletepaths = [];
                    utilityService.flash.success("Camera System Created Successfully");
                }, function(error) {
                    $scope.error = error;
                });
            } else {
                utilityService.flash.error("You have some form errors, Please check again");
                $scope.submitted = true;
            }
        };
        /**
         * Update function for camera
         * @params {isValid}  check if form is valid or not(frontend validations)
         */
        $scope.update = function(isValid) {
            if (isValid) {
                $scope.camera.place_image = $scope.cameraphotocompletepath;
                $scope.camera.documentation = $scope.attachdocumentcompletepath;
                $scope.camera.contract = $scope.attachcontractcompletepath;
                $scope.camera.orientation_drawings = $scope.attachorientationdrawingscameracompletepath;
                $scope.camera.camera_documentation = $scope.attachcameradocumentationcompletepath;
                $scope.camera.cameraPhotos = $scope.cameraphotocompletepaths;
                var camera = $scope.camera;
                if (!camera.updatedAt) {
                    camera.updatedAt = [];
                }
                camera.updatedAt = new Date();
                camera.$update({
                    buildingId: $stateParams.buildingId,
                    cameraId: $stateParams.cameraId
                }, function() {
                    $scope.cancelCamera();
                    $scope.saved = true;
                    utilityService.flash.success("Camera System Updated Successfully");
                    $scope.cameraPhotos = [];
                    $scope.cameraphotocompletepaths = [];
                }, function(error) {
                    $scope.error = error;
                });
            } else {
                $scope.submitted = true;
                utilityService.flash.error("You have some form errors, Please check again");
            }
        };
        /**
         * fetch all camera lists
         */
        $scope.findAll = function() {
            CameraService.camera.query({
                buildingId: $stateParams.buildingId
            }, function(camera) {
                $scope.cameraArray = camera;
                $scope.initializeNgTable(camera);
            })
        };
        /**
         * fetch camera object details
         */
        $scope.findOne = function() {
            CameraService.camera.get({
                buildingId: $stateParams.buildingId,
                cameraId: $stateParams.cameraId
            }, function(camera) {
                if(camera.cameraPhotos.length>0){
                    for(var i=0;i<camera.cameraPhotos.length;i++){
                        var img = (camera.cameraPhotos[i].split('\\').pop().split('/').pop());
                        $scope.cameraPhotos.push(img);
                        $scope.cameraphotocompletepaths.push(camera.cameraPhotos[i]);
                    }
                }
                
                if (camera.contract_validity) {
                    camera.contract_validity = new Date(camera.contract_validity).toISOString().slice(0, 10);
                }
                if (camera.place_image) {
                    $scope.cameraphotocompletepath = camera.place_image;
                    $scope.cameraphoto = camera.place_image.split('\\').pop().split('/').pop();
                }
                if (camera.documentation) {
                    $scope.attachdocumentcompletepath = camera.documentation;
                    $scope.attachdocument = camera.documentation.split('\\').pop().split('/').pop();
                }
                if (camera.contract) {
                    $scope.attachcontractcompletepath = camera.contract;
                    $scope.attachcontract = camera.contract.split('\\').pop().split('/').pop();
                }
                if (camera.orientation_drawings) {
                    $scope.attachorientationdrawingscameracompletepath = camera.orientation_drawings;
                    $scope.attachorientationdrawingscamera = camera.orientation_drawings.split('\\').pop().split('/').pop();
                }
                if (camera.camera_documentation) {
                    $scope.attachcameradocumentationcompletepath = camera.camera_documentation;
                    $scope.attachcameradocumentation = camera.camera_documentation.split('\\').pop().split('/').pop();
                }
                $scope.camera = camera;
            });
        };
        /**
         * initialize ng tables
         * @params {camera},  Array contain all camera object
         */
        $scope.initializeNgTable = function(camera) {
            $scope.cameraTable = new NgTableParams(utilityService.ngTableOptions(), {
                dataset: camera
            });
        };
        /**
         * Watch for displaying page counts for the table
         */
        $scope.$watch('cameraArray', function(array) {
            if (angular.isDefined(array)) {
                if (angular.isDefined($scope.cameraTable)) {
                    $scope.cameraTable.settings(utilityService.ngTableCounts(array));
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
                if (angular.isDefined($scope.cameraTable)) {
                    $scope.cameraTable.settings().dataset = $scope.cameraArray.filter(function(item) {
                        /**
                         * [haystack] Concatenate all the fields from the data object that needs to be searched against.
                         * @type {[String]}
                         */
                        var haystack = item.camera_provider + item.model + item.name + item.service_provider + item.resolution;
                        // Build a regex to perform non-case-sensitive search
                        needle = utilityService.escapeRegExp(needle);
                        var re = new RegExp(needle, "i")
                        return haystack.search(re) > -1;
                    });
                    $scope.cameraTable.reload();
                }
            }
        });
        /**
         * Hard Delete camera function
         * @params {Camera} Contain camera object
         */
        $scope.deleteCamera = function(Camera) {
            if (Camera) {
                utilityService.delConfirm(function(result) {
                    var message = "Cancel";
                    if (result) {
                        message = "Camera System Deleted Successfully";
                        var camera = new CameraService.camera(Camera);
                        camera.$remove({
                            buildingId: $stateParams.buildingId
                        }, function(response) {
                            for (var i = 0; i < $scope.cameraTable.settings().dataset.length; i++) {
                                if (Camera == $scope.cameraTable.settings().dataset[i]) {
                                    $scope.cameraTable.settings().dataset.splice(i, 1)
                                }
                            }
                            for (var i = 0; i < $scope.cameraArray.length; i++) {
                                if (Camera == $scope.cameraArray[i]) {
                                    $scope.cameraArray.splice(i, 1);
                                }
                            }
                            $scope.cameraTable.reload().then(function(data) {
                                if (data.length === 0 && $scope.cameraTable.total() > 0) {
                                    $scope.cameraTable.page($scope.cameraTable.page() - 1);
                                    $scope.cameraTable.reload();
                                }
                            });
                            utilityService.flash.success(message);
                        })
                    }
                });
            }
        };
        /**
         * Soft delete camera
         * @params {camera} contain camera object
         */
        $scope.softDelete = function(camera) {
            utilityService.delConfirm(function(result) {
                var message = "Cancel";
                if (result) {
                    var cameraObj = camera;
                    if (!cameraObj.updatedAt) {
                        cameraObj.updatedAt = "";
                    }
                    if (cameraObj.active == true) {
                        cameraObj.active = false;
                        message = "Camera System Deactivated Successfully";
                    } else
                    if (cameraObj.active == false) {
                        cameraObj.active = true;
                        message = "Camera System Activated Successfully";
                    }
                    cameraObj.updatedAt = new Date();
                    cameraObj.$update({
                        cameraId: camera._id
                    }, function() {
                        utilityService.flash.success(message);
                    }, function(error) {
                        $scope.error = error
                    })
                }
            })
        };
        /**
         * generate year array(dynamic)
         * & array contain number 1 to 10
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
         * Select first radio button as default
         */
        $scope.defaultRadio = function() {
            if (angular.isUndefined($scope.camera)) {
                $scope.camera = {};
            };
            if (angular.isUndefined($scope.camera.usability)) {
                $scope.camera.usability = {};
            };
            $scope.camera.usability.rotation = 180;
        };
        $scope.attachPhoto = function(files) {
            console.log(files);
        	$scope.files = files;
            if (files && files.length) {
            	for(var i=0;i<files.length;i++){
            	if (files[i].name.split('.').pop() !== 'jpg' && files[i].name.split('.').pop() !== 'jpeg') {
                    utilityService.flash.error('Only jpg and jpeg are accepted.');
                    return;
            	}
            else {
                $rootScope.$emit('processingContinue');
                $scope.upload = Upload.upload({
                    url: "/api/camerasystem/fileupload",
                    method: 'POST',
                    data: {
                        file: files[i]
                    }
                }).progress(function(event) {}).success(function(data, status, headers, config) {
                	$scope.cameraphotocompletepaths.push(data);
                    $scope.cameraphoto = data.split('\\').pop().split('/').pop();
                    $scope.cameraPhotos.push($scope.cameraphoto);
                }).error(function(err) {
                    $scope.cameraphoto = err;
                });
                console.log($scope.upload)
            }
            }
            }
        };
        
        $scope.removeCameraPlaced = function(index) {
            $scope.cameraPhotos.splice(index,1);
            $scope.cameraphotocompletepaths.splice(index,1);
        };
        $scope.attachDocumentation = function(file) {
            if (file) {
                if (file.name.split('.').pop() !== 'pdf' && file.name.split('.').pop() !== 'txt') {
                    utilityService.flash.error('Only pdf and txt are accepted.');
                    return;
                } else {
                    $rootScope.$emit('processingContinue');
                    $scope.upload = Upload.upload({
                        url: "/api/camerasystem/attachdocument",
                        method: 'POST',
                        data: {
                            file: file
                        }
                    }).progress(function(event) {}).success(function(data, status, headers, config) {
                        $scope.attachdocumentcompletepath = data;
                        $scope.attachdocument = data.split('\\').pop().split('/').pop();
                    }).error(function(err) {
                        $scope.attachdocument = err;
                    });
                }
            }
        };
        $scope.removeAttachDocument = function() {
            $scope.attachdocument = undefined;
        };
        $scope.attachContract = function(file) {
            if (file) {
                if (file.name.split('.').pop() !== 'pdf' && file.name.split('.').pop() !== 'txt') {
                    utilityService.flash.error('Only pdf and txt are accepted.');
                    return;
                } else {
                    $rootScope.$emit('processingContinue');
                    $scope.upload = Upload.upload({
                        url: "/api/camerasystem/attachcontract",
                        method: 'POST',
                        data: {
                            file: file
                        }
                    }).progress(function(event) {}).success(function(data, status, headers, config) {
                        $scope.attachcontractcompletepath = data;
                        $scope.attachcontract = data.split('\\').pop().split('/').pop();
                    }).error(function(err) {
                        $scope.attachcontract = err;
                    });
                }
            }
        };
        $scope.removeAttachContract = function() {
            $scope.attachcontract = undefined;
        };
        $scope.attachOrientationDrawingsCamera = function(file) {
            if (file) {
                if (file.name.split('.').pop() !== 'pdf' && file.name.split('.').pop() !== 'txt') {
                    utilityService.flash.error('Only pdf and txt are accepted.');
                    return;
                } else {
                    $rootScope.$emit('processingContinue');
                    $scope.upload = Upload.upload({
                        url: "/api/camerasystem/attachorientationdrawingscamera",
                        method: 'POST',
                        data: {
                            file: file
                        }
                    }).progress(function(event) {}).success(function(data, status, headers, config) {
                        $scope.attachorientationdrawingscameracompletepath = data;
                        $scope.attachorientationdrawingscamera = data.split('\\').pop().split('/').pop();
                    }).error(function(err) {
                        $scope.attachorientationdrawingscamera = err;
                    });
                }
            }
        };
        $scope.removeAttachOrientationDrawingsCamera = function() {
            $scope.attachorientationdrawingscamera = undefined;
        };
        $scope.attachCameraDocumentation = function(file) {
            if (file) {
                if (file.name.split('.').pop() !== 'pdf' && file.name.split('.').pop() !== 'txt') {
                    utilityService.flash.error('Only pdf and txt are accepted.');
                    return;
                } else {
                    $rootScope.$emit('processingContinue');
                    $scope.upload = Upload.upload({
                        url: "/api/camerasystem/attachcameradocumentation",
                        method: 'POST',
                        data: {
                            file: file
                        }
                    }).progress(function(event) {}).success(function(data, status, headers, config) {
                        $scope.attachcameradocumentationcompletepath = data;
                        $scope.attachcameradocumentation = data.split('\\').pop().split('/').pop();
                    }).error(function(err) {
                        $scope.attachcameradocumentation = err;
                    });
                }
            }
        };
        $scope.removeAttachCameraDocumentation = function() {
            $scope.attachcameradocumentation = undefined;
        };

        $scope.downloadAttachedDocumentCameraSystem = function(downloadpath) {
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
        $scope.cloneCamera = function(camera){
        	var urlPath = ASSETS.PATH.CAMERA_CLONE;
            urlPath = urlPath.replace(":cameraId", camera._id).replace(":buildingId", $stateParams.buildingId);
            $location.path(urlPath);
        };
        
        $scope.findOneCamera = function() {
            CameraService.camera.get({
                buildingId: $stateParams.buildingId,
                cameraId: $stateParams.cameraId
            }, function(camera) {
            	delete camera._id;
                if (camera.contract_validity) {
                    camera.contract_validity = new Date(camera.contract_validity).toISOString().slice(0, 10);
                }
                if (camera.place_image) {
                    $scope.cameraphotocompletepath = camera.place_image;
                    $scope.cameraphoto = camera.place_image.split('\\').pop().split('/').pop();
                }
                if (camera.documentation) {
                    $scope.attachdocumentcompletepath = camera.documentation;
                    $scope.attachdocument = camera.documentation.split('\\').pop().split('/').pop();
                }
                if (camera.contract) {
                    $scope.attachcontractcompletepath = camera.contract;
                    $scope.attachcontract = camera.contract.split('\\').pop().split('/').pop();
                }
                if (camera.orientation_drawings) {
                    $scope.attachorientationdrawingscameracompletepath = camera.orientation_drawings;
                    $scope.attachorientationdrawingscamera = camera.orientation_drawings.split('\\').pop().split('/').pop();
                }
                if (camera.camera_documentation) {
                    $scope.attachcameradocumentationcompletepath = camera.camera_documentation;
                    $scope.attachcameradocumentation = camera.camera_documentation.split('\\').pop().split('/').pop();
                }
                $scope.camera = camera;
            });
        };
    }
})();