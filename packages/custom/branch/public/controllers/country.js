'use strict';

/* jshint -W098 */

angular.module('mean.branch').controller('CountryController', function ($scope, $rootScope, $stateParams, $location, Global, CountryService, UserService, BRANCH, $http, flash, MESSAGES,$uibModal,$translate) {
    $scope.global = Global;
    $scope.MESSAGES = MESSAGES;

    $scope.package = {
        name: 'branch',
        modelName: 'Country',
        featureName: 'Locations'
    };
    $scope.BRANCH = BRANCH;
    initializePermission($scope, $rootScope, $location, flash, $scope.package.featureName, MESSAGES);
    initializeBreadCrum($scope, $scope.package.modelName, BRANCH.URL_PATH.LISTCOUNTRY,'Countries','Location Management');
    initializePagination($scope, $rootScope, CountryService);
    initializeDeletePopup($scope, $scope.package.modelName, MESSAGES,$uibModal);
    initializeAdminList($scope, $rootScope,UserService);

    $scope.MESSAGES = MESSAGES;

    $scope.newCountry = function () {
        $location.path(BRANCH.URL_PATH.CREATECOUNTRY);
    };

    $scope.createCountry = function () {
        $scope.adminList();
        $scope.breadCrumAdd("Create");
        $scope.country = {};
        $scope.mainObject=$scope.country;
        $scope.country.adminList = [];
    };

    $scope.findOne = function () {
        $scope.country = {};
        if ($scope.updatePermission) {
            $scope.adminList();
            CountryService.country.get({
                countryId: $stateParams.countryId
            }, function (country) {
                $scope.country = country;
                $scope.mainObject=$scope.country;
                $scope.breadCrumAdd("Edit");
                $scope.countryAdminList($scope.mainObject,{'country': $scope.country._id});
            });
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED, MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };

    $scope.create = function (isValid) {
        if ($scope.writePermission) {
            if (isValid) {
                var country = new CountryService.country($scope.country);
                country.$save(function (response) {
                    flash.setMessage(MESSAGES.ROLE_ADD_SUCCESS, MESSAGES.SUCCESS);
                    $location.path(BRANCH.URL_PATH.LISTCOUNTRY);
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

    $scope.remove = function (Country) {
        if (Country && $scope.deletePermission) {
            var Country = new CountryService.country(Country);
            Country.$remove(function (response) {
                deleteObjectFromArray($scope.collection, Country);
                $('#deletePopup').modal("hide");
                flash.setMessage(MESSAGES.COUNTRY_DELETE_SUCCESS, MESSAGES.SUCCESS);
                $location.path(BRANCH.URL_PATH.LISTCOUNTRY);
            });
        } else {
            flash.setMessage(MESSAGES.PERMISSION_DENIED,MESSAGES.ERROR);
            $location.path(MESSAGES.DASHBOARD_URL);
        }
    };

    $scope.update = function (isValid) {
        if ($scope.updatePermission) {
            if (isValid) {
                var country = new CountryService.country($scope.country);
                if (!country.updated) {
                    country.updated = [];
                }
                country.updated.push(new Date().getTime());
                console.log(country);
                country.$update({countryId: $stateParams.countryId}, function () {
                    flash.setMessage(MESSAGES.COUNTRY_UPDATE_SUCCESS, MESSAGES.SUCCESS);
                    $location.path(BRANCH.URL_PATH.LISTCOUNTRY);
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

    $scope.show = function (urlPath, country) {
        $rootScope.country = country;
        urlPath = urlPath.replace(":countryId", country._id);
        $location.path(urlPath);
    }

    $scope.zoneList = function (urlPath, country) {
        $rootScope.country = country;
        urlPath = urlPath.replace(":countryId", country._id);
        $location.path(urlPath);
    }


    $scope.cancel = function () {
        $location.path(BRANCH.URL_PATH.LISTCOUNTRY);
    };

    $scope.modalDeletePopup = function (country) {
        $scope.deleteObj=country;
        $scope.removepop(country._id);
    };

    $scope.removepop = function (countryId) {
        UserService.users.query({'country': countryId}, function (userList) {
            if(userList.length == 0){
                $scope.popupMessage = "0 Users are assigned would you like to delete country?";
            }else{
                $scope.popupMessage = (userList.length)+ "  Users are assigned to this country. Do you really want to delete this country ? This action cannot be undone."
            }
            $('#deletePopup').modal("show");
        });
    };

    $scope.editCountry = function (urlPath, id) {
        urlPath = urlPath.replace(":countryId", id);
        $location.path(urlPath);
    };
});
