'use strict';
/* jshint -W098 */

angular.module('mean.role').controller('RoleController', function ($scope, $rootScope, $stateParams, $location, Global, RoleService, FeatureService, FeatureRoleService, $timeout, ROLE, PROFILE, $http, UserService, MESSAGES, flash, $uibModal,$translate) {
    $scope.global = Global;
    $scope.package = {
        name: 'Role',
        modelName: 'Role',
        featureName: 'Roles'
    };
    $scope.ROLE = ROLE;
    $scope.MESSAGES = MESSAGES;

    initializePermission($scope, $rootScope, $location, flash, $scope.package.featureName, MESSAGES);

    initializeBreadCrum($scope, $scope.package.modelName, ROLE.URL_PATH.LIST_ROLE);

    initializePagination($scope, $rootScope, RoleService);

    initializeDeletePopup($scope, $scope.package.modelName, MESSAGES, $uibModal);


    $scope.newRole = function () {
        $location.path(ROLE.URL_PATH.CREATE_ROLE);
    };

    $scope.addFeature = function (featureRole) {
        var found = false;
        var foundIndex = -1;
        for (var i = 0; i < $scope.role.features.length; i++) {
            if ($scope.role.features[i].feature._id == featureRole.feature._id) {
                found = true;
                foundIndex = i;
            }
        }
        if (found) {
            $scope.role.features.splice(foundIndex, 1);
            featureRole.isRead=false;
            featureRole.isWrite=false;
            featureRole.isUpdate=false;
            featureRole.isDelete= false;
        } else {
            $scope.role.features.push(featureRole);
            featureRole.isRead=true;
            featureRole.isWrite=true;
            featureRole.isUpdate=true;
            featureRole.isDelete= true;
        }
    };


    $scope.create = function (isValid) {
        if ($scope.writePermission) {
            var role = new RoleService.role($scope.role);
            role.$save(function (response) {
                flash.setMessage(MESSAGES.ROLE_ADD_SUCCESS, MESSAGES.SUCCESS);
                $location.path(ROLE.URL_PATH.LIST_ROLE);
            }, function (error) {
                $scope.error = error;
            });
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };
    $scope.removepop = function (role) {
        $scope.deleteObj = role;
        UserService.users.query({
            role: role._id
        }, function (users) {
            if (users.length == 0) {
                $scope.popupMessage = "No users are assigned to this role. Do you really want to delete this role ? This action cannot be undone."
            } else {
                $scope.popupMessage = (users.length) + "  Users are assigned to this role. Do you really want to delete this role ? This action cannot be undone."
            }
            $scope.modalDeletePopup(role);
        });
    };
    $scope.remove = function (Role) {
        if (Role && $scope.deletePermission) {
            var role = new RoleService.role(Role);
            role.$remove(function (response) {
                deleteObjectFromArray($scope.collection, Role);
                $('#deletePopup').modal("hide");
                flash.setMessage(MESSAGES.ROLE_DELETE_SUCCESS, MESSAGES.SUCCESS);
                $location.path(ROLE.URL_PATH.LIST_ROLE);

            });
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };

    //Update Role
    $scope.update = function (isValid) {
        if ($scope.updatePermission) {
            if (isValid) {
                var role = new RoleService.role($scope.role);
                if (!role.updated) {
                    role.updated = [];
                }
                role.updated.push(new Date().getTime());
                role.$update({
                    roleId: $stateParams.roleId
                }, function () {
                    flash.setMessage(MESSAGES.FEATURE_UPDATE_SUCCESS, MESSAGES.SUCCESS);
                    $location.path(ROLE.URL_PATH.LIST_ROLE);
                }, function (error) {
                    $scope.error = error;
                });
            } else {
                alert("Some field is missing.");
                $scope.submitted = true;
            }
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };

    $scope.show = function (role) {
        $rootScope.role = role;
        $location.path('/admin/role/' + role._id + '/show');
    };

    $scope.roleEdit = function () {
        $scope.breadCrumAdd("Edit");
    };

    $scope.createRole = function () {
        $scope.role = {};
        $scope.role.features = [];
        $scope.breadCrumAdd("Create");
    };

    $scope.showRole = function () {
        $scope.breadCrumAdd("Show");
    };


    $scope.findOne = function () {
        if ($scope.updatePermission) {
            $scope.featureList();
            RoleService.role.get({
                roleId: $stateParams.roleId
            }, function (role) {
                $scope.role = role;
                $scope.rolefeatureList();
            });
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };

    $scope.cancel = function () {
        $location.path(ROLE.URL_PATH.LIST_ROLE);
    };

    $scope.featureList = function () {
        if ($scope.writePermission) {
            $scope.features = [];
            if (angular.isUndefined($rootScope.featureList)) {
                FeatureService.feature.query(function (features) {
                    $scope.features = features;
                    $rootScope.featureList = features;
                    $scope.createRoleFeatures();
                });
            } else {
                $scope.features = $rootScope.featureList;
                $scope.createRoleFeatures();
            }
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };

    $scope.createRoleFeatures = function () {
        $scope.roleFeatures = [];
        for (var i = 0; i < $scope.features.length; i++) {
            var featureRole = {};
            featureRole.feature = $scope.features[i];
            featureRole.isRead = false;
            featureRole.isUpdate = false;
            featureRole.isWrite = false;
            featureRole.isDelete = false;
            $scope.roleFeatures.push(featureRole);
        }
    };

    $scope.rolefeatureList = function () {
        $scope.role.features = [];
        FeatureRoleService.role.query({roleId: $scope.role._id}, function (roleFeatures) {
            for (var a = 0; a < roleFeatures.length; a++) {
                for (var i = 0; i < $scope.roleFeatures.length; i++) {
                    if ($scope.roleFeatures[i].feature._id === roleFeatures[a].feature._id) {
                        $scope.roleFeatures[i].selected = true;
                        $scope.roleFeatures[i].isWrite = roleFeatures[a].isWrite;
                        $scope.roleFeatures[i].isRead = roleFeatures[a].isRead;
                        $scope.roleFeatures[i].isUpdate = roleFeatures[a].isUpdate;
                        $scope.roleFeatures[i].isDelete = roleFeatures[a].isDelete;
                        $scope.role.features.push($scope.roleFeatures[i]);
                    }
                }
            }
        });
    };
    $scope.editRole = function (urlPath, id) {
        urlPath = urlPath.replace(":roleId", id);
        $location.path(urlPath);
    };
});