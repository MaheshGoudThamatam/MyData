'use strict';

/* jshint -W098 */

angular.module('mean.branch').controller('CityController', function ($scope, $rootScope, $stateParams, $location, Global, CityService, UserService, BRANCH, MESSAGES, flash,$uibModal,$translate) {
    $scope.global = Global;
    $scope.package = {
        name: 'branch',
        featureName: 'Locations',
        name1: 'Country',
        name2: 'Zone',
        modelName: 'City'

    };

    $scope.BRANCH = BRANCH;
    $scope.MESSAGES = MESSAGES;

    initializePermission($scope, $rootScope, $location, flash, $scope.package.featureName, MESSAGES);
    initializeBreadCrum($scope, $scope.package.name1, BRANCH.URL_PATH.LISTCOUNTRY,'Cities','Location Management');
    initializeDeletePopup($scope, $scope.package.modelName, MESSAGES,$uibModal);
    initializePagination($scope, $rootScope, CityService);
    initializeAdminList($scope, $rootScope, UserService);


    $scope.createCity = function () {
        $scope.adminList();
        var zoneId = $stateParams.zoneId;
        $scope.breadCrumAddUrl($scope.package.name2, BRANCH.URL_PATH.LISTZONE.replace(':countryId', $rootScope.countryId));
        $scope.breadCrumAppendUrl($scope.package.modelName, BRANCH.URL_PATH.LISTCITY.replace(':zoneId', zoneId));
        $scope.breadCrumAppend("Create");
        $scope.city = {};
        $scope.mainObject = $scope.city;
        $scope.city.adminList = [];
    };

    $scope.listCity = function () {
        var zoneId = $stateParams.zoneId;
        $scope.zoneId = zoneId;
        $rootScope.zoneId = $scope.zoneId;
        $scope.list({zone: $scope.zoneId});
        $scope.breadCrumAddUrl($scope.package.name2, BRANCH.URL_PATH.LISTZONE.replace(':countryId', $rootScope.countryId));
        $scope.breadCrumAppendUrl($scope.package.modelName, BRANCH.URL_PATH.LISTCITY.replace(':zoneId', zoneId));
        $scope.breadCrumAppend("List");
    };


    $scope.newCity = function (urlPath, zoneId) {
        $scope.zoneId = $rootScope.zoneId;
        urlPath = urlPath.replace(":zoneId", zoneId);
        $location.path(urlPath);
    };

    $scope.create = function (urlPath, isValid) {
        if ($scope.writePermission) {
            var zoneId = $scope.zoneId;
            if (isValid) {
                $scope.city.zoneId = $scope.zoneId;
                var city = new CityService.zoneCity($scope.city);
                city.$save(function (response) {
                    urlPath = urlPath.replace(":zoneId", zoneId);
                    flash.setMessage(MESSAGES.CITY_ADD_SUCCESS,MESSAGES.SUCCESS);
                    $location.path(urlPath);
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

    $scope.remove = function (City) {
        if (City && $scope.deletePermission) {
            City = new CityService.city(City);
            City.$remove(function (response) {
                deleteObjectFromArray($scope.collection, City);
                $('#deletePopup').modal("hide");
                flash.setMessage(MESSAGES.ZONE_DELETE_SUCCESS, MESSAGES.SUCCESS);
            });
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };

    $scope.update = function (urlPath, isValid) {
        if ($scope.updatePermission) {
            $scope.zoneId = $rootScope.zoneId;
            if (isValid) {
                var zoneId = $scope.zoneId;
                var city = new CityService.city($scope.city);
                if (!city.updated) {
                    city.updated = [];
                }
                city.updated.push(new Date().getTime());

                city.$update({
                    cityId: $stateParams.cityId
                }, function () {
                    urlPath = urlPath.replace(":zoneId", zoneId);
                    flash.setMessage(MESSAGES.CITY_UPDATE_SUCCESS,MESSAGES.SUCCESS);
                    $location.path(urlPath);
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
        $scope.city={}
        if ($scope.updatePermission) {
            $scope.adminList();
            CityService.city.get({
                cityId: $stateParams.cityId
            }, function (city) {
                $scope.city = city;
                $scope.mainObject = $scope.city;
                $scope.zoneId = $scope.city.zone;
                $scope.breadCrumAddUrl($scope.package.name2, BRANCH.URL_PATH.LISTZONE.replace(':countryId', $rootScope.countryId));
                $scope.breadCrumAppendUrl($scope.package.modelName, BRANCH.URL_PATH.LISTCITY.replace(':zoneId', $rootScope.zoneId));
                $scope.breadCrumAppend("Edit");
                $scope.countryAdminList($scope.mainObject, {'city': $scope.city._id});
            });
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };

    $scope.cancel = function (urlPath, zoneId) {
        urlPath = urlPath.replace(":zoneId", zoneId);
        $location.path(urlPath);
    };

    $scope.modalDeleteCity = function (city) {
        $scope.deleteObj = city;
        $scope.removepop(city._id);
    };

    $scope.removepop = function (cityId) {
        UserService.users.query({'city': cityId}, function (userList) {
            if (userList.length == 0) {
                $scope.popupMessage = "0 Users are assigned would you like to delete city?";
            } else {
                $scope.popupMessage = (userList.length) + "  Users are assigned to this city. Do you really want to delete this city ? This action cannot be undone."
            }
            $('#deletePopup').modal("show");
        });
    };

    $scope.cancelCity = function () {
        $('#deleteCity').modal("hide");
    }

    $scope.editCity = function (urlPath, id) {
        urlPath = urlPath.replace(":cityId", id);
        $location.path(urlPath);
    };

    $scope.branchList = function (urlPath, city) {
        $rootScope.city = city;
        urlPath = urlPath.replace(":cityId", city._id);
        $location.path(urlPath);
    };

});

