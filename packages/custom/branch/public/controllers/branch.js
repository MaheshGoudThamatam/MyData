'use strict';
/* jshint -W098 */
angular.module('mean.branch').controller('BranchController', function($scope, $rootScope, $stateParams, $location, Global, BranchService, UserService, Upload, $timeout, BRANCH, flash, MESSAGES, COURSE,$uibModal,$translate) {
    $scope.global = Global;
    $scope.package = {
        name: 'branch',
        featureName: 'Locations',
        name1: 'Country',
        name2: 'Zone',
        name3: 'City',
        modelName: 'Branch'
    };
    $scope.BRANCH = BRANCH;
    $scope.MESSAGES = MESSAGES;
    $scope.COURSE = COURSE;
    initializePermission($scope, $rootScope, $location, flash, $scope.package.featureName, MESSAGES);
    initializeBreadCrum($scope, $scope.package.name1, BRANCH.URL_PATH.LISTCOUNTRY,'Branches','Location Management');
    initializeDeletePopup($scope, $scope.package.name1, MESSAGES,$uibModal);
    initializePagination($scope, $rootScope, BranchService);
    initializeAdminList($scope, $rootScope, UserService);
    $scope.createBranch = function() {
        $scope.adminList();
        var cityId = $stateParams.cityId;
        $scope.cityId = cityId;
        $rootScope.cityId = $scope.cityId;
        $scope.addBranchBreadCrum();
        $scope.breadCrumAppend("Create");
        $scope.branch = {};
        $scope.branch.address = {};
        $scope.mainObject = $scope.branch;
        $scope.branch.adminList = [];
    };
    $scope.listBranch = function() {
        var cityId = $stateParams.cityId;      
        $scope.cityId = cityId;
        $rootScope.cityId = $scope.cityId;
        $scope.list({
            city: $scope.cityId
        });
        $scope.addBranchBreadCrum();
        $scope.breadCrumAppend("List");
    };
    $scope.addBranchBreadCrum = function() {
        $scope.breadCrumAddUrl($scope.package.name2, BRANCH.URL_PATH.LISTZONE.replace(':countryId', $rootScope.countryId));
        $scope.breadCrumAppendUrl($scope.package.name3, BRANCH.URL_PATH.LISTCITY.replace(':zoneId', $rootScope.zoneId));
        $scope.breadCrumAppendUrl($scope.package.modelName, BRANCH.URL_PATH.LISTBRANCH.replace(':cityId', $rootScope.cityId));
    };
    $scope.newBranch = function(urlPath, cityId) {
        $scope.cityId = $rootScope.cityId;
        urlPath = urlPath.replace(":cityId", cityId);
        $location.path(urlPath);
    };
    $scope.create = function(urlPath, isValid) {
        if ($scope.writePermission) {
            var cityId = $stateParams.cityId;
            if (isValid) {
                $scope.branch.cityId = $stateParams.cityId;
                var branch = new BranchService.cityBranch($scope.branch);
                branch.$save(function(response) {
                    urlPath = urlPath.replace(":cityId", cityId);
                    flash.setMessage(MESSAGES.BRANCH_ADD_SUCCESS, MESSAGES.SUCCESS);
                    $location.path(urlPath);
                }, function(error) {
                    $scope.error = error;
                });
            } else {
                $scope.submitted = true;
            }
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };
    $scope.remove = function(Branch) {
        if (Branch && $scope.deletePermission) {
            Branch = new BranchService.branch(Branch);
            Branch.$remove(function(response) {
                deleteObjectFromArray($scope.collection, Branch);
                $('#deletePopup').modal("hide");
                flash.setMessage(MESSAGES.BRANCH_DELETE_SUCCESS, MESSAGES.SUCCESS);
            });
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };
    $scope.update = function(urlPath, isValid) {
        if ($scope.updatePermission) {
            $scope.cityId = $rootScope.cityId;
            if (isValid) {
                var cityId = $scope.cityId;
                var branch = new BranchService.branch($scope.branch);
                if (!branch.updated) {
                    branch.updated = [];
                }
                branch.updated.push(new Date().getTime());
                branch.$update({
                    branchId: $stateParams.branchId
                }, function() {
                    urlPath = urlPath.replace(":cityId", cityId);
                    flash.setMessage(MESSAGES.CITY_UPDATE_SUCCESS, MESSAGES.SUCCESS);
                    $location.path(urlPath);
                }, function(error) {
                    $scope.error = error;
                });
            } else {
                $scope.submitted = true;
            }
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };
    $scope.findOne = function() {
        $scope.branch = {};
        if ($scope.updatePermission) {
            $scope.adminList();
            BranchService.branch.get({
                branchId: $stateParams.branchId
            }, function(branch) {
                $scope.branch = branch;
                $scope.mainObject = $scope.branch;
                $scope.cityId = $scope.branch.city._id;
                $rootScope.cityId = $scope.cityId;
                $scope.addBranchBreadCrum();
                $scope.breadCrumAppend("Edit");
                $scope.countryAdminList($scope.mainObject, {
                    'branch': $scope.branch._id
                });
            });
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };
    //for cancel button
    $scope.cancel = function(urlPath, cityId) {     
        urlPath = urlPath.replace(":cityId", cityId);
        $location.path(urlPath);
    }
    $scope.onBranchFileSelect = function(image) {
        if (angular.isArray(image)) {
            image = image[0];
        }
        // This is how I handle file types in client side
        if (image.type !== 'image/png' && image.type !== 'image/jpeg') {
            alert('Only PNG and JPEG are accepted.');
            return;
        }
        $rootScope.$emit('processingContinue');
        var urlPath = '/api/branch/picture/branchPicture';
        /* if(branch._id != null){
         urlPath = urlPath  '?branchId='  branch._id;
         }*/
        $scope.upload = Upload.upload({
            url: urlPath,
            method: 'POST',
            file: image
        }).progress(function(event) {
            // $scope.uploadProgress = Math.floor(event.loaded /
            // event.total);
            // $scope.$apply();
        }).success(function(data, status, headers, config) {
            if (config) {}
            $scope.uploadInProgress = false;
            // If you need uploaded file immediately
            $timeout(function() {
                $scope.branch.picture = data.picture;
                $scope.branch.thumbpicture = data.thumbpicture;
                $scope.branch.thumb150picture = data.thumb150picture;
            }, 3000);
        }).error(function(err) {
            $scope.uploadInProgress = false;
        });
    };
    $scope.modalDeleteBranch = function(branch) {
        $scope.removepop(branch._id);
        $scope.branch = branch;
        $('#deleteBranch').modal("show");
    };
    $scope.removepop = function(branchId) {
        $scope.branchId = branchId;
        $scope.users = {};
        UserService.branch.query({
            branchId: branchId
        }, function(branches) {
            if (branches[0].Message == 'There is no such Branch available.') {
                $scope.branchdeletetext = "No Courses are assigned would you like to delete branch?";
            } else {
                $scope.branchdeletetext = (branches.length)
                "Courses are assigned to this branch. Do you really want to delete this branch ? This action cannot be undone."
            }
        });
    };
    $scope.cancelBranch = function() {
        $('#deleteBranch').modal("hide");
    };
    $scope.onBranchFileSelect = function(image) {
        if (angular.isArray(image)) {
            image = image[0];
        }
        // This is how I handle file types in client side
        if (image.type !== 'image/png' && image.type !== 'image/jpeg') {
            alert('Only PNG and JPEG are accepted.');
            return;
        }
        $rootScope.$emit('processingContinue');
        var urlPath = '/api/branch/picture/branchPicture';
        /* if(branch._id != null){
         urlPath = urlPath  '?branchId='  branch._id;
         }*/
        $scope.upload = Upload.upload({
            url: urlPath,
            method: 'POST',
            file: image
        }).progress(function(event) {
            // $scope.uploadProgress = Math.floor(event.loaded /
            // event.total);
            // $scope.$apply();
        }).success(function(data, status, headers, config) {
            if (config) {}
            $scope.uploadInProgress = false;
            // If you need uploaded file immediately
            $timeout(function() {
                $scope.branch.picture = data.picture;
                $scope.branch.thumbpicture = data.thumbpicture;
                $scope.branch.thumb150picture = data.thumb150picture;
            }, 3000);
        }).error(function(err) {
            $scope.uploadInProgress = false;           
        });
    };
    $scope.editBranch = function(urlPath, id) {
        urlPath = urlPath.replace(":branchId", id);
        $location.path(urlPath);
    };
    /** <Desc : To set the rootscope object of branch and deleteing rootscope course object and redirection to branches batch list page>
     * @ PARAMS: <urlPath, Branch object>, ...
     * @ RETURNS: <>
     * @ <Mahesh> <16-feb-2016> <description of change>
     **/
    $scope.batchList = function(urlPath, branch) {
        if ($rootScope.courseobj) {
            delete $rootScope.courseobj;
        }
        $rootScope.cityId = $stateParams.cityId;
        $rootScope.branchobj = branch;
        urlPath = urlPath.replace(":courseId", branch._id);
        $location.path(urlPath);
    };
});