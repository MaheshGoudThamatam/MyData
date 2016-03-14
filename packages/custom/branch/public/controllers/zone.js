'use strict';

/* jshint -W098 */

angular.module('mean.branch').controller('ZoneController', function ($scope, $rootScope, $stateParams, $location, Global, ZoneService, UserService, BRANCH, flash, MESSAGES,$uibModal,$translate) {
    $scope.global = Global;
    $scope.package = {
        name: 'branch',
        name1: 'Country',
        modelName: 'Zone',
        featureName: 'Locations'
    };
    $scope.BRANCH = BRANCH;
    $scope.MESSAGES = MESSAGES;
    initializeBreadCrum($scope, $scope.package.name1, BRANCH.URL_PATH.LISTCOUNTRY,'Zones','Location Management');
    initializeDeletePopup($scope, $scope.package.modelName, MESSAGES,$uibModal);
    initializePagination($scope, $rootScope, ZoneService);
    initializePermission($scope, $rootScope, $location, flash, $scope.package.featureName, MESSAGES);
    initializeAdminList($scope, $rootScope, UserService);

    $scope.createZone = function () {
        $scope.adminList();
        var countryId = $stateParams.countryId;
        $scope.breadCrumAddUrl($scope.package.modelName, BRANCH.URL_PATH.LISTZONE.replace(':countryId', countryId));
        $scope.breadCrumAppend("Create");
        $scope.zone = {};
        $scope.mainObject = $scope.zone;
        $scope.zone.adminList = [];
    };

    $scope.newZone = function (urlPath, countryId) {
        $scope.countryId = $rootScope.countryId;
        urlPath = urlPath.replace(":countryId", countryId);
        $location.path(urlPath);
    };

    $scope.listZone = function () {
        var countryId = $stateParams.countryId;
        $scope.countryId = countryId;
        $rootScope.countryId = $scope.countryId;
        $scope.list({country: $scope.countryId});
        $scope.breadCrumAddUrl($scope.package.modelName, BRANCH.URL_PATH.LISTZONE.replace(':countryId', countryId));
        $scope.breadCrumAppend("List");
    };

    $scope.findOne = function () {
        $scope.zone = {};
        if ($scope.updatePermission) {
            $scope.adminList();
            ZoneService.zone.get({
                zoneId: $stateParams.zoneId
            }, function (zone) {
                $scope.zone = zone;
                $scope.mainObject = $scope.zone;
                $scope.countryId = $scope.zone.country._id;
                $rootScope.countryId = $scope.countryId;
                $scope.breadCrumAddUrl($scope.package.modelName, BRANCH.URL_PATH.LISTZONE.replace(':countryId', $rootScope.countryId));
                $scope.breadCrumAppend("Edit");
                $scope.countryAdminList($scope.mainObject, {'zone': $scope.zone._id});
            });
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };

    $scope.create = function (urlPath, isValid) {
        if ($scope.writePermission) {
            if (isValid) {
                $scope.zone.countryId = $scope.countryId;
                var zone = new ZoneService.countryZone($scope.zone);
                zone.$save(function (response) {
                    urlPath = urlPath.replace(":countryId", $scope.countryId);
                    flash.setMessage(MESSAGES.ZONE_ADD_SUCCESS, MESSAGES.SUCCESS);
                    $scope.breadCrumAdd("Create");
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


    $scope.remove = function (Zone) {
        if (Zone && $scope.deletePermission) {
            var Zone = new ZoneService.zone(Zone);
            Zone.$remove(function (response) {
                deleteObjectFromArray($scope.collection, Zone);
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
            $scope.countryId = $rootScope.countryId;
            if (isValid) {
                var countryId = $scope.countryId;
                var zone = new ZoneService.zone($scope.zone);
                if (!zone.updated) {
                    zone.updated = [];
                }
                zone.updated.push(new Date().getTime());

                zone.$update({
                    zoneId: $stateParams.zoneId
                }, function () {
                    urlPath = urlPath.replace(":countryId", countryId);
                    flash.setMessage(MESSAGES.ZONE_UPDATE_SUCCESS, MESSAGES.SUCCESS);
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

    $scope.cancel = function (urlPath, countryId) {
        urlPath = urlPath.replace(":countryId", countryId);
        $location.path(urlPath);
    };

    $scope.cancelEdit = function (urlPath, countryId) {
        urlPath = urlPath.replace(":countryId", countryId._id);
        $location.path(urlPath);
    };

    $scope.modalDeleteZone = function (zone) {
        $scope.deleteObj = zone;
        $scope.removepop(zone._id);
    };


    $scope.removepop = function (zoneId) {
        UserService.users.query({'zone': zoneId}, function (userList) {
            if (userList.length == 0) {
                $scope.popupMessage = "0 Users are assigned would you like to delete zone?";
            } else {
                $scope.popupMessage = (userList.length) + "  Users are assigned to this zone. Do you really want to delete this zone ? This action cannot be undone."
            }
            $('#deletePopup').modal("show");
        });
    };

    $scope.cancelZone = function () {
        $('#deleteZone').modal("hide");
    };

    $scope.editZone = function (urlPath, id) {
        urlPath = urlPath.replace(":zoneId", id);
        $location.path(urlPath);
    };

    $scope.cityList = function (urlPath, zone) {
        $rootScope.zone = zone;
        urlPath = urlPath.replace(":zoneId", zone._id);
        $location.path(urlPath);
    };
});
