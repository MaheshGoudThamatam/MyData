'use strict';

angular.module('mean.role').controller('FeatureCategoryController', function ($scope, Global, FeatureCategoryService, $stateParams, $location, MESSAGES, $rootScope, ROLE, flash, FeatureService, $uibModal,$translate
) {
    $scope.global = Global;
    $scope.SERVICE = FeatureCategoryService;
    $scope.MESSAGES = MESSAGES;
    $scope.ROLE = ROLE;
    $scope.package = {
        name: 'Role',
        modelName: 'FeatureCategory',
        featureName: 'FeatureCategories'
    };

    initializePagination($scope, $rootScope, $scope.SERVICE);
    initializeDeletePopup($scope, $scope.package.modelName, MESSAGES, $uibModal);
    initializePermission($scope, $rootScope, $location, flash, $scope.package.featureName, MESSAGES);
    initializeBreadCrum($scope, $scope.package.modelName, ROLE.URL_PATH.FEATURECATEGORYLIST,"Feature Category", "Feature Category Management");

    $scope.createFeatureCategory = function () {
        $scope.featureCategory = {};
        $scope.breadCrumAdd("Create");
    };

    $scope.loadFeatureCategory = function () {
        $scope.featureCategory = {};
        $scope.breadCrumAdd("Edit");
        $scope.findOne();
    };

    $scope.detailFeatureCategory = function () {
        $scope.featureCategory = {};
        $scope.breadCrumAdd("Details");
        $scope.findOne();
    };


    $scope.create = function (isValid) {
        if ($scope.writePermission) {
            if (isValid) {
                var featureCategory = new FeatureCategoryService.featureCategory($scope.featureCategory)
                featureCategory.$save(function (response) {
                    flash.setMessage(MESSAGES.FEATURECATEGORY_ADD_SUCCESS, MESSAGES.SUCCESS);
                    $location.path(ROLE.URL_PATH.FEATURECATEGORYLIST);
                }, function (error) {
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

    $scope.remove = function (FeatureCategory) {
        if (FeatureCategory && $scope.deletePermission) {
            var featureCategory = new FeatureCategoryService.featureCategory(FeatureCategory);
            featureCategory.$remove(function (response) {
                if ($scope.collection) {
                    deleteObjectFromArray($scope.collection, FeatureCategory);
                }
                $('#deletePopup').modal("hide");
                flash.setMessage(MESSAGES.FEATURECATEGORY_DELETE_SUCCESS, MESSAGES.SUCCESS);
                $location.path(ROLE.URL_PATH.FEATURECATEGORYLIST);
            });
        }
        else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }

    };
    $scope.update = function (isValid) {
        if ($scope.updatePermission) {
            if (isValid) {
                var featureCategory = $scope.featureCategory;
                if (!featureCategory.updated) {
                    featureCategory.updated = [];
                }
                featureCategory.updated.push(new Date().getTime());

                featureCategory.$update(function () {
                    flash.setMessage(MESSAGES.FEATURECATEGORY_UPDATE_SUCCESS,
                        MESSAGES.SUCCESS);
                    $location.path(ROLE.URL_PATH.FEATURECATEGORYLIST);
                }, function (error) {
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
    $scope.findOne = function () {
        if ($scope.updatePermission) {
            FeatureCategoryService.featureCategory.get({
                featureCategoryId: $stateParams.featureCategoryId
            }, function (featureCategory) {
                $scope.featureCategory = featureCategory;
            });
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };
    $scope.cancelFeatureCategory = function () {
        $location.path(ROLE.URL_PATH.FEATURECATEGORYLIST);
    };
    $scope.newFeatureCategory = function (selectedObj) {
        if (selectedObj) {
            $rootScope.selectedId = selectedObj._id;
        }
        $location.path(ROLE.URL_PATH.FEATURECATEGORYCREATE);
    };
    $scope.featureCategoryDetails = function (featureCategory) {
        $scope.featureCategory = featureCategory;
        $location.path('/admin/featurecategory/' + featureCategory._id + '/details');
    };

    $scope.editFeatureCategory = function (urlPath, id) {
        urlPath = urlPath.replace(":featureCategoryId", id);
        $location.path(urlPath);
    };
});